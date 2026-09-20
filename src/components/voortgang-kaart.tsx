import Link from "next/link";
import { AnimatedBar } from "@/components/animated-bar";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";
import type { Voortgang } from "@/lib/voortgang";

/**
 * "Je profiel is 75% compleet" + precies waar de overige 25% te halen valt,
 * elk onderdeel met een directe knop naar de juiste plek. Wordt gebruikt op
 * de dashboards en profielpagina's van zzp'ers en opdrachtgevers.
 */
export function VoortgangKaart({
  voortgang,
  compact = false,
}: {
  voortgang: Voortgang;
  compact?: boolean;
}) {
  const { pct, ontbrekend, tips, blokkade, toelichting, klaarTekst } = voortgang;
  const resterend = ontbrekend.reduce((s, o) => s + (o.procent ?? 0), 0);
  const compleet = ontbrekend.length === 0;

  return (
    <section
      aria-labelledby="voortgang-titel"
      className="border-border bg-surface shadow-soft rounded-[var(--radius-card)] border p-6"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h2 id="voortgang-titel" className="text-lg font-semibold">
            {compleet ? "Je profiel is compleet" : `Je profiel is ${pct}% compleet`}
          </h2>
          <p className="text-foreground-muted mt-1 text-sm">
            {compleet
              ? klaarTekst
              : `Nog ${resterend}% te halen. Elk onderdeel hieronder brengt je direct naar de juiste plek.`}
          </p>
        </div>
        <p className="text-brand-600 shrink-0 text-3xl font-bold tabular-nums leading-none">
          {pct}%
        </p>
      </div>
      <AnimatedBar value={pct} className="mt-4" />
      {toelichting && !compleet ? (
        <p className="text-foreground-muted mt-2 text-xs">{toelichting}</p>
      ) : null}

      {blokkade ? (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p>{blokkade.tekst}</p>
          <ButtonLink
            href={blokkade.href}
            variant="brand"
            size="sm"
            className="shrink-0 rounded-lg"
          >
            {blokkade.knop}
          </ButtonLink>
        </div>
      ) : null}

      {ontbrekend.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-foreground-muted text-xs font-semibold tracking-wide uppercase">
            Nog te halen
          </h3>
          <ul className="border-border mt-2 divide-y divide-[var(--color-border)] rounded-xl border">
            {ontbrekend.map((o) => (
              <li
                key={o.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    aria-hidden
                    className="border-border mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-dashed"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {o.label}
                      <span className="bg-brand-50 text-brand-700 ml-2 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums">
                        +{o.procent}%
                      </span>
                    </p>
                    {!compact ? (
                      <p className="text-foreground-muted mt-0.5 text-sm">{o.actie}</p>
                    ) : null}
                  </div>
                </div>
                <ButtonLink
                  href={o.href}
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-lg sm:ml-4"
                >
                  Invullen
                  <span aria-hidden>→</span>
                </ButtonLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {compleet && !blokkade ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Icon name="check" className="h-4 w-4" />
          </span>
          {klaarTekst}
        </div>
      ) : null}

      {tips.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-foreground-muted text-xs font-semibold tracking-wide uppercase">
            Valt nog meer op met
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {tips.map((t) => (
              <li key={t.id}>
                <Link
                  href={t.href}
                  title={t.actie}
                  className="border-border bg-surface hover:border-brand-500 hover:text-brand-700 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  <span aria-hidden className="text-brand-600">+</span>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
