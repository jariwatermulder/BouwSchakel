import type { MetadataRoute } from "next";
import { listPublicJobSlugs } from "@/server/jobs/public";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

// Statische, publieke pagina's.
const routes = [
  "",
  "/hoe-het-werkt",
  "/tarieven",
  "/over-ons",
  "/contact",
  "/faq",
  "/zzpers",
  "/bedrijven",
  "/opdrachten",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const statisch: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  // Dynamische, indexeerbare opdrachtpagina's. Faalt de DB, val terug op
  // de statische lijst (sitemap mag nooit de build/route breken).
  let opdrachten: MetadataRoute.Sitemap = [];
  try {
    const slugs = await listPublicJobSlugs();
    opdrachten = slugs.map((j) => ({
      url: `${appUrl}/opdrachten/${j.slug}`,
      lastModified: j.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    }));
  } catch {
    opdrachten = [];
  }

  return [...statisch, ...opdrachten];
}
