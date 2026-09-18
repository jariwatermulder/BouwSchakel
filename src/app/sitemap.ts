import type { MetadataRoute } from "next";
import { resolveAppUrl } from "@/lib/app-url";
import { listPublicZzpers } from "@/server/zzpers/directory";

// Statische, publieke pagina's. Juridische en account-pagina's staan op
// noindex en horen niet in de sitemap; opdrachtpagina's bestaan niet meer.
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = resolveAppUrl();
  const now = new Date();
  const statisch: MetadataRoute.Sitemap = routes.map(({ pad, prio }) => ({
    url: `${appUrl}${pad}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: prio,
  }));

  // Openbare zzp-profielen. Faalt de DB, val terug op de statische lijst
  // (de sitemap mag nooit de build of de route breken).
  let profielen: MetadataRoute.Sitemap = [];
  try {
    const zzpers = await listPublicZzpers({});
    profielen = zzpers.map((z) => ({
      url: `${appUrl}/vind-zzper/${z.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    profielen = [];
  }

  return [...statisch, ...profielen];
}
