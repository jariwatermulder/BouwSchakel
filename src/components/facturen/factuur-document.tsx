import {
  berekenTotalen,
  datumKortNL,
  datumNL,
  effectieveStatus,
  euro,
  STATUS_META,
  type FactuurRegelBerekend,
} from "@/lib/factuur";

export type FactuurDocumentData = {
  factuurnummer: string;
  status: string;
  factuurdatum: Date | string | null;
  vervaldatum: Date | string | null;
  betaaltermijnDagen: number | null;
  betaalreferentie: string | null;
  btwVerlegd: boolean;
  afzender: {
    naam: string;
    adres?: string | null;
    postcode?: string | null;
    plaats?: string | null;
    kvk?: string | null;
    btwId?: string | null;
    iban?: string | null;
    email?: string | null;
    telefoon?: string | null;
    website?: string | null;
  };
  klant: {
    naam: string;
    contactpersoon?: string | null;
    adres?: string | null;
    postcode?: string | null;
    plaats?: string | null;
    kvk?: string | null;
    btwId?: string | null;
    email?: string | null;
  };
  regels: FactuurRegelBerekend[];
  opmerking?: string | null;
};

function toDate(d: Date | string | null): Date | null {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(date.getTime()) ? null : date;
}

function AdresRegels({ regels }: { regels: (string | null | undefined)[] }) {
  return (
    <>
      {regels
        .filter((r): r is string => Boolean(r && r.trim()))
        .map((r) => (
          <span key={r} className="block">
            {r}
          </span>
        ))}
    </>
  );
}

/**
 * Premium, zakelijke A4-factuurweergave. Puur presentatie (geen hooks), dus
 * bruikbaar in de live-preview én op de detailpagina. Zie ook de PDF-generator
 * die dit visueel volgt.
 */
