"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  createFactuur,
  dupliceerFactuur,
  setFactuurStatus,
  verstuurFactuur,
} from "@/server/facturen/service";

export type FactuurFormState = { error?: string };

const BASISPADEN = ["/zzpers/facturen", "/bedrijven/facturen"] as const;
type Basispad = (typeof BASISPADEN)[number];
function veiligPad(v: unknown): Basispad {
  return BASISPADEN.includes(v as Basispad) ? (v as Basispad) : "/zzpers/facturen";
}

const regelSchema = z.object({
  omschrijving: z.string().max(300),
  aantal: z.number().min(0).max(1000000),
  eenheid: z.string().max(30).nullable().optional(),
  tarief: z.number().min(-1000000).max(1000000),
  btw: z.number(),
});

const inputSchema = z.object({
  assignmentId: z.string().optional(),
  factuurnummer: z.string().min(1).max(40),
  factuurdatum: z.string().min(1),
  vervaldatum: z.string().optional(),
  betaaltermijnDagen: z.string().optional(),
  betaalreferentie: z.string().max(60).optional(),
  btwVerlegd: z.string().optional(),
  afzenderNaam: z.string().min(1).max(160),
  afzenderAdres: z.string().max(200).optional(),
  afzenderPostcode: z.string().max(20).optional(),
  afzenderPlaats: z.string().max(100).optional(),
  afzenderKvk: z.string().max(40).optional(),
  afzenderBtwId: z.string().max(40).optional(),
  afzenderIban: z.string().max(40).optional(),
  afzenderEmail: z.string().max(160).optional(),
  afzenderTelefoon: z.string().max(40).optional(),
  afzenderWebsite: z.string().max(120).optional(),
  klantNaam: z.string().min(1).max(160),
  klantContactpersoon: z.string().max(120).optional(),
  klantAdres: z.string().max(200).optional(),
  klantPostcode: z.string().max(20).optional(),
  klantPlaats: z.string().max(100).optional(),
  klantEmail: z.string().max(160).optional(),
  klantKvk: z.string().max(40).optional(),
  klantBtwId: z.string().max(40).optional(),
  opmerking: z.string().max(1000).optional(),
  lines: z.array(regelSchema).min(1).max(80),
});

