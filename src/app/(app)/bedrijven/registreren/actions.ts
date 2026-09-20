"use server";

import { redirect } from "next/navigation";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { companySchema } from "@/lib/validations/company";
import { bedrijfCompleet, getOrCreateCompanyForUser, updateCompany } from "@/server/company/service";
import { trackEvent } from "@/lib/analytics/track";
import { safeNextPath } from "@/lib/auth/next";

export interface CompanyFormState {
  error?: string;
  ok?: boolean;
}

export async function saveCompany(
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const user = await requireCurrentRole("COMPANY");
  const parsed = companySchema.safeParse({
    naam: formData.get("naam"),
    kvkNummer: formData.get("kvkNummer"),
    contactpersoon: formData.get("contactpersoon"),
    telefoon: formData.get("telefoon"),
    website: formData.get("website"),
    regio: formData.get("regio"),
    typeWerkzaamheden: formData.get("typeWerkzaamheden"),
    omschrijving: formData.get("omschrijving"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Controleer de velden.",
    };
  }

  const voorheen = await getOrCreateCompanyForUser(user.id);
  const wasCompleet = bedrijfCompleet(voorheen);
  await updateCompany(user.id, {
    naam: parsed.data.naam,
    kvkNummer: parsed.data.kvkNummer,
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
