"use server";

import { redirect } from "next/navigation";
import { requireCurrentRole } from "@/lib/auth/current-user";
import {
  bedrijfSchema,
  certificatenSchema,
  ervaringSchema,
  materieelSchema,
  persoonlijkSchema,
  specialisatieSchema,
  tariefSchema,
  vakgebiedSchema,
  werkgebiedSchema,
} from "@/lib/validations/zzp";
import {
  addAvailability,
  addPortfolioItem,
  setCertifications,
  setSkills,
  setSpecializations,
  updateProfileFields,
} from "@/server/zzp/profile";
import { isStapSlug, volgendeStap, type StapSlug } from "./steps";
import {
  leesUploadAfbeelding,
  OngeldigeAfbeeldingError,
  verwerkPortfolioFoto,
} from "@/lib/images";

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

/** Tekst bij "Anders, namelijk…"; alleen meegenomen als het vinkje aanstaat. */
function anders(formData: FormData): string | undefined {
  if (!checkbox(formData, "andersAan")) return undefined;
  const v = formData.get("anders");
  return typeof v === "string" ? v : undefined;
}

/** Vinkje "Anders" aan, maar geen tekst ingevuld. */
function andersLeeg(formData: FormData): boolean {
  return checkbox(formData, "andersAan") && !anders(formData)?.trim();
}

/** Verwerkt één registratiestap en navigeert naar de volgende (of het dashboard). */
export async function saveStap(formData: FormData): Promise<void> {
  const user = await requireCurrentRole("ZZP");
  const stap = formData.get("stap");
  if (typeof stap !== "string" || !isStapSlug(stap)) {
    redirect("/zzpers/registreren");
  }

  const terug = (msg = "1") =>
    redirect(`/zzpers/registreren?stap=${stap}&fout=${msg}`);

  switch (stap as StapSlug) {
    case "persoonlijk": {
      const p = persoonlijkSchema.safeParse({
        voornaam: formData.get("voornaam"),
        achternaam: formData.get("achternaam"),
        telefoon: formData.get("telefoon"),
      });
      if (!p.success) terug();
      else await updateProfileFields(user.id, p.data);
      break;
    }
    case "bedrijf": {
      const p = bedrijfSchema.safeParse({
        bedrijfsnaam: formData.get("bedrijfsnaam"),
        kvkNummer: formData.get("kvkNummer"),
      });
      if (!p.success) terug();
      else await updateProfileFields(user.id, p.data);
      break;
    }
    case "vakgebied": {
      if (andersLeeg(formData)) terug("anders");
      const p = vakgebiedSchema.safeParse({
        skillIds: formData.getAll("skillIds"),
        anders: anders(formData),
      });
      if (!p.success) terug();
      else {
        await updateProfileFields(user.id, { vakgebiedAnders: p.data.anders ?? null });
        await setSkills(user.id, p.data.skillIds);
      }
      break;
    }
    case "specialisatie": {
      if (andersLeeg(formData)) terug("anders");
      const p = specialisatieSchema.safeParse({
        specializationIds: formData.getAll("specializationIds"),
        anders: anders(formData),
      });
      if (!p.success) terug();
      else {
        await updateProfileFields(user.id, { specialisatieAnders: p.data.anders ?? null });
        await setSpecializations(user.id, p.data.specializationIds);
      }
      break;
    }
    case "ervaring": {
      const p = ervaringSchema.safeParse({
        jarenErvaring: formData.get("jarenErvaring"),
        over: formData.get("over"),
      });
      if (!p.success) terug();
      else
        await updateProfileFields(user.id, {
          jarenErvaring: p.data.jarenErvaring,
          over: p.data.over ?? null,
        });
      break;
    }
    case "tarief": {
      const p = tariefSchema.safeParse({
        uurtariefEuro: formData.get("uurtariefEuro"),
      });
      if (!p.success) terug();
      else
        await updateProfileFields(user.id, {
          uurtariefCents: Math.round(p.data.uurtariefEuro * 100),
        });
      break;
    }
    case "werkgebied": {
      const p = werkgebiedSchema.safeParse({
        werkgebiedPlaats: formData.get("werkgebiedPlaats"),
        maxReisafstandKm: formData.get("maxReisafstandKm"),
      });
      if (!p.success) terug();
      else await updateProfileFields(user.id, p.data);
      break;
    }
    case "beschikbaarheid": {
      const startRaw = formData.get("startdatum");
      const vanRaw = formData.get("van");
      if (typeof startRaw === "string" && startRaw) {
        await updateProfileFields(user.id, { startdatum: new Date(startRaw) });
      }
      if (typeof vanRaw === "string" && vanRaw) {
        const totRaw = formData.get("tot");
        const typeRaw = formData.get("type");
        await addAvailability(user.id, {
          van: new Date(vanRaw),
          tot:
            typeof totRaw === "string" && totRaw ? new Date(totRaw) : undefined,
          type:
            typeRaw === "PARTTIME" || typeRaw === "INCIDENTEEL"
              ? typeRaw
              : "FULLTIME",
        });
      }
      break;
    }
    case "materieel": {
      const p = materieelSchema.safeParse({
        eigenBus: checkbox(formData, "eigenBus"),
        eigenGereedschap: checkbox(formData, "eigenGereedschap"),
        vca: checkbox(formData, "vca"),
      });
      if (!p.success) terug();
      else await updateProfileFields(user.id, p.data);
      break;
    }
    case "certificaten": {
      if (andersLeeg(formData)) terug("anders");
      const p = certificatenSchema.safeParse({
        certificationIds: formData.getAll("certificationIds"),
        anders: anders(formData),
      });
      if (!p.success) terug();
      else {
        await updateProfileFields(user.id, { certificatenAnders: p.data.anders ?? null });
        await setCertifications(user.id, p.data.certificationIds);
      }
      break;
    }
    case "portfolio": {
      const titel = formData.get("titel");
      if (typeof titel === "string" && titel.trim()) {
        const omschrijving = formData.get("omschrijving");
        let afbeelding: Buffer | null = null;
        try {
          const ruw = await leesUploadAfbeelding(formData.get("afbeelding"));
          if (ruw) afbeelding = await verwerkPortfolioFoto(ruw);
        } catch (err) {
          if (err instanceof OngeldigeAfbeeldingError) terug("foto");
          throw err;
        }
        await addPortfolioItem(user.id, {
          titel: titel.trim(),
          omschrijving:
            typeof omschrijving === "string" && omschrijving.trim()
              ? omschrijving.trim()
              : undefined,
          afbeelding,
        });
      }
      break;
    }
  }

  const next = volgendeStap(stap as StapSlug);
  if (next) redirect(`/zzpers/registreren?stap=${next}`);
  // Klaar met deze groep: laat het profiel zien zodat de zzp'er ziet hoe het
  // eruitziet en wat er eventueel nog aangevuld kan worden.
  redirect("/zzpers/profiel");
}
