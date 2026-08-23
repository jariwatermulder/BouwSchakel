import type { MetadataRoute } from "next";

// Web app manifest — maakt BouwSchakel installeerbaar als PWA (app-icoon op het
// beginscherm, schermvullend openen). Next.js serveert dit op /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BouwSchakel — vind de juiste vakman",
    short_name: "BouwSchakel",
    description:
      "Bouwbedrijven en zelfstandige vakmensen rechtstreeks verbonden. Plaats een opdracht of vind je volgende klus.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F2540",
    theme_color: "#0F2540",
    lang: "nl-NL",
    dir: "ltr",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Opdracht plaatsen",
        short_name: "Opdracht",
        url: "/bedrijven/opdracht-plaatsen",
      },
      {
        name: "Opdrachten voor jou",
        short_name: "Opdrachten",
        url: "/zzpers/opdrachten",
      },
    ],
  };
}