export function FactuurDocument({ data }: { data: FactuurDocumentData }) {
  const totalen = berekenTotalen(
    data.regels.map((r) => ({ bedragCents: r.bedragCents, btwPercentage: r.btwPercentage })),
    data.btwVerlegd,
  );
  const eff = effectieveStatus(data.status, toDate(data.vervaldatum));
  const status = STATUS_META[eff] ?? STATUS_META.CONCEPT!;
  const nummer = data.factuurnummer || "—";
  const referentie = data.betaalreferentie || data.factuurnummer;

  const meta: { label: string; waarde: string }[] = [
    { label: "Factuurnummer", waarde: nummer },
    { label: "Factuurdatum", waarde: datumKortNL(data.factuurdatum) || "—" },
    { label: "Vervaldatum", waarde: datumKortNL(data.vervaldatum) || "—" },
    {
      label: "Betaaltermijn",
      waarde: data.betaaltermijnDagen ? `${data.betaaltermijnDagen} dagen` : "—",
    },
  ];

  return (
    <article className="border-border bg-surface text-foreground overflow-hidden rounded-[var(--radius-card)] border shadow-sm">
      <div className="bg-accent-500 h-1.5 w-full" aria-hidden />
      <div className="p-7 sm:p-10">
        {/* Kop */}
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-ink text-accent-400 flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black">
                ZC
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                ZZP Connect
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold tracking-tight">Factuur</p>
            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.klasse}`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: status.dot }}
              />
              {status.label}
            </span>
          </div>
        </header>

        {/* Meta-strip */}
        <div className="border-border mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-4">
          {meta.map((m) => (
            <div key={m.label} className="bg-surface-muted/60 px-4 py-3">
              <p className="text-foreground-muted text-[10px] font-semibold tracking-wide uppercase">
                {m.label}
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{m.waarde}</p>
            </div>
          ))}
        </div>

        {/* Van / Factuur aan */}
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-foreground-muted text-[10px] font-semibold tracking-wide uppercase">
              Van
            </p>
            <p className="mt-2 font-bold">{data.afzender.naam || "—"}</p>
            <div className="text-foreground-muted mt-1 text-sm leading-relaxed">
              <AdresRegels
                regels={[
                  data.afzender.adres,
                  [data.afzender.postcode, data.afzender.plaats]
                    .filter(Boolean)
                    .join(" "),
                  data.afzender.email,
                  data.afzender.telefoon,
                  data.afzender.website,
                  data.afzender.kvk ? `KvK ${data.afzender.kvk}` : null,
                  data.afzender.btwId ? `BTW ${data.afzender.btwId}` : null,
                  data.afzender.iban ? `IBAN ${data.afzender.iban}` : null,
                ]}
              />
            </div>
          </div>
          <div>
            <p className="text-foreground-muted text-[10px] font-semibold tracking-wide uppercase">
              Factuur aan
            </p>
            <p className="mt-2 font-bold">{data.klant.naam || "—"}</p>
            <div className="text-foreground-muted mt-1 text-sm leading-relaxed">
              <AdresRegels
                regels={[
                  data.klant.contactpersoon
                    ? `T.a.v. ${data.klant.contactpersoon}`
                    : null,
                  data.klant.adres,
                  [data.klant.postcode, data.klant.plaats]
                    .filter(Boolean)
                    .join(" "),
                  data.klant.email,
                  data.klant.kvk ? `KvK ${data.klant.kvk}` : null,
                  data.klant.btwId ? `BTW ${data.klant.btwId}` : null,
                ]}
              />
            </div>
          </div>
        </div>

        {/* Regeltabel */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-border text-foreground-muted border-b text-[10px] tracking-wide uppercase">
                <th className="py-2 pr-3 text-left font-semibold">Omschrijving</th>
                <th className="px-3 py-2 text-right font-semibold">Aantal</th>
                <th className="px-3 py-2 text-left font-semibold">Eenheid</th>
                <th className="px-3 py-2 text-right font-semibold">Tarief</th>
                <th className="px-3 py-2 text-right font-semibold">BTW</th>
                <th className="py-2 pl-3 text-right font-semibold">Bedrag</th>
              </tr>
            </thead>
            <tbody>
              {data.regels.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-foreground-muted py-6 text-center text-sm"
                  >
                    Nog geen regels toegevoegd.
                  </td>
                </tr>
              ) : (
                data.regels.map((r, i) => (
                  <tr key={i} className="border-border/70 border-b last:border-0">
                    <td className="py-3 pr-3 align-top">{r.omschrijving || "—"}</td>
                    <td className="px-3 py-3 text-right align-top tabular-nums">
                      {Number.isInteger(r.aantal) ? r.aantal : r.aantal.toFixed(2)}
                    </td>
                    <td className="text-foreground-muted px-3 py-3 align-top">
                      {r.eenheid || "—"}
                    </td>
                    <td className="px-3 py-3 text-right align-top tabular-nums">
                      {euro(r.tariefCents)}
                    </td>
                    <td className="text-foreground-muted px-3 py-3 text-right align-top tabular-nums">
                      {data.btwVerlegd ? "verlegd" : `${r.btwPercentage}%`}
                    </td>
                    <td className="py-3 pl-3 text-right align-top font-medium tabular-nums">
                      {euro(r.bedragCents)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totalen */}
        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Subtotaal excl. btw</dt>
              <dd className="tabular-nums">{euro(totalen.subtotaalCents)}</dd>
            </div>
            {data.btwVerlegd ? (
              <div className="flex justify-between">
                <dt className="text-foreground-muted">BTW verlegd</dt>
                <dd className="tabular-nums">{euro(0)}</dd>
              </div>
            ) : totalen.btwGroepen.length === 0 ? (
              <div className="flex justify-between">
                <dt className="text-foreground-muted">BTW</dt>
                <dd className="tabular-nums">{euro(0)}</dd>
              </div>
            ) : (
              totalen.btwGroepen.map((g) => (
                <div key={g.percentage} className="flex justify-between">
                  <dt className="text-foreground-muted">BTW {g.percentage}%</dt>
                  <dd className="tabular-nums">{euro(g.btwCents)}</dd>
                </div>
              ))
            )}
            <div className="border-ink/15 mt-1 flex items-baseline justify-between border-t-2 pt-3">
              <dt className="font-bold">Totaal te betalen</dt>
              <dd className="text-lg font-extrabold tabular-nums">
                {euro(totalen.totaalCents)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Betalingsinformatie */}
        <div className="border-border bg-surface-muted/50 mt-8 rounded-xl border p-5">
          <p className="text-foreground-muted text-[10px] font-semibold tracking-wide uppercase">
            Betalingsinformatie
          </p>
          {data.btwVerlegd ? (
            <p className="text-foreground-muted mt-2 text-sm">
              BTW verlegd naar de afnemer.
            </p>
          ) : null}
          <p className="text-foreground mt-2 text-sm">
            Te betalen{" "}
            <strong className="font-bold">{euro(totalen.totaalCents)}</strong>
            {toDate(data.vervaldatum)
              ? ` vóór ${datumNL(data.vervaldatum)}`
              : ""}{" "}
            onder vermelding van factuurnummer{" "}
            <strong className="font-semibold">{referentie}</strong>.
          </p>
          {data.afzender.iban ? (
            <p className="text-foreground-muted mt-1 text-sm">
              IBAN <span className="text-foreground font-medium">{data.afzender.iban}</span>{" "}
              t.n.v. {data.afzender.naam}
            </p>
          ) : null}
          {data.opmerking ? (
            <p className="text-foreground-muted mt-3 text-sm">{data.opmerking}</p>
          ) : null}
        </div>

        {/* Voettekst */}
        <footer className="border-border text-foreground-muted mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[11px]">
          <span className="font-semibold">ZZP Connect</span>
          <span>Opgemaakt met ZZP Connect — controleer zelf de fiscale juistheid.</span>
        </footer>
      </div>
    </article>
  );
}
