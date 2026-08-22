"use server";

import { redirect } from "next/navigation";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { companySchema } from "@/lib/validations/company";
import { updateCompany } from "@/server/company/service";

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

  await updateCompany(user.id, {
    naam: parsed.data.naam,
    kvkNummer: parsed.data.kvkNummer ?? null,
    contactpersoon: parsed.data.contactpersoon ?? null,
    telefoon: parsed.data.telefoon ?? null,
    website: parsed.data.website ?? null,
    regio: parsed.data.regio ?? null,
    typeWerkzaamheden: parsed.data.typeWerkzaamheden ?? null,
    omschrijving: parsed.data.omschrijving ?? null,
  });

  const nieuw = formData.get("onboarding") === "1";
  if (nieuw) redirect("/bedrijven/opdracht-plaatsen");
  return { ok: true };
}
