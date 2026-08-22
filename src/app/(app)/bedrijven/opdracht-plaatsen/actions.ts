"use server";

import { redirect } from "next/navigation";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { jobSchema } from "@/lib/validations/job";
import { getOrCreateCompanyForUser } from "@/server/company/service";
import { createJob } from "@/server/jobs/service";

export interface JobFormState {
  error?: string;
}

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export async function createOpdracht(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const user = await requireCurrentRole("COMPANY");
  const parsed = jobSchema.safeParse({
    skillId: formData.get("skillId"),
    specializationId: formData.get("specializationId"),
    titel: formData.get("titel"),
    locatiePlaats: formData.get("locatiePlaats"),
    locatieAdres: formData.get("locatieAdres"),
    startdatum: formData.get("startdatum"),
    einddatum: formData.get("einddatum") || undefined,
    duurDagen: formData.get("duurDagen") || undefined,
    aantalPersonen: formData.get("aantalPersonen") || 1,
    uurtariefEuro: formData.get("uurtariefEuro") || undefined,
    omschrijving: formData.get("omschrijving"),
    eigenGereedschapGewenst: checkbox(formData, "eigenGereedschapGewenst"),
    contactpersoon: formData.get("contactpersoon"),
    vereistenTekst: formData.get("vereistenTekst"),
    certificationIds: formData.getAll("certificationIds"),
    directPubliceren: checkbox(formData, "directPubliceren"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Controleer de velden.",
    };
  }
  if (parsed.data.einddatum && parsed.data.einddatum < parsed.data.startdatum) {
    return { error: "De einddatum ligt vóór de startdatum." };
  }

  const company = await getOrCreateCompanyForUser(user.id);
  if (company.naam.trim() === "") {
    return { error: "Stel eerst je bedrijfsprofiel in (bedrijfsnaam)." };
  }

  const job = await createJob(user.id, {
    companyId: company.id,
    skillId: parsed.data.skillId,
    specializationId: parsed.data.specializationId,
    titel: parsed.data.titel,
    locatiePlaats: parsed.data.locatiePlaats,
    locatieAdres: parsed.data.locatieAdres,
    startdatum: parsed.data.startdatum,
    einddatum: parsed.data.einddatum,
    duurDagen: parsed.data.duurDagen,
    aantalPersonen: parsed.data.aantalPersonen,
    gewenstUurtariefCents: parsed.data.uurtariefEuro
      ? Math.round(parsed.data.uurtariefEuro * 100)
      : undefined,
    omschrijving: parsed.data.omschrijving,
    eigenGereedschapGewenst: parsed.data.eigenGereedschapGewenst,
    contactpersoon: parsed.data.contactpersoon,
    vereistenTekst: parsed.data.vereistenTekst,
    certificationIds: parsed.data.certificationIds,
    publiceren: parsed.data.directPubliceren,
  });

  redirect(`/bedrijven/opdrachten/${job.id}`);
}
