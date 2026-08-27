import type { MetadataRoute } from "next";

// Web app manifest — maakt ZZP Connect installeerbaar als PWA (app-icoon op het
// beginscherm, schermvullend openen). Next.js serveert dit op /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZZP Connect — vind de juiste zzp'er",
    short_name: "ZZP Connect",
    description:
      "Opdrachtgevers en zelfstandige professionals (zzp'ers) rechtstreeks verbonden. Plaats een opdracht of vind je volgende klus.",
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
