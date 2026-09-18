import Link from "next/link";
import { meldProfielAction } from "./meld-actions";

const REDENEN = [
  { value: "NEPPROFIEL", label: "Nepprofiel of onjuiste gegevens" },
  { value: "SPAM", label: "Spam of ongewenste berichten" },
  { value: "ONGEPAST", label: "Ongepaste inhoud" },
  { value: "ANDERS", label: "Iets anders" },
] as const;

/**
 * "Meld dit profiel": ingeklapt formulier onder de contactkaart. Gasten zien
 * alleen een link naar inloggen; het beheerteam ziet meldingen onder
 * Beheer → Reports.
 */
export function MeldProfielForm({
  zzpProfileId,
  ingelogd,
  gemeld,
}: {
  zzpProfileId: string;
  ingelogd: boolean;
  gemeld?: string;
}) {
  const terug = `/vind-zzper/${zzpProfileId}`;
  if (gemeld === "1") {
    return (
      <p className="text-foreground-muted mt-4 text-center text-xs" role="status">
        Bedankt voor je melding. Het beheerteam bekijkt dit profiel.
      </p>
    );
  }
  if (!ingelogd) {
    return (
      <p className="text-foreground-muted mt-4 text-center text-xs">
        Klopt er iets niet?{" "}
        <Link
          href={`/inloggen?next=${encodeURIComponent(terug)}`}
          className="text-brand-600 font-medium hover:underline"
        >
          Log in om dit profiel te melden
        </Link>
        .
      </p>
    );
  }
  return (
    <details className="mt-4 text-xs">
      <summary className="text-foreground-muted hover:text-foreground cursor-pointer text-center">
        Klopt er iets niet? Meld dit profiel
      </summary>
      <form action={meldProfielAction} className="mt-3 space-y-2">
        <input type="hidden" name="zzpProfileId" value={zzpProfileId} />
        <label className="block">
          <span className="text-foreground-muted">Reden</span>
          <select
            name="reden"
            required
            className="border-border bg-surface mt-1 h-9 w-full rounded-lg border px-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Kies een reden
            </option>
            {REDENEN.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-foreground-muted">Toelichting (optioneel)</span>
          <textarea
            name="toelichting"
            rows={3}
            maxLength={1000}
            className="border-border bg-surface mt-1 w-full rounded-lg border p-2 text-sm"
          />
        </label>
        {gemeld === "fout" ? (
          <p className="text-red-600">Kies een reden en probeer het opnieuw.</p>
        ) : null}
        {gemeld === "limiet" ? (
          <p className="text-red-600">Je hebt al veel meldingen gedaan. Probeer het later opnieuw.</p>
        ) : null}
        <button
          type="submit"
          className="border-border bg-surface hover:bg-surface-muted h-9 w-full rounded-lg border text-sm font-medium"
        >
          Melding versturen
        </button>
      </form>
    </details>
  );
}
