import type { MetadataRoute } from "next";
import { resolveAppUrl } from "@/lib/app-url";

/**
 * Alleen bedoelde, indexeerbare, canonieke pagina's (zie docs/SEO.md).
 * Niet opgenomen: juridische pagina's en accountflows (noindex), filter-
 * varianten van /vind-zzper (canonical naar /vind-zzper), zzp-profielen
 * (alleen met account zichtbaar) en interne routes.
 *
 * Bewust zonder lastModified: die datum hoort alleen bij een echte
 * inhoudswijziging, niet bij elke aanvraag.
 */
const routes: { pad: string; prio: number }[] = [
  { pad: "", prio: 1 },
  { pad: "/vind-zzper", prio: 0.9 },
  { pad: "/zzpers", prio: 0.8 },
  { pad: "/bedrijven", prio: 0.8 },
  { pad: "/hoe-het-werkt", prio: 0.7 },
  { pad: "/tarieven", prio: 0.6 },
  { pad: "/faq", prio: 0.6 },
  { pad: "/over-ons", prio: 0.5 },
  { pad: "/contact", prio: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = resolveAppUrl();
  return routes.map(({ pad, prio }) => ({
    url: `${appUrl}${pad}`,
    changeFrequency: "weekly",
    priority: prio,
  }));
}
