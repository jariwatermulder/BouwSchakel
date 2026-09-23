import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

/**
 * Toegangsblok voor bezoekers zonder account: passende profielen zijn alleen
 * zichtbaar met een account. `next` is het pad waarnaar we na registreren of
 * inloggen terugsturen (inclusief gekozen filters), zodat het gekozen
 * vakgebied behouden blijft.
 *
 * Om vóór de accountdrempel een concrete indruk te geven, tonen we het echte
 * aantal passende profielen (alleen een getal, geen profielgegevens) en wat
 * een profiel bevat. Er worden nooit voorbeeldprofielen verzonnen.
 */
export function AccountNodig({
  next,
  aantal,
  zoekopdracht,
  titel,
  tekst = "Een account is gratis. Daarna zie je direct de profielen die bij jouw zoekopdracht passen en kun je rechtstreeks contact opnemen.",
}: {
  next: string;
  /** Echt aantal zichtbare profielen voor deze zoekopdracht; null = niet tonen. */
  aantal?: number | null;
  /** Omschrijving van de zoekopdracht, bijv. "voor timmerman in Groningen" of "in Groningen". */
  zoekopdracht?: string | null;
  titel?: string;
  tekst?: string;
}) {
  const n = encodeURIComponent(next);
  const kop =
    titel ??
    (aantal && aantal > 0
      ? `${aantal} ${aantal === 1 ? "vakman gevonden" : "vakmensen gevonden"}${zoekopdracht ? ` ${zoekopdracht}` : ""}. Maak een account aan om de profielen te bekijken.`
      : "Om passende profielen te bekijken maak je een account aan als opdrachtgever.");

  return (
    <div className="border-border bg-surface rounded-2xl border p-6 md:p-8">
      <h2 className="text-xl font-bold md:text-2xl">{kop}</h2>
      <p className="text-foreground-muted mt-2 max-w-2xl leading-relaxed">{tekst}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="bg-surface-muted rounded-xl p-4">
          <p className="text-foreground text-sm font-semibold">Wat je in een profiel ziet</p>
          <ul className="text-foreground-muted mt-2 space-y-1 text-sm">
            {[
              "Vakgebied en specialisaties",
              "Werkgebied en reisafstand",
              "Ervaring, certificaten en portfolio",
              "Beschikbaarheid en indicatie van het uurtarief",
            ].map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-brand-600" aria-hidden>✓</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface-muted rounded-xl p-4">
          <p className="text-foreground text-sm font-semibold">Waarom een account?</p>
          <p className="text-foreground-muted mt-2 text-sm leading-relaxed">
            Zo weten beide partijen met wie ze praten: zzp’ers delen hun profiel
            alleen met opdrachtgevers die zich bekend hebben gemaakt. Contact
            verloopt via berichten in het platform; telefoonnummers en
            e-mailadressen blijven afgeschermd. Voor een opdrachtgeversaccount
            is een KvK-nummer nodig.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ButtonLink
          href={`/registreren?rol=bedrijf&next=${n}`}
          variant="brand"
          data-track="cta_clicked"
          data-track-label="account-nodig-registreren"
          className="h-12 justify-center rounded-xl px-6 text-base"
        >
          Maak gratis een account aan
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
