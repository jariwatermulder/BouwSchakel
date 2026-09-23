import type { NextConfig } from "next";

// Beveiligingsheaders voor alle routes. Zie docs/SECURITY.md §10.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

// Oude opdrachten-URL's (ZZP Schakel is een communicatieplatform, geen
// opdrachtenplatform). Permanent doorsturen zodat oude links, bookmarks en
// zoekresultaten netjes landen en Google de oude pagina's uit de index haalt.
const opdrachtenRedirects = [
  { source: "/opdrachten", destination: "/vind-zzper", permanent: true },
  { source: "/opdrachten/:path*", destination: "/vind-zzper", permanent: true },
  { source: "/bedrijven/opdracht-plaatsen", destination: "/vind-zzper", permanent: true },
  { source: "/bedrijven/opdrachten", destination: "/bedrijven/dashboard", permanent: true },
  { source: "/bedrijven/opdrachten/:path*", destination: "/bedrijven/dashboard", permanent: true },
  { source: "/bedrijven/kandidaten", destination: "/vind-zzper", permanent: true },
  { source: "/zzpers/opdrachten", destination: "/zzpers/dashboard", permanent: true },
  { source: "/zzpers/opdrachten/:path*", destination: "/zzpers/dashboard", permanent: true },
  { source: "/zzpers/mijn-opdrachten", destination: "/zzpers/dashboard", permanent: true },
  { source: "/zzpers/reacties", destination: "/zzpers/dashboard", permanent: true },
];

// ── Productiedomein ────────────────────────────────────────────────────────
// Eén publieke origin: https://www.zzpschakel.nl (zie src/lib/app-url.ts en
// docs/SEO.md). Het domein zonder www en de oude publieke *.vercel.app-hosts
// sturen permanent door naar www, met behoud van pad en query. Alleen in
// productie: previews hebben eigen hosts en blijven onaangeroerd.
const PRODUCTIE_HOST = "www.zzpschakel.nl";
const OUDE_PUBLIEKE_HOSTS = [
  "zzpschakel.nl",
  "bouw-schakel.vercel.app",
  "bouwschakel.vercel.app",
  "bouw-schakel-geqi.vercel.app",
];
const isVercelProductie = process.env.VERCEL_ENV === "production";
const isVercelPreview = !!process.env.VERCEL_ENV && !isVercelProductie;

const hostRedirects = isVercelProductie
  ? OUDE_PUBLIEKE_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://${PRODUCTIE_HOST}/:path*`,
      permanent: true,
    }))
  : [];

// Preview-deployments nooit indexeren (aanvullend op robots.txt).
const previewHeaders = isVercelPreview
  ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
  : [];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Foto- en documentupload via server actions (max. 10 MB per bestand).
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: [...securityHeaders, ...previewHeaders] }];
  },
  async redirects() {
    return [...hostRedirects, ...opdrachtenRedirects];
  },
};

export default nextConfig;
