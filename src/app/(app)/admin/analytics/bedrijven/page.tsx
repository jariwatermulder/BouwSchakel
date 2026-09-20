import type { Metadata } from "next";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { parsePeriode } from "@/server/analytics/periode";
import { bedrijfStats, geografie, profielKwaliteit } from "@/server/analytics/queries";
import { TijdGrafiek } from "@/components/admin/charts";
import { Cijfer, ExportKnoppen, Kwaliteit, PaginaKop, Paneel, Verdeling } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Bedrijven", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ p?: string; van?: string; tot?: string }>;

export default async function AdminBedrijvenAnalyticsPage({ searchParams }: { searchParams: SP }) {
  await requireCurrentAdmin("SUPPORT");
  const periode = parsePeriode(await searchParams);
  const [s, kwaliteit, geo] = await Promise.all([bedrijfStats(periode), profielKwaliteit(), geografie()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <PaginaKop titel="Bedrijven" intro="Opdrachtgevers: registraties, profielkwaliteit en contact." periode={periode} bijgewerkt={new Date().toISOString()} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Cijfer label="Totaal bedrijven" waarde={s.totaal} sub="Accounts met rol opdrachtgever" />
        <Cijfer label="Nieuw vandaag" waarde={s.vandaag} />
        <Cijfer label="Nieuw deze week" waarde={s.week} sub="Laatste 7 dagen" />
        <Cijfer label="Nieuw deze maand" waarde={s.maand} sub="Laatste 30 dagen" />
        <Cijfer label="Nieuw in periode" waarde={s.inPeriode} sub={periode.label} />
        <Cijfer label="Actieve bedrijven" waarde={s.actief} sub="Ingelogd in de laatste 30 dagen" />
        <Cijfer label="Compleet bedrijfsprofiel" waarde={s.compleet} sub="Naam en KvK-nummer ingevuld" />
        <Cijfer label="Zonder compleet profiel" waarde={s.incompleet} />
        <Cijfer label="Opdrachten" waarde={null} sub="Niet van toepassing: geen opdrachten op ZZP Schakel" />
        <Cijfer label="Contactaanvragen" waarde={s.contactaanvragen} sub={`${s.contactInPeriode} in ${periode.label}`} />
      </div>

      <Paneel titel="Nieuwe bedrijven" sub={`Per ${periode.bucket === "hour" ? "uur" : periode.bucket === "day" ? "dag" : periode.bucket === "week" ? "week" : "maand"} · ${periode.label}`} className="mt-6">
        {s.reeks.some((r) => r.waarde > 0) ? (
          <TijdGrafiek data={s.reeks} bucket={periode.bucket} series={[{ key: "waarde", label: "Nieuwe bedrijven" }]} type="bar" />
        ) : (
          <p className="text-foreground-muted py-10 text-center text-sm">Geen nieuwe bedrijven in deze periode.</p>
        )}
      </Paneel>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Paneel titel="Regio's van bedrijven" sub="Opgegeven regio in het bedrijfsprofiel"><Verdeling data={geo.bedrijven} /></Paneel>
        <Paneel titel="Type werkzaamheden" sub="Zoals opgegeven in het bedrijfsprofiel"><Verdeling data={s.werkzaamheden} /></Paneel>
        <Paneel titel="Profile completion" sub="Welk deel van de bedrijfsprofielen heeft elk onderdeel ingevuld">
          <Kwaliteit rijen={kwaliteit.bedrijf} />
        </Paneel>
      </div>

      <div className="mt-6">
        <ExportKnoppen periode={periode} datasets={[{ key: "bedrijfsregistraties", label: "Bedrijfsregistraties" }, { key: "contactaanvragen", label: "Contactaanvragen" }]} />
      </div>
    </div>
  );
}
