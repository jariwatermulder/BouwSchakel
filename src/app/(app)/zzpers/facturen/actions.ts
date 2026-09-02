"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { createFactuur } from "@/server/facturen/service";

export type FactuurFormState = { error?: string };

const regelSchema = z.object({
  omschrijving: z.string().max(300),
  aantal: z.number().min(0).max(100000),
  tarief: z.number().min(0).max(1000000), // euro
});

const inputSchema = z.object({
  assignmentId: z.string().optional(),
  factuurnummer: z.string().min(1).max(40),
  factuurdatum: z.string().min(1),
  vervaldatum: z.string().optional(),
  afzenderNaam: z.string().min(1).max(160),
  afzenderAdres: z.string().max(200).optional(),
  afzenderPostcode: z.string().max(20).optional(),
  afzenderPlaats: z.string().max(100).optional(),
  afzenderKvk: z.string().max(40).optional(),
  afzenderBtwId: z.string().max(40).optional(),
  afzenderIban: z.string().max(40).optional(),
  afzenderEmail: z.string().max(160).optional(),
  klantNaam: z.string().min(1).max(160),
  klantAdres: z.string().max(200).optional(),
  klantPostcode: z.string().max(20).optional(),
  klantPlaats: z.string().max(100).optional(),
  klantEmail: z.string().max(160).optional(),
  klantKvk: z.string().max(40).optional(),
  btwPercentage: z.number(),
  opmerking: z.string().max(1000).optional(),
  lines: z.array(regelSchema).min(1).max(50),
});

function datumUitString(s: string): Date | null {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createFactuurAction(
  _prev: FactuurFormState,
  formData: FormData,
): Promise<FactuurFormState> {
  const user = await requireCurrentUser();

  let parsed: z.infer<typeof inputSchema>;
  try {
    const raw = {
      assignmentId: (formData.get("assignmentId") as string) || undefined,
      factuurnummer: formData.get("factuurnummer"),
      factuurdatum: formData.get("factuurdatum"),
      vervaldatum: (formData.get("vervaldatum") as string) || undefined,
      afzenderNaam: formData.get("afzenderNaam"),
      afzenderAdres: (formData.get("afzenderAdres") as string) || undefined,
      afzenderPostcode: (formData.get("afzenderPostcode") as string) || undefined,
      afzenderPlaats: (formData.get("afzenderPlaats") as string) || undefined,
      afzenderKvk: (formData.get("afzenderKvk") as string) || undefined,
      afzenderBtwId: (formData.get("afzenderBtwId") as string) || undefined,
      afzenderIban: (formData.get("afzenderIban") as string) || undefined,
      afzenderEmail: (formData.get("afzenderEmail") as string) || undefined,
      klantNaam: formData.get("klantNaam"),
      klantAdres: (formData.get("klantAdres") as string) || undefined,
      klantPostcode: (formData.get("klantPostcode") as string) || undefined,
      klantPlaats: (formData.get("klantPlaats") as string) || undefined,
      klantEmail: (formData.get("klantEmail") as string) || undefined,
      klantKvk: (formData.get("klantKvk") as string) || undefined,
      btwPercentage: Number(formData.get("btwPercentage") ?? 21),
      opmerking: (formData.get("opmerking") as string) || undefined,
      lines: JSON.parse((formData.get("linesJson") as string) || "[]"),
    };
    parsed = inputSchema.parse(raw);
  } catch {
    return { error: "Controleer de ingevulde gegevens en probeer opnieuw." };
  }

  const factuurdatum = datumUitString(parsed.factuurdatum);
  if (!factuurdatum) return { error: "Ongeldige factuurdatum." };
  const vervaldatum = parsed.vervaldatum
    ? datumUitString(parsed.vervaldatum)
    : null;

  let id: string;
  try {
    id = await createFactuur(user.id, {
      assignmentId: parsed.assignmentId ?? null,
      factuurnummer: parsed.factuurnummer,
      factuurdatum,
      vervaldatum,
      afzenderNaam: parsed.afzenderNaam,
      afzenderAdres: parsed.afzenderAdres ?? null,
      afzenderPostcode: parsed.afzenderPostcode ?? null,
      afzenderPlaats: parsed.afzenderPlaats ?? null,
      afzenderKvk: parsed.afzenderKvk ?? null,
      afzenderBtwId: parsed.afzenderBtwId ?? null,
      afzenderIban: parsed.afzenderIban ?? null,
      afzenderEmail: parsed.afzenderEmail ?? null,
      klantNaam: parsed.klantNaam,
      klantAdres: parsed.klantAdres ?? null,
      klantPostcode: parsed.klantPostcode ?? null,
      klantPlaats: parsed.klantPlaats ?? null,
      klantEmail: parsed.klantEmail ?? null,
      klantKvk: parsed.klantKvk ?? null,
      btwPercentage: parsed.btwPercentage,
      opmerking: parsed.opmerking ?? null,
      lines: parsed.lines.map((r) => ({
        omschrijving: r.omschrijving,
        aantal: r.aantal,
        tariefCents: Math.round(r.tarief * 100),
      })),
    });
  } catch {
    return { error: "Kon de factuur niet opslaan. Probeer het opnieuw." };
  }

  redirect(`/zzpers/facturen/${id}`);
}
