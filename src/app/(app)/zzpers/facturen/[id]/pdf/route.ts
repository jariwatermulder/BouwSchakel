import { requireCurrentUser } from "@/lib/auth/current-user";
import { getFactuur, factuurNaarPdfData } from "@/server/facturen/service";
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

  const pdf = await genereerFactuurPdf(factuurNaarPdfData(factuur));

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
