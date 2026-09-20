import type { Metadata } from "next";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { parsePeriode } from "@/server/analytics/periode";
import { bronnen, funnel, kpiOverzicht } from "@/server/analytics/queries";
import { DataTabel } from "@/components/admin/data-tabel";
import { Cijfer, Funnel, PaginaKop, Paneel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Conversie", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ p?: string; van?: string; tot?: string }>;

export default async function AdminConversiePage({ searchParams }: { searchParams: SP }) {
  await requireCurrentAdmin("SUPPORT");
  const periode = parsePeriode(await searchParams);
  const [fun, overzicht, bron] = await Promise.all([funnel(periode), kpiOverzicht(periode), bronnen(periode)]);
  const conversie = overzicht.kpis.find((k) => k.id === "conversie")!;
  const bezoekers = fun.stappen.find((s) => s.id === "bezoeker")?.waarde ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <PaginaKop
        titel="Conversie"
        intro="Van bezoeker naar registratie, profiel en contact. Stappen die op ZZP Schakel niet bestaan (match, opdracht) staan als niet van toepassing."
        periode={periode}
        bijgewerkt={new Date().toISOString()}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cijfer label="Bezoeker → registratie" waarde={conversie.waarde} procent sub={periode.label} />
        <Cijfer label="Registratie → profiel" waarde={fun.registratieNaarProfielPct} procent sub="Zzp-profiel met naam of compleet bedrijfsprofiel" />
        <Cijfer label="Contact → antwoord" waarde={fun.contactNaarAntwoordPct} procent sub="Gesprekken waarin de zzp’er reageerde" />
        <Cijfer label="Match → contact" waarde={null} sub="Niet van toepassing: geen matching" />
      </div>

      <Paneel titel="Per 1.000 bezoekers" sub={`Op basis van ${bezoekers != null ? bezoekers.toLocaleString("nl-NL") : "nog geen"} unieke bezoekers in ${periode.label}`} className="mt-6">
        {fun.per1000.zzpers != null && fun.per1000.bedrijven != null ? (
          <p className="text-lg">
            Van 1.000 websitebezoekers worden gemiddeld{" "}
            <strong className="text-brand-700">{fun.per1000.zzpers.toLocaleString("nl-NL")} zzp’ers</strong> en{" "}
            <strong className="text-brand-700">{fun.per1000.bedrijven.toLocaleString("nl-NL")} bedrijven</strong>.
          </p>
        ) : (
          <p className="text-foreground-muted text-sm">Nog geen bezoekersdata in deze periode.</p>
        )}
      </Paneel>

      <Paneel titel="Funnel" sub={periode.label} className="mt-6">
        <Funnel stappen={fun.stappen} />
      </Paneel>

      <Paneel titel="Conversie per bron" sub="Bezoekers en registraties per herkomst" className="mt-6">
        <DataTabel
          rijen={bron.map((b) => ({ bron: b.bron, bezoekers: b.bezoekers, registraties: b.registraties, conversie: b.conversiePct }))}
          kolommen={[
            { key: "bron", label: "Bron" },
            { key: "bezoekers", label: "Bezoekers", type: "getal" },
            { key: "registraties", label: "Registraties", type: "getal" },
            { key: "conversie", label: "Conversie", type: "procent" },
          ]}
          sorteerOp="bezoekers"
          zoekbaar={false}
        />
      </Paneel>
    </div>
  );
}
