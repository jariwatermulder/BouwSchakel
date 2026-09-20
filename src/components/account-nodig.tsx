import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

/**
 * Toegangsblok voor bezoekers zonder account: passende profielen zijn alleen
 * zichtbaar met een account. `next` is het pad waarnaar we na registreren of
 * inloggen terugsturen (inclusief gekozen filters), zodat het gekozen
 * vakgebied behouden blijft.
 */
export function AccountNodig({
  next,
  titel = "Om passende profielen te bekijken maak je een account aan als opdrachtgever.",
  tekst = "Een account is gratis. Daarna zie je direct de profielen die bij jouw zoekopdracht passen en kun je rechtstreeks contact opnemen.",
}: {
  next: string;
  titel?: string;
  tekst?: string;
}) {
  const n = encodeURIComponent(next);
  return (
    <div className="border-border bg-surface rounded-2xl border p-6 md:p-8">
      <h2 className="text-xl font-bold md:text-2xl">{titel}</h2>
      <p className="text-foreground-muted mt-2 max-w-2xl leading-relaxed">{tekst}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ButtonLink
          href={`/registreren?rol=bedrijf&next=${n}`}
          variant="brand"
          data-track="cta_clicked"
          data-track-label="account-nodig-registreren"
          className="h-12 justify-center rounded-xl px-6 text-base"
        >
          Maak een account aan
          <span aria-hidden>→</span>
        </ButtonLink>
        <Link
          href={`/inloggen?next=${n}`}
          className="text-brand-600 hover:text-brand-700 rounded-sm text-center font-semibold sm:px-2"
        >
          Al een account? Log in
        </Link>
      </div>
    </div>
  );
}
