import type { MetadataRoute } from "next";
import { isPreviewDeployment, resolveAppUrl } from "@/lib/app-url";

/**
 * Indexeringsbeleid (zie docs/SEO.md):
 * - Preview-deployments: niets crawlen; daarnaast zet next.config.ts daar een
 *   X-Robots-Tag: noindex.
 * - Productie: alleen privé- en interne routes uitsluiten van crawlen.
 *   Inlog-, registratie- en wachtwoordpagina's staan bewust NIET in disallow:
 *   die dragen zelf een noindex, en die instructie kan alleen gelezen worden
 *   als crawlen is toegestaan.
 */
export default function robots(): MetadataRoute.Robots {
  const appUrl = resolveAppUrl();

  if (isPreviewDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/zzpers/dashboard",
        "/zzpers/profiel",
        "/zzpers/registreren",
        "/zzpers/berichten",
        "/zzpers/documenten",
        "/zzpers/facturen",
        "/zzpers/instellingen",
        "/zzpers/meldingen",
        "/bedrijven/dashboard",
        "/bedrijven/registreren",
        "/bedrijven/berichten",
        "/bedrijven/instellingen",
        "/admin",
        "/api",
        "/opdrachten",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
