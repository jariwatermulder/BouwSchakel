import type { MetadataRoute } from "next";
import { resolveAppUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const appUrl = resolveAppUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Privépagina's, accountflows en interne omgevingen niet indexeren.
      disallow: [
        "/inloggen",
        "/registreren",
        "/verifieer",
        "/wachtwoord-vergeten",
        "/wachtwoord-herstellen",
        "/zzpers/dashboard",
        "/zzpers/profiel",
        "/zzpers/registreren",
        "/bedrijven/dashboard",
        "/bedrijven/registreren",
        "/admin",
        "/api",
        "/opdrachten",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
