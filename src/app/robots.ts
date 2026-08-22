import type { MetadataRoute } from "next";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Privépagina's en interne omgevingen niet indexeren. Zie docs/ARCHITECTURE.md §9.
      disallow: [
        "/inloggen",
        "/registreren",
        "/verifieer",
        "/zzpers/dashboard",
        "/bedrijven/dashboard",
        "/admin",
        "/api",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
