import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getFactuur } from "@/server/facturen/service";
import { formatEuro } from "@/lib/utils";
import { setStatusAction, verstuurFactuurAction } from "../actions";

export const metadata: Metadata = {
  title: "Factuur",
  robots: { index: false },
};

const STATUS_LABEL: Record<string, string> = {
  CONCEPT: "Concept",
  VERSTUURD: "Verstuurd",
  BETAALD: "Betaald",
};
const STATUS_STIJL: Record<string, string> = {
  CONCEPT: "bg-surface-muted text-foreground-muted border-border",
  VERSTUURD: "bg-navy-50 text-navy-700 border-navy-200",
  BETAALD: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

function Adres({
  naam,
  adres,
  postcode,
  plaats,
  extra,
}: {
  naam: string;
  adres?: string | null;
  postcode?: string | null;
  plaats?: string | null;
  extra?: (string | null)[];
}) {
  return (
    <address className="text-foreground-muted mt-1 text-sm not-italic">
      <span className="text-foreground block font-semibold">{naam}</span>
      {adres ? <span className="block">{adres}</span> : null}
      {postcode || plaats ? (
        <span className="block">{[postcode, plaats].filter(Boolean).join(" ")}</span>
      ) : null}
      {(extra ?? [])
        .filter((v): v is string => Boolean(v))
        .map((v) => (
          <span key={v} className="block">
            {v}
          </span>
        ))}
    </address>
  );
}

export default async function FactuurDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ verstuurd?: string; fout?: string }>;
}) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const { verstuurd, fout } = await searchParams;
  const f = await getFactuur(user.id, id);
  if (!f) notFound();

  return (
    <Container className="max-w-3xl py-8 md:py-12">
      <Link
        href="/zzpers/facturen"
        className="text-foreground-muted hover:text-foreground text-sm"
      >
        ← Terug naar facturen
      </Link>

      {/* Actiebalk: status + versturen + betaald + PDF */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STIJL[f.status]}`}
        >
          {STATUS_LABEL[f.status]}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <form action={verstuurFactuurAction}>
            <input type="hidden" name="id" value={f.id} />
            <button
              type="submit"
              className="border-border bg-surface hover:border-navy-300 inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold"
            >
              Verstuur naar klant
            </button>
          </form>
          {f.status !== "BETAALD" ? (
            <form action={setStatusAction}>
              <input type="hidden" name="id" value={f.id} />
              <input type="hidden" name="status" value="BETAALD" />
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Markeer als betaald
              </button>
            </form>
          ) : (
            <form action={setStatusAction}>
              <input type="hidden" name="id" value={f.id} />
              <input type="hidden" name="status" value="VERSTUURD" />
              <button
                type="submit"
                className="border-border bg-surface text-foreground-muted hover:border-navy-300 inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold"
              >
                Heropenen
              </button>
            </form>
          )}
          <a
            href={`/zzpers/facturen/${f.id}/pdf`}
            className="bg-accent-500 text-ink inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          >
            Download PDF
          </a>
        </div>
      </div>

      {verstuurd ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          De factuur is per e-mail naar {f.klantEmail} verstuurd.
        </div>
      ) : null}
      {fout ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fout}
        </div>
      ) : null}

      {/* Factuurweergave in huisstijl */}
      <div className="border-border bg-surface shadow-soft mt-5 overflow-hidden rounded-[var(--radius-card)] border">
        <div className="bg-ink flex items-center justify-between px-6 py-5 text-white sm:px-8">
          <div className="flex items-center gap-2">
            <span className="bg-accent-500 text-ink flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black">
              ZC
            </span>
            <span className="font-bold">ZZP Connect</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">FACTUUR</p>
            <p className="text-navy-200 text-sm">Nr. {f.factuurnummer}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-foreground-muted text-xs font-semibold uppercase tracking-wide">
                Van
              </p>
              <Adres
                naam={f.afzenderNaam}
                adres={f.afzenderAdres}
                postcode={f.afzenderPostcode}
                plaats={f.afzenderPlaats}
                extra={[
                  f.afzenderEmail,
                  f.afzenderKvk ? `KvK: ${f.afzenderKvk}` : null,
                  f.afzenderBtwId ? `Btw-id: ${f.afzenderBtwId}` : null,
                ]}
              />
            </div>
            <div>
              <p className="text-foreground-muted text-xs font-semibold uppercase tracking-wide">
                Aan
              </p>
              <Adres
                naam={f.klantNaam}
                adres={f.klantAdres}
                postcode={f.klantPostcode}
                plaats={f.klantPlaats}
                extra={[
                  f.klantEmail,
                  f.klantKvk ? `KvK: ${f.klantKvk}` : null,
                ]}
              />
            </div>
          </div>

          <div className="text-foreground-muted mt-6 flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <span>Factuurdatum: {datum(f.factuurdatum)}</span>
            {f.vervaldatum ? <span>Vervaldatum: {datum(f.vervaldatum)}</span> : null}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="bg-navy-800 text-white">
                  <th className="rounded-l-lg px-3 py-2 text-left font-medium">
                    Omschrijving
                  </th>
                  <th className="px-3 py-2 text-right font-medium">Aantal</th>
                  <th className="px-3 py-2 text-right font-medium">Tarief</th>
                  <th className="rounded-r-lg px-3 py-2 text-right font-medium">
                    Bedrag
                  </th>
                </tr>
              </thead>
              <tbody>
                {f.lines.map((r) => (
                  <tr key={r.id} className="border-border border-b">
                    <td className="px-3 py-2">{r.omschrijving}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {Number.isInteger(r.aantal) ? r.aantal : r.aantal.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatEuro(r.tariefCents)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatEuro(r.bedragCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <dl className="w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground-muted">Subtotaal</dt>
                <dd className="tabular-nums">{formatEuro(f.subtotaalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground-muted">Btw ({f.btwPercentage}%)</dt>
                <dd className="tabular-nums">{formatEuro(f.btwCents)}</dd>
              </div>
              <div className="border-border mt-1 flex justify-between border-t pt-2">
                <dt className="font-semibold">Totaal</dt>
                <dd className="text-lg font-bold tabular-nums">
                  {formatEuro(f.totaalCents)}
                </dd>
              </div>
            </dl>
          </div>

          {f.afzenderIban ? (
            <p className="text-foreground-muted mt-6 text-sm">
              Gelieve te betalen op <strong className="text-foreground">IBAN {f.afzenderIban}</strong> t.n.v. {f.afzenderNaam}.
            </p>
          ) : null}
          {f.opmerking ? (
            <p className="text-foreground-muted mt-2 text-sm">{f.opmerking}</p>
          ) : null}
        </div>
      </div>

      <p className="text-foreground-muted mt-4 text-center text-xs">
        Opgemaakt met ZZP Connect. Deze factuur is een hulpmiddel; controleer
        zelf de fiscale juistheid.
      </p>
    </Container>
  );
}
