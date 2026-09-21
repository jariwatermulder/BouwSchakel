"use server";

import { redirect } from "next/navigation";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { companySchema } from "@/lib/validations/company";
import { bedrijfCompleet, getOrCreateCompanyForUser, updateCompany } from "@/server/company/service";
import { trackEvent } from "@/lib/analytics/track";
import { safeNextPath } from "@/lib/auth/next";
import { controleerKvk, kvkOpslagVelden } from "@/server/kvk/service";
import { kvkBlokkeert } from "@/lib/kvk";

export interface CompanyFormState {
  error?: string;
  ok?: boolean;
  /** Ingevulde waarden bij een fout, zodat het formulier ze niet kwijtraakt. */
  waarden?: Partial<Record<CompanyVeld, string>>;
}

export type CompanyVeld =
  | "naam"
  | "kvkNummer"
  | "contactpersoon"
  | "telefoon"
  | "website"
  | "regio"
  | "typeWerkzaamheden"
  | "omschrijving";

const VELDEN: CompanyVeld[] = ["naam", "kvkNummer", "contactpersoon", "telefoon", "website", "regio", "typeWerkzaamheden", "omschrijving"];

function ingevuld(formData: FormData): Partial<Record<CompanyVeld, string>> {
  const w: Partial<Record<CompanyVeld, string>> = {};
  for (const veld of VELDEN) {
    const v = formData.get(veld);
    if (typeof v === "string") w[veld] = v;
  }
  return w;
}

export async function saveCompany(
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const user = await requireCurrentRole("COMPANY");
  const waarden = ingevuld(formData);
  const parsed = companySchema.safeParse(waarden);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Controleer de velden.",
      waarden,
    };
  }

  // KvK-nummer controleren in het Handelsregister (als de KvK-API is ingesteld).
  const kvk = await controleerKvk(parsed.data.kvkNummer);
  await trackEvent("kvk_checked", {
    userId: user.id,
    userRole: user.role,
    page: "/bedrijven/registreren",
    metadata: { status: kvk.status, bron: "opslaan", test: kvk.test ?? false },
  });
  if (kvkBlokkeert(kvk)) {
    return { error: "Dit KvK-nummer staat niet in het Handelsregister. Controleer het nummer.", waarden };
  }

  const voorheen = await getOrCreateCompanyForUser(user.id);
  const wasCompleet = bedrijfCompleet(voorheen);
  await updateCompany(user.id, {
    naam: parsed.data.naam,
    kvkNummer: parsed.data.kvkNummer,
    ...kvkOpslagVelden(kvk),
    contactpersoon: parsed.data.contactpersoon ?? null,
    telefoon: parsed.data.telefoon ?? null,
    website: parsed.data.website ?? null,
    regio: parsed.data.regio ?? null,
    typeWerkzaamheden: parsed.data.typeWerkzaamheden ?? null,
    omschrijving: parsed.data.omschrijving ?? null,
  });

  if (!wasCompleet) {
    await trackEvent("company_profile_completed", {
      userId: user.id,
      userRole: user.role,
      page: "/bedrijven/registreren",
      metadata: { regio: parsed.data.regio ?? null },
    });
  }

  // Terug naar de gekozen bestemming (bijv. een zzp-profiel om contact mee
  // op te nemen) als die is meegegeven.
  const next = safeNextPath(formData.get("next"));
  if (next) redirect(next);

  const nieuw = formData.get("onboarding") === "1";
  if (nieuw) redirect("/vind-zzper");
  return { ok: true };
}
