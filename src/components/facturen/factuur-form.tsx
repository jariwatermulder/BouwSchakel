"use client";

import { useActionState, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { regelBedragCents } from "@/lib/factuur";
import type { FactuurContext } from "@/server/facturen/service";
import { FactuurDocument } from "./factuur-document";
import { createFactuurAction, type FactuurFormState } from "./actions";

type Regel = {
  omschrijving: string;
  aantal: string;
  eenheid: string;
  tarief: string;
  btw: string;
};

const initial: FactuurFormState = {};
const veld =
  "border-border bg-surface focus-visible:border-navy-500 focus-visible:ring-navy-500/20 h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus-visible:ring-2";
const kleinVeld =
  "border-border bg-surface focus-visible:border-navy-500 h-10 w-full rounded-lg border px-2.5 text-sm outline-none";

function isoVandaag(): string {
  return new Date().toISOString().slice(0, 10);
}
function plusDagen(iso: string, dagen: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + dagen);
  return d.toISOString().slice(0, 10);
}

export function FactuurForm({
  context,
  basisPad,
}: {
  context: FactuurContext;
  basisPad: string;
}) {
  const [state, formAction, pending] = useActionState(createFactuurAction, initial);
  const a = context.afzender;

  const [assignmentId, setAssignmentId] = useState("");
  const [factuurnummer, setFactuurnummer] = useState(context.voorstelNummer);
  const [factuurdatum, setFactuurdatum] = useState(isoVandaag());
  const [betaaltermijn, setBetaaltermijn] = useState("14");
  const [vervaldatum, setVervaldatum] = useState(plusDagen(isoVandaag(), 14));

  const [afz, setAfz] = useState({
    naam: a.naam,
    adres: a.adres,
    postcode: a.postcode,
    plaats: a.plaats,
    kvk: a.kvk,
    btwId: a.btwId,
    iban: a.iban,
    email: a.email,
    telefoon: a.telefoon,
    website: a.website,
  });
  const [klant, setKlant] = useState({
    naam: "",
    contactpersoon: "",
    adres: "",
    postcode: "",
    plaats: "",
    email: "",
    kvk: "",
    btwId: "",
  });

  const [btwVerlegd, setBtwVerlegd] = useState(false);
  const [betaalreferentie, setBetaalreferentie] = useState("");
  const [opmerking, setOpmerking] = useState("");
  const [regels, setRegels] = useState<Regel[]>([
    { omschrijving: "", aantal: "1", eenheid: "uur", tarief: "", btw: "21" },
  ]);

  function setTermijn(dagen: string) {
    setBetaaltermijn(dagen);
    const n = Number(dagen);
    if (!Number.isNaN(n)) setVervaldatum(plusDagen(factuurdatum, n));
  }
  function setDatum(iso: string) {
    setFactuurdatum(iso);
    const n = Number(betaaltermijn);
    if (!Number.isNaN(n)) setVervaldatum(plusDagen(iso, n));
  }

  function kiesOpdracht(id: string) {
    setAssignmentId(id);
    const o = context.assignments.find((x) => x.id === id);
    if (!o) return;
    setKlant((k) => ({ ...k, naam: o.bedrijf, kvk: o.bedrijfKvk }));
    setRegels((r) => {
      const leeg = r.length === 1 && !r[0]!.omschrijving && !r[0]!.tarief;
      const nieuw: Regel = {
        omschrijving: o.jobTitel,
        aantal: "1",
        eenheid: "uur",
        tarief: o.tariefEuro != null ? String(o.tariefEuro) : "",
        btw: "21",
      };
      return leeg ? [nieuw] : [...r, nieuw];
    });
  }

  const updateRegel = (i: number, patch: Partial<Regel>) =>
    setRegels((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const voegRegelToe = () =>
    setRegels((r) => [
      ...r,
      { omschrijving: "", aantal: "1", eenheid: "uur", tarief: "", btw: "21" },
    ]);
  const verwijderRegel = (i: number) =>
    setRegels((r) => (r.length === 1 ? r : r.filter((_, j) => j !== i)));

  const berekendeRegels = useMemo(
    () =>
      regels
        .filter((r) => r.omschrijving.trim().length > 0 || r.tarief.trim().length > 0)
        .map((r) => {
          const aantal = Number(r.aantal) || 0;
          const tariefCents = Math.round((Number(r.tarief) || 0) * 100);
          return {
            omschrijving: r.omschrijving,
            aantal,
            eenheid: r.eenheid || null,
            tariefCents,
            btwPercentage: btwVerlegd ? 0 : Number(r.btw) || 0,
            bedragCents: regelBedragCents(aantal, tariefCents),
          };
        }),
    [regels, btwVerlegd],
  );

  const linesJson = useMemo(
    () =>
      JSON.stringify(
        berekendeRegels.map((r) => ({
          omschrijving: r.omschrijving.trim(),
          aantal: r.aantal,
          eenheid: r.eenheid,
          tarief: r.tariefCents / 100,
          btw: r.btwPercentage,
        })),
      ),
    [berekendeRegels],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* ── Editor ─────────────────────────────────────────────── */}
      <form action={formAction} className="space-y-7">
        <input type="hidden" name="basisPad" value={basisPad} />
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <input type="hidden" name="linesJson" value={linesJson} />
        <input type="hidden" name="btwVerlegd" value={btwVerlegd ? "1" : "0"} />
        {/* gesynchroniseerde afzender/klant velden */}
        {Object.entries({
          afzenderNaam: afz.naam,
          afzenderAdres: afz.adres,
          afzenderPostcode: afz.postcode,
          afzenderPlaats: afz.plaats,
          afzenderKvk: afz.kvk,
          afzenderBtwId: afz.btwId,
          afzenderIban: afz.iban,
          afzenderEmail: afz.email,
          afzenderTelefoon: afz.telefoon,
          afzenderWebsite: afz.website,
          klantNaam: klant.naam,
          klantContactpersoon: klant.contactpersoon,
          klantAdres: klant.adres,
          klantPostcode: klant.postcode,
          klantPlaats: klant.plaats,
          klantEmail: klant.email,
          klantKvk: klant.kvk,
          klantBtwId: klant.btwId,
          factuurnummer,
          factuurdatum,
          vervaldatum,
          betaaltermijnDagen: betaaltermijn,
          betaalreferentie,
          opmerking,
        }).map(([naam, waarde]) => (
          <input key={naam} type="hidden" name={naam} value={waarde} />
        ))}

        {context.assignments.length > 0 ? (
          <section className="space-y-2">
            <Label htmlFor="opdrachtKeuze">Koppel aan opdracht (optioneel)</Label>
            <select
              id="opdrachtKeuze"
              className={veld}
              value={assignmentId}
              onChange={(e) => kiesOpdracht(e.target.value)}
            >
              <option value="">Geen — vrije factuur</option>
              {context.assignments.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.jobTitel} — {o.bedrijf}
                </option>
              ))}
            </select>
          </section>
        ) : null}

        {/* Factuurgegevens */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Factuurgegevens</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="fnr">Factuurnummer</Label>
              <Input
                id="fnr"
                value={factuurnummer}
                onChange={(e) => setFactuurnummer(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fdat">Factuurdatum</Label>
              <Input
                id="fdat"
                type="date"
                value={factuurdatum}
                onChange={(e) => setDatum(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="btermijn">Betaaltermijn (dagen)</Label>
              <Input
                id="btermijn"
                type="number"
                min={0}
                value={betaaltermijn}
                onChange={(e) => setTermijn(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vdat">Vervaldatum</Label>
              <Input
                id="vdat"
                type="date"
                value={vervaldatum}
                onChange={(e) => setVervaldatum(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Klant */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Factuur aan</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="kn">Bedrijfsnaam</Label>
              <Input id="kn" value={klant.naam} onChange={(e) => setKlant({ ...klant, naam: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="kc">Contactpersoon</Label>
              <Input id="kc" value={klant.contactpersoon} onChange={(e) => setKlant({ ...klant, contactpersoon: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ke">E-mail</Label>
              <Input id="ke" type="email" value={klant.email} onChange={(e) => setKlant({ ...klant, email: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ka">Adres</Label>
              <Input id="ka" value={klant.adres} onChange={(e) => setKlant({ ...klant, adres: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="kp">Postcode</Label>
              <Input id="kp" value={klant.postcode} onChange={(e) => setKlant({ ...klant, postcode: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="kpl">Plaats</Label>
              <Input id="kpl" value={klant.plaats} onChange={(e) => setKlant({ ...klant, plaats: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="kkvk">KvK-nummer</Label>
              <Input id="kkvk" value={klant.kvk} onChange={(e) => setKlant({ ...klant, kvk: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="kbtw">BTW-nummer</Label>
              <Input id="kbtw" value={klant.btwId} onChange={(e) => setKlant({ ...klant, btwId: e.target.value })} />
            </div>
          </div>
        </section>

        {/* Regels */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Factuurregels</h2>
            <Button type="button" variant="outline" size="sm" onClick={voegRegelToe}>
              + Regel
            </Button>
          </div>
          <datalist id="eenheden">
            {["uur", "dag", "stuk", "project", "km", "maand"].map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
          <div className="space-y-2">
            {regels.map((r, i) => (
              <div key={i} className="border-border bg-surface-muted/40 rounded-xl border p-3">
                <input
                  className={kleinVeld}
                  placeholder="Omschrijving"
                  value={r.omschrijving}
                  onChange={(e) => updateRegel(i, { omschrijving: e.target.value })}
                />
                <div className="mt-2 grid grid-cols-12 gap-2">
                  <input className={`${kleinVeld} col-span-3`} type="number" min="0" step="0.25" placeholder="Aantal" value={r.aantal} onChange={(e) => updateRegel(i, { aantal: e.target.value })} />
                  <input className={`${kleinVeld} col-span-3`} list="eenheden" placeholder="Eenheid" value={r.eenheid} onChange={(e) => updateRegel(i, { eenheid: e.target.value })} />
                  <input className={`${kleinVeld} col-span-3`} type="number" min="0" step="0.01" placeholder="Tarief €" value={r.tarief} onChange={(e) => updateRegel(i, { tarief: e.target.value })} />
                  <select className={`${kleinVeld} col-span-2`} value={r.btw} disabled={btwVerlegd} onChange={(e) => updateRegel(i, { btw: e.target.value })}>
                    <option value="21">21%</option>
                    <option value="9">9%</option>
                    <option value="0">0%</option>
                  </select>
                  <button type="button" onClick={() => verwijderRegel(i)} aria-label="Regel verwijderen" className="text-foreground-muted hover:text-red-600 col-span-1 flex items-center justify-center text-lg">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={btwVerlegd} onChange={(e) => setBtwVerlegd(e.target.checked)} />
            BTW verlegd naar de afnemer
          </label>
        </section>

        {/* Betaling & opmerking */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Betaling</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" value={afz.iban} onChange={(e) => setAfz({ ...afz, iban: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ref">Betaalreferentie</Label>
              <Input id="ref" placeholder={factuurnummer} value={betaalreferentie} onChange={(e) => setBetaalreferentie(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="opm">Opmerking</Label>
            <textarea id="opm" rows={2} maxLength={1000} value={opmerking} onChange={(e) => setOpmerking(e.target.value)} className="border-border bg-surface focus-visible:border-navy-500 w-full rounded-lg border p-3 text-sm outline-none" />
          </div>
        </section>

        {/* Afzender (inklapbaar) */}
        <details className="border-border rounded-xl border">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
            Jouw gegevens (afzender)
          </summary>
          <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="an">Naam / bedrijf</Label>
              <Input id="an" value={afz.naam} onChange={(e) => setAfz({ ...afz, naam: e.target.value })} />
            </div>
            <div><Label htmlFor="aa">Adres</Label><Input id="aa" value={afz.adres} onChange={(e) => setAfz({ ...afz, adres: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label htmlFor="ap">Postcode</Label><Input id="ap" value={afz.postcode} onChange={(e) => setAfz({ ...afz, postcode: e.target.value })} /></div>
              <div><Label htmlFor="apl">Plaats</Label><Input id="apl" value={afz.plaats} onChange={(e) => setAfz({ ...afz, plaats: e.target.value })} /></div>
            </div>
            <div><Label htmlFor="akvk">KvK</Label><Input id="akvk" value={afz.kvk} onChange={(e) => setAfz({ ...afz, kvk: e.target.value })} /></div>
            <div><Label htmlFor="abtw">BTW-nummer</Label><Input id="abtw" value={afz.btwId} onChange={(e) => setAfz({ ...afz, btwId: e.target.value })} /></div>
            <div><Label htmlFor="atel">Telefoon</Label><Input id="atel" value={afz.telefoon} onChange={(e) => setAfz({ ...afz, telefoon: e.target.value })} /></div>
            <div><Label htmlFor="aweb">Website</Label><Input id="aweb" value={afz.website} onChange={(e) => setAfz({ ...afz, website: e.target.value })} /></div>
            <div><Label htmlFor="aem">E-mail</Label><Input id="aem" value={afz.email} onChange={(e) => setAfz({ ...afz, email: e.target.value })} /></div>
          </div>
        </details>

        {state.error ? <FormAlert>{state.error}</FormAlert> : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="accent" size="lg" disabled={pending}>
            {pending ? "Bezig…" : "Opslaan"}
          </Button>
          <p className="text-foreground-muted text-xs">
            Na opslaan kun je downloaden, versturen en de status beheren.
          </p>
        </div>
      </form>

      {/* ── Live preview ───────────────────────────────────────── */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="text-foreground-muted mb-2 text-xs font-semibold tracking-wide uppercase">
          Live voorbeeld
        </p>
        <FactuurDocument
          data={{
            factuurnummer,
            status: "CONCEPT",
            factuurdatum,
            vervaldatum,
            betaaltermijnDagen: Number(betaaltermijn) || null,
            betaalreferentie: betaalreferentie || null,
            btwVerlegd,
            afzender: {
              naam: afz.naam,
              adres: afz.adres,
              postcode: afz.postcode,
              plaats: afz.plaats,
              kvk: afz.kvk,
              btwId: afz.btwId,
              iban: afz.iban,
              email: afz.email,
              telefoon: afz.telefoon,
              website: afz.website,
            },
            klant: {
              naam: klant.naam,
              contactpersoon: klant.contactpersoon,
              adres: klant.adres,
              postcode: klant.postcode,
              plaats: klant.plaats,
              kvk: klant.kvk,
              btwId: klant.btwId,
              email: klant.email,
            },
            regels: berekendeRegels,
            opmerking,
          }}
        />
      </div>
    </div>
  );
}
