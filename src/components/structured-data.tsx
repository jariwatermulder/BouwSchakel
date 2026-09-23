import { resolveAppUrl } from "@/lib/app-url";

/**
 * Structured data (JSON-LD) voor de site als geheel: Organization en WebSite.
 * Beschrijft uitsluitend zichtbare, bevestigde gegevens: naam, origin en logo.
 * Geen contactgegevens, adres, social-profielen, beoordelingen of aanbod
 * zolang die niet zijn aangeleverd en bevestigd (zie docs/SEO.md).
 */
export function StructuredData() {
  const origin = resolveAppUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "ZZP Schakel",
        url: `${origin}/`,
        logo: {
          "@type": "ImageObject",
          url: `${origin}/icon-512.png`,
          width: 512,
          height: 512,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: "ZZP Schakel",
        description:
          "Zelfstandige vakmensen en opdrachtgevers vinden elkaar op vakgebied en regio en nemen rechtstreeks contact op.",
        inLanguage: "nl-NL",
        publisher: { "@id": `${origin}/#organization` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // JSON-LD is geen HTML; '<' escapen zodat inhoud nooit als tag wordt gelezen.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
