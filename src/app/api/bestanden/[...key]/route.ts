import { NextResponse, type NextRequest } from "next/server";
import { handtekeningGeldig, isPubliekeKey, leesBestand } from "@/lib/storage/postgres";

/**
 * Serveert opgeslagen bestanden. Publieke bestanden (`public/…`, zoals
 * profielfoto's) zijn vrij en lang cachebaar - elke upload krijgt een nieuwe
 * sleutel. Privébestanden vereisen een geldige, kort geldige handtekening
 * (zie StorageProvider.signedUrl) en worden nooit gecachet.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ key: string[] }> },
): Promise<NextResponse> {
  const { key: delen } = await ctx.params;
  const key = delen.map((d) => decodeURIComponent(d)).join("/");
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "Ongeldige sleutel" }, { status: 400 });
  }

  const publiek = isPubliekeKey(key);
  if (!publiek) {
    const exp = Number(req.nextUrl.searchParams.get("exp"));
    const sig = req.nextUrl.searchParams.get("sig") ?? "";
    if (!sig || !handtekeningGeldig(key, exp, sig)) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }
  }

  const bestand = await leesBestand(key);
  if (!bestand || bestand.publiek !== publiek) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  return new NextResponse(Buffer.from(bestand.data), {
    status: 200,
    headers: {
      "Content-Type": bestand.mime,
      "Content-Length": String(bestand.grootte),
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": publiek ? "inline" : "attachment",
      "Cache-Control": publiek
        ? "public, max-age=31536000, immutable"
        : "private, no-store",
    },
  });
}
