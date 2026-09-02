import { requireCurrentUser } from "@/lib/auth/current-user";
import { getFactuur } from "@/server/facturen/service";
import { genereerFactuurPdf } from "@/server/facturen/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const factuur = await getFactuur(user.id, id);
  if (!factuur) {
    return new Response("Niet gevonden", { status: 404 });
  }

  const pdf = await genereerFactuurPdf({
    factuurnummer: factuur.factuurnummer,
    factuurdatum: factuur.factuurdatum,
    vervaldatum: factuur.vervaldatum,
    afzenderNaam: factuur.afzenderNaam,
    afzenderAdres: factuur.afzenderAdres,
    afzenderPostcode: factuur.afzenderPostcode,
    afzenderPlaats: factuur.afzenderPlaats,
    afzenderKvk: factuur.afzenderKvk,
    afzenderBtwId: factuur.afzenderBtwId,
    afzenderIban: factuur.afzenderIban,
    afzenderEmail: factuur.afzenderEmail,
    klantNaam: factuur.klantNaam,
    klantAdres: factuur.klantAdres,
    klantPostcode: factuur.klantPostcode,
    klantPlaats: factuur.klantPlaats,
    klantEmail: factuur.klantEmail,
    klantKvk: factuur.klantKvk,
    btwPercentage: factuur.btwPercentage,
    subtotaalCents: factuur.subtotaalCents,
    btwCents: factuur.btwCents,
    totaalCents: factuur.totaalCents,
    opmerking: factuur.opmerking,
    lines: factuur.lines,
  });

  const bestandsnaam = `factuur-${factuur.factuurnummer}.pdf`.replace(
    /[^a-zA-Z0-9.\-]/g,
    "_",
  );

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${bestandsnaam}"`,
      "Cache-Control": "no-store",
    },
  });
}
