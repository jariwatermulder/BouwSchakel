import type { PublicJob } from "@/server/jobs/public";

/** Structured data (schema.org JobPosting) voor een publieke opdrachtpagina. */
export function JobPostingJsonLd({ job }: { job: PublicJob }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.titel,
    description: job.omschrijving,
    datePosted: job.createdAt.toISOString(),
    ...(job.einddatum ? { validThrough: job.einddatum.toISOString() } : {}),
    employmentType: "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.naam || "Bedrijf",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.locatiePlaats,
        addressCountry: "NL",
      },
    },
    ...(job.gewenstUurtariefCents
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "EUR",
            value: {
              "@type": "QuantitativeValue",
              value: job.gewenstUurtariefCents / 100,
              unitText: "HOUR",
            },
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Serverside gegenereerd uit eigen data; geen user-injected HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
