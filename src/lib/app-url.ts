/**
 * Eén bron van waarheid voor de publieke basis-URL (metadata, canonicals,
 * sitemap, robots, structured data, e-maillinks).
 *
 * Productie-origin: https://www.zzpschakel.nl (zonder www wordt naar www
 * doorgestuurd, zie next.config.ts). Volgorde:
 * 1. APP_URL, mits geen *.vercel.app-host — een expliciet ingesteld domein wint.
 * 2. Vercel-productie (VERCEL_ENV=production): de vaste productie-origin. Een
 *    APP_URL die nog naar een oud *.vercel.app-adres wijst wordt hier bewust
 *    genegeerd; anders verwijzen canonicals en deelvoorbeelden naar de
 *    verkeerde host.
 * 3. Vercel-preview: de deploy-URL (VERCEL_URL), zodat previews nooit naar
 *    productie of een verouderd domein verwijzen. Previews staan op noindex.
 * 4. localhost.
 * Een ontbrekend schema wordt aangevuld; een ongeldige waarde kan de build
 * nooit laten crashen.
 */
export const PRODUCTIE_ORIGIN = "https://www.zzpschakel.nl";

type Env = Record<string, string | undefined>;

function origin(raw: string | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

function isVercelHost(o: string): boolean {
  return /\.vercel\.app$/i.test(new URL(o).hostname);
}

/** True op een Vercel-preview- of development-deployment (niet productie, niet lokaal). */
export function isPreviewDeployment(env: Env = process.env): boolean {
  return !!env.VERCEL_ENV && env.VERCEL_ENV !== "production";
}

export function resolveAppUrl(env: Env = process.env): string {
  const expliciet = origin(env.APP_URL);
  if (expliciet && !isVercelHost(expliciet)) return expliciet;

  if (env.VERCEL_ENV === "production") return PRODUCTIE_ORIGIN;

  if (isPreviewDeployment(env)) {
    const preview = origin(env.VERCEL_URL);
    if (preview) return preview;
  }

  // Lokaal of onbekende hosting: een (vercel.app-)APP_URL is beter dan niets.
  return expliciet ?? "http://localhost:3000";
}
