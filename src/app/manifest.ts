import type { MetadataRoute } from "next";

// Web app manifest - maakt ZZP Schakel installeerbaar als PWA (app-icoon op het
// beginscherm, schermvullend openen). Next.js serveert dit op /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZZP Schakel: de directe schakel tussen zzp'ers en bedrijven",
    short_name: "ZZP Schakel",
    description:
      "Vind een zzp'er in jouw regio of maak gratis een profiel. Opdrachtgevers en zelfstandigen rechtstreeks met elkaar in contact.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#2563eb",
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
        name: "Vind een zzp'er",
        short_name: "Vind zzp'er",
        url: "/vind-zzper",
      },
      {
        name: "Maak een profiel",
        short_name: "Profiel",
        url: "/registreren?rol=zzp",
      },
    ],
  };
}
