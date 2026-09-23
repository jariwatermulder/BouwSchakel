import type { Metadata } from "next";

/**
 * Metadata voor een publieke pagina, in één keer consistent:
 * - absolute, routespecifieke canonical (via metadataBase in de root-layout);
 * - Open Graph met og:url op dezelfde route en dezelfde deelafbeelding.
 *   Next.js vervangt het openGraph-object van de layout volledig zodra een
 *   pagina er zelf een opgeeft; daarom staan siteName, type en afbeelding
 *   hier expliciet.
 * - title/description gelden ook als og:title/og:description.
 * Zie docs/SEO.md.
 */
export const OG_AFBEELDING = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "ZZP Schakel: vind vakmensen in jouw regio",
};

export function paginaMetadata({
  pad,
  title,
  description,
  index = true,
}: {
  /** Routepad, bijv. "/vind-zzper". "/" voor de homepage. */
  pad: string;
  /** Paginatitel zonder merknaam; de root-layout voegt "· ZZP Schakel" toe. Weglaten = standaardtitel. */
  title?: string;
  description?: string;
  /** false voor pagina's die bereikbaar mogen zijn maar niet in zoekresultaten horen. */
  index?: boolean;
}): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: pad },
    ...(index ? {} : { robots: { index: false } }),
    openGraph: {
      type: "website",
      locale: "nl_NL",
      siteName: "ZZP Schakel",
      url: pad,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [OG_AFBEELDING],
    },
  };
}