function datumUit(s: string): Date | null {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
const s = (fd: FormData, k: string) => (fd.get(k) as string) || undefined;

export async function createFactuurAction(
  _prev: FactuurFormState,
  formData: FormData,
): Promise<FactuurFormState> {
  const user = await requireCurrentUser();
  const basisPad = veiligPad(formData.get("basisPad"));

  let parsed: z.infer<typeof inputSchema>;
  try {
    parsed = inputSchema.parse({
      assignmentId: s(formData, "assignmentId"),
      factuurnummer: formData.get("factuurnummer"),
      factuurdatum: formData.get("factuurdatum"),
      vervaldatum: s(formData, "vervaldatum"),
      betaaltermijnDagen: s(formData, "betaaltermijnDagen"),
      betaalreferentie: s(formData, "betaalreferentie"),
      btwVerlegd: s(formData, "btwVerlegd"),
      afzenderNaam: formData.get("afzenderNaam"),
      afzenderAdres: s(formData, "afzenderAdres"),
      afzenderPostcode: s(formData, "afzenderPostcode"),
      afzenderPlaats: s(formData, "afzenderPlaats"),
      afzenderKvk: s(formData, "afzenderKvk"),
      afzenderBtwId: s(formData, "afzenderBtwId"),
      afzenderIban: s(formData, "afzenderIban"),
      afzenderEmail: s(formData, "afzenderEmail"),
      afzenderTelefoon: s(formData, "afzenderTelefoon"),
      afzenderWebsite: s(formData, "afzenderWebsite"),
      klantNaam: formData.get("klantNaam"),
      klantContactpersoon: s(formData, "klantContactpersoon"),
      klantAdres: s(formData, "klantAdres"),
      klantPostcode: s(formData, "klantPostcode"),
      klantPlaats: s(formData, "klantPlaats"),
      klantEmail: s(formData, "klantEmail"),
      klantKvk: s(formData, "klantKvk"),
      klantBtwId: s(formData, "klantBtwId"),
      opmerking: s(formData, "opmerking"),
      lines: JSON.parse((formData.get("linesJson") as string) || "[]"),
    });
  } catch {
    return { error: "Controleer de ingevulde gegevens en probeer opnieuw." };
  }

  const factuurdatum = datumUit(parsed.factuurdatum);
  if (!factuurdatum) return { error: "Ongeldige factuurdatum." };
  const vervaldatum = parsed.vervaldatum ? datumUit(parsed.vervaldatum) : null;
  const termijn = parsed.betaaltermijnDagen ? Number(parsed.betaaltermijnDagen) : null;

  let id: string;
  try {
    id = await createFactuur(user.id, {
      assignmentId: parsed.assignmentId ?? null,
      factuurnummer: parsed.factuurnummer,
      factuurdatum,
      vervaldatum,
      betaaltermijnDagen: termijn != null && !Number.isNaN(termijn) ? termijn : null,
      betaalreferentie: parsed.betaalreferentie ?? null,
      btwVerlegd: parsed.btwVerlegd === "1",
      afzenderNaam: parsed.afzenderNaam,
      afzenderAdres: parsed.afzenderAdres ?? null,
      afzenderPostcode: parsed.afzenderPostcode ?? null,
      afzenderPlaats: parsed.afzenderPlaats ?? null,
      afzenderKvk: parsed.afzenderKvk ?? null,
      afzenderBtwId: parsed.afzenderBtwId ?? null,
      afzenderIban: parsed.afzenderIban ?? null,
      afzenderEmail: parsed.afzenderEmail ?? null,
      afzenderTelefoon: parsed.afzenderTelefoon ?? null,
      afzenderWebsite: parsed.afzenderWebsite ?? null,
      klantNaam: parsed.klantNaam,
      klantContactpersoon: parsed.klantContactpersoon ?? null,
      klantAdres: parsed.klantAdres ?? null,
      klantPostcode: parsed.klantPostcode ?? null,
      klantPlaats: parsed.klantPlaats ?? null,
      klantEmail: parsed.klantEmail ?? null,
      klantKvk: parsed.klantKvk ?? null,
      klantBtwId: parsed.klantBtwId ?? null,
      opmerking: parsed.opmerking ?? null,
      lines: parsed.lines.map((r) => ({
        omschrijving: r.omschrijving,
        aantal: r.aantal,
        eenheid: r.eenheid ?? null,
        tariefCents: Math.round(r.tarief * 100),
        btwPercentage: r.btw,
      })),
    });
  } catch {
    return { error: "Kon de factuur niet opslaan. Probeer het opnieuw." };
  }

  redirect(`${basisPad}/${id}`);
}

const STATUSSEN = [
  "CONCEPT",
  "VERSTUURD",
  "GEOPEND",
  "BETAALD",
  "TE_LAAT",
  "GEANNULEERD",
] as const;

export async function setStatusAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const basisPad = veiligPad(formData.get("basisPad"));
  if (!id || !STATUSSEN.includes(status as (typeof STATUSSEN)[number])) return;
  await setFactuurStatus(user.id, id, status as (typeof STATUSSEN)[number]);
  revalidatePath(`${basisPad}/${id}`);
  revalidatePath(basisPad);
}

export async function verstuurFactuurAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "");
  const basisPad = veiligPad(formData.get("basisPad"));
  if (!id) return;
  const res = await verstuurFactuur(user.id, id);
  revalidatePath(`${basisPad}/${id}`);
  revalidatePath(basisPad);
  redirect(
    `${basisPad}/${id}?${res.ok ? "verstuurd=1" : `fout=${encodeURIComponent(res.error ?? "")}`}`,
  );
}

export async function dupliceerFactuurAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "");
  const basisPad = veiligPad(formData.get("basisPad"));
  if (!id) return;
  const nieuwId = await dupliceerFactuur(user.id, id);
  revalidatePath(basisPad);
  if (nieuwId) redirect(`${basisPad}/${nieuwId}`);
  redirect(`${basisPad}/${id}`);
}
