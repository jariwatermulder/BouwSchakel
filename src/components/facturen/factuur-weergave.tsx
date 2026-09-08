import type { ZzpInvoice, ZzpInvoiceLine } from "@prisma/client";
import { STATUS_META } from "@/lib/factuur";
import { FactuurDocument } from "./factuur-document";
import { PrintKnop } from "./print-knop";
import {
  dupliceerFactuurAction,
  setStatusAction,
  verstuurFactuurAction,
} from "./actions";

type Factuur = ZzpInvoice & { lines: ZzpInvoiceLine[] };

const knopSecundair =
  "border-border bg-surface hover:border-navy-300 inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition";

export function FactuurWeergave({
  factuur: f,
  basisPad,
  verstuurd,
  fout,
}: {
  factuur: Factuur;
  basisPad: string;
  verstuurd?: boolean;
  fout?: string;
}) {
  const statusOpties = Object.entries(STATUS_META);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href={basisPad}
          className="text-foreground-muted hover:text-foreground text-sm"
        >
          ← Terug naar facturen
        </a>
        <div className="flex flex-wrap items-center gap-2">
          {/* Statusbeheer */}
          <form action={setStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={f.id} />
            <input type="hidden" name="basisPad" value={basisPad} />
            <select
              name="status"
              defaultValue={f.status}
              className="border-border bg-surface h-10 rounded-full border px-3 text-sm font-medium"
              aria-label="Status"
            >
              {statusOpties.map(([waarde, meta]) => (
                <option key={waarde} value={waarde}>
                  {meta.label}
                </option>
              ))}
            </select>
            <button type="submit" className={knopSecundair}>
              Bijwerken
            </button>
          </form>

          <form action={dupliceerFactuurAction}>
            <input type="hidden" name="id" value={f.id} />
            <input type="hidden" name="basisPad" value={basisPad} />
            <button type="submit" className={knopSecundair}>
              Dupliceren
            </button>
          </form>

          <form action={verstuurFactuurAction}>
            <input type="hidden" name="id" value={f.id} />
            <input type="hidden" name="basisPad" value={basisPad} />
            <button type="submit" className={knopSecundair}>
              Verstuur naar klant
            </button>
          </form>

          <PrintKnop className={knopSecundair} />

          <a
            href={`${basisPad}/${f.id}/pdf`}
            className="bg-accent-500 text-ink inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
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

      <div className="mt-5">
        <FactuurDocument
          data={{
            factuurnummer: f.factuurnummer,
            status: f.status,
            factuurdatum: f.factuurdatum,
            vervaldatum: f.vervaldatum,
            betaaltermijnDagen: f.betaaltermijnDagen,
            betaalreferentie: f.betaalreferentie,
            btwVerlegd: f.btwVerlegd,
            afzender: {
              naam: f.afzenderNaam,
              adres: f.afzenderAdres,
              postcode: f.afzenderPostcode,
              plaats: f.afzenderPlaats,
              kvk: f.afzenderKvk,
              btwId: f.afzenderBtwId,
              iban: f.afzenderIban,
              email: f.afzenderEmail,
              telefoon: f.afzenderTelefoon,
              website: f.afzenderWebsite,
            },
            klant: {
              naam: f.klantNaam,
              contactpersoon: f.klantContactpersoon,
              adres: f.klantAdres,
              postcode: f.klantPostcode,
              plaats: f.klantPlaats,
              kvk: f.klantKvk,
              btwId: f.klantBtwId,
              email: f.klantEmail,
            },
            regels: f.lines.map((l) => ({
              omschrijving: l.omschrijving,
              aantal: l.aantal,
              eenheid: l.eenheid,
              tariefCents: l.tariefCents,
              btwPercentage: l.btwPercentage,
              bedragCents: l.bedragCents,
            })),
            opmerking: f.opmerking,
          }}
        />
      </div>
    </>
  );
}
