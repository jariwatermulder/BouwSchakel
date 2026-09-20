import type { MetadataRoute } from "next";
import { resolveAppUrl } from "@/lib/app-url";

// Statische, publieke pagina's. Juridische en account-pagina's staan op
// noindex en horen niet in de sitemap; opdrachtpagina's bestaan niet meer.
// Zzp-profielen zijn alleen met een account zichtbaar en staan daarom niet
// in de sitemap.
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
  const now = new Date();
  return routes.map(({ pad, prio }) => ({
    url: `${appUrl}${pad}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: prio,
  }));
}
