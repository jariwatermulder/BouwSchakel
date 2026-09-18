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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return opdrachtenRedirects;
  },
};

export default nextConfig;
