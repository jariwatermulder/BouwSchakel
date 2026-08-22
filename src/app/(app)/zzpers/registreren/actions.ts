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

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
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
      const p = vakgebiedSchema.safeParse({
        skillIds: formData.getAll("skillIds"),
      });
      if (!p.success) terug();
      else await setSkills(user.id, p.data.skillIds);
      break;
    }
    case "specialisatie": {
      const p = specialisatieSchema.safeParse({
        specializationIds: formData.getAll("specializationIds"),
      });
      if (!p.success) terug();
      else await setSpecializations(user.id, p.data.specializationIds);
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
      const p = certificatenSchema.safeParse({
        certificationIds: formData.getAll("certificationIds"),
      });
      if (!p.success) terug();
      else await setCertifications(user.id, p.data.certificationIds);
      break;
    }
    case "portfolio": {
      const titel = formData.get("titel");
      if (typeof titel === "string" && titel.trim()) {
        const omschrijving = formData.get("omschrijving");
        await addPortfolioItem(user.id, {
          titel: titel.trim(),
          omschrijving:
            typeof omschrijving === "string" && omschrijving.trim()
              ? omschrijving.trim()
              : undefined,
        });
      }
      break;
    }
  }

  const next = volgendeStap(stap as StapSlug);
  if (next) redirect(`/zzpers/registreren?stap=${next}`);
  redirect("/zzpers/dashboard");
}
