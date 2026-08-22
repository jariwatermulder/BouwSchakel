import type { MetadataRoute } from "next";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

// Publieke, indexeerbare pagina's. Opdrachtpagina's (/opdrachten/[slug])
// worden hier later dynamisch aan toegevoegd (zie docs/ARCHITECTURE.md §9).
const routes = [
  "",
  "/hoe-het-werkt",
  "/tarieven",
  "/over-ons",
  "/contact",
  "/faq",
  "/zzpers",
  "/bedrijven",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
