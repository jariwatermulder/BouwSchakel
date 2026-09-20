import type { Metadata } from "next";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { parsePeriode } from "@/server/analytics/periode";
import { bronnen, devices, paginas, websiteStats } from "@/server/analytics/queries";
import { DonutGrafiek, TijdGrafiek } from "@/components/admin/charts";
import { DataTabel } from "@/components/admin/data-tabel";
import { Cijfer, ExportKnoppen, PaginaKop, Paneel, formatDuur } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Website analytics", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ p?: string; van?: string; tot?: string }>;

export default async function WebsiteAnalyticsPage({ searchParams }: { searchParams: SP }) {
  await requireCurrentAdmin("SUPPORT");
  const periode = parsePeriode(await searchParams);
  const [web, bron, pag, dev] = await Promise.all([websiteStats(periode), bronnen(periode), paginas(periode), devices(periode)]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <PaginaKop
        titel="Website analytics"
        intro="Eigen first-party meting: pseudonieme bezoekers, sessies en pagina's. Geen Google Analytics nodig."
        periode={periode}
        bijgewerkt={new Date().toISOString()}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Cijfer label="Bezoekers vandaag" waarde={web.heeftData || web.vandaag ? web.vandaag : null} />
        <Cijfer label="Bezoekers gisteren" waarde={web.heeftData || web.gisteren ? web.gisteren : null} />
        <Cijfer label="Bezoekers deze week" waarde={web.heeftData || web.week ? web.week : null} sub="Laatste 7 dagen" />
        <Cijfer label="Bezoekers deze maand" waarde={web.heeftData || web.maand ? web.maand : null} sub="Laatste 30 dagen" />
        <Cijfer label="Unieke bezoekers" waarde={web.heeftData ? web.uniek : null} sub={periode.label} />
        <Cijfer label="Sessies" waarde={web.heeftData ? web.sessies : null} sub={periode.label} />
        <Cijfer label="Gem. sessieduur" waarde={web.heeftData ? formatDuur(web.gemSessieduurSec) : null} sub="Sessies met meer dan één event" />
        <Cijfer label="Paginaweergaven" waarde={web.heeftData ? web.paginaweergaven : null} sub={periode.label} />
        <Cijfer label="Pagina's per sessie" waarde={web.heeftData ? (web.paginasPerSessie ?? null) : null} />
        <Cijfer label="Bounce" waarde={web.heeftData ? web.bouncePct : null} procent sub="Sessies met precies één paginaweergave" />
      </div>

      <Paneel titel="Bezoekers per dag" sub={periode.label} className="mt-6">
        {web.heeftData ? (
          <TijdGrafiek
            data={web.reeks}
            bucket={periode.bucket}
            series={[
              { key: "bezoekers", label: "Unieke bezoekers" },
              { key: "sessies", label: "Sessies", kleur: "#7ea1d8" },
              { key: "paginaweergaven", label: "Paginaweergaven", kleur: "#18212b" },
            ]}
          />
        ) : (
          <p className="text-foreground-muted py-10 text-center text-sm">Nog geen bezoekersdata in deze periode.</p>
        )}
      </Paneel>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Paneel titel="Waar komen bezoekers vandaan?" sub="Bron van de eerste paginaweergave per sessie; registraties van dezelfde bezoeker in de periode">
          <DataTabel
            rijen={bron.map((b) => ({ bron: b.bron, bezoekers: b.bezoekers, sessies: b.sessies, registraties: b.registraties, conversie: b.conversiePct }))}
            kolommen={[
              { key: "bron", label: "Bron" },
              { key: "bezoekers", label: "Bezoekers", type: "getal" },
              { key: "sessies", label: "Sessies", type: "getal" },
              { key: "registraties", label: "Registraties", type: "getal" },
              { key: "conversie", label: "Conversie", type: "procent" },
            ]}
            sorteerOp="bezoekers"
            zoekbaar={false}
          />
        </Paneel>
        <Paneel titel="Apparaten" sub="Sessies per apparaattype">
          <DonutGrafiek data={dev.apparaten} />
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-foreground-muted mb-2 text-xs font-semibold tracking-wide uppercase">Browser</h3>
              <DonutGrafiek data={dev.browsers.slice(0, 6)} hoogte={140} />
            </div>
            <div>
              <h3 className="text-foreground-muted mb-2 text-xs font-semibold tracking-wide uppercase">Besturingssysteem</h3>
              <DonutGrafiek data={dev.besturingssystemen.slice(0, 6)} hoogte={140} />
            </div>
          </div>
        </Paneel>
      </div>

      <Paneel titel="Pagina's" sub="Sorteer door op een kolomkop te klikken. Registraties worden toegerekend aan de landingspagina van de sessie." className="mt-6">
        <DataTabel
          rijen={pag.map((r) => ({ pagina: r.pagina, bezoeken: r.bezoeken, uniek: r.uniek, tijd: r.gemTijdSec, cta: r.ctaClicks, registraties: r.registraties, conversie: r.conversiePct }))}
          kolommen={[
            { key: "pagina", label: "Pagina" },
            { key: "bezoeken", label: "Bezoeken", type: "getal" },
            { key: "uniek", label: "Unieke bezoekers", type: "getal" },
            { key: "tijd", label: "Gem. tijd", type: "duur" },
            { key: "cta", label: "CTA-clicks", type: "getal" },
            { key: "registraties", label: "Registraties", type: "getal" },
            { key: "conversie", label: "Conversie", type: "procent" },
          ]}
          sorteerOp="bezoeken"
        />
      </Paneel>

      <div className="mt-6">
        <ExportKnoppen periode={periode} datasets={[{ key: "events", label: "Website events" }]} />
      </div>
    </div>
  );
}
