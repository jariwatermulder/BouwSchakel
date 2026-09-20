import type { Metadata } from "next";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { parsePeriode } from "@/server/analytics/periode";
import { contactStats, funnel } from "@/server/analytics/queries";
import { TijdGrafiek } from "@/components/admin/charts";
import { Cijfer, ExportKnoppen, Funnel, PaginaKop, Paneel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Matches & contact", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ p?: string; van?: string; tot?: string }>;

export default async function AdminContactAnalyticsPage({ searchParams }: { searchParams: SP }) {
  await requireCurrentAdmin("SUPPORT");
  const periode = parsePeriode(await searchParams);
  const [s, fun] = await Promise.all([contactStats(periode), funnel(periode)]);
  const verschil = s.vorigePeriode ? Math.round(((s.inPeriode - s.vorigePeriode) / s.vorigePeriode) * 100) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <PaginaKop
        titel="Matches & contact"
        intro="ZZP Schakel doet geen matching en heeft geen opdrachten. Het equivalent van een match is hier een contactaanvraag: een opdrachtgever die een gesprek start met een zzp’er."
        periode={periode}
        bijgewerkt={new Date().toISOString()}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Cijfer label="Contactaanvragen (totaal)" waarde={s.totaal} sub="Gesprekken sinds de start" />
        <Cijfer label="Vandaag" waarde={s.vandaag} />
        <Cijfer label="Deze week" waarde={s.week} sub="Laatste 7 dagen" />
        <Cijfer label="Deze maand" waarde={s.maand} sub="Laatste 30 dagen" />
        <Cijfer label="In periode" waarde={s.inPeriode} sub={verschil != null ? `${verschil > 0 ? "+" : ""}${verschil}% vs. vorige periode` : periode.label} />
        <Cijfer label="Gem. per zzp’er" waarde={s.gemPerZzper} sub="Gesprekken per benaderde zzp’er" />
        <Cijfer label="Gem. per bedrijf" waarde={s.gemPerBedrijf} sub="Gesprekken per bedrijf dat contact zocht" />
        <Cijfer label="Beantwoord door zzp’er" waarde={s.beantwoord} sub={s.beantwoordPct != null ? `${s.beantwoordPct}% van alle gesprekken` : undefined} />
        <Cijfer label="Profielweergave → contact" waarde={s.weergaveNaarContactPct} procent sub={`Contactaanvragen gedeeld door profielweergaven · ${periode.label}`} />
        <Cijfer label="Berichten" waarde={s.berichten} sub={`${s.berichtenInPeriode} in ${periode.label}`} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Cijfer label="Matches" waarde={null} sub="Niet van toepassing: geen matching" />
        <Cijfer label="Match → contact" waarde={null} sub="Niet van toepassing" />
        <Cijfer label="Match → opdracht" waarde={null} sub="Niet van toepassing: geen opdrachten in de database" />
      </div>

      <Paneel titel="Contactaanvragen" sub={`Nieuwe gesprekken · ${periode.label}`} className="mt-6">
        {s.reeks.some((r) => r.waarde > 0) ? (
          <TijdGrafiek data={s.reeks} bucket={periode.bucket} series={[{ key: "waarde", label: "Contactaanvragen" }]} type="bar" />
        ) : (
          <p className="text-foreground-muted py-10 text-center text-sm">Geen nieuwe gesprekken in deze periode.</p>
        )}
      </Paneel>

      <Paneel titel="Funnel: waar haken gebruikers af?" sub={periode.label} className="mt-6">
        <Funnel stappen={fun.stappen} />
        <p className="text-foreground-muted mt-4 text-xs">
          Contact → antwoord van de zzp’er: {fun.contactNaarAntwoordPct != null ? `${fun.contactNaarAntwoordPct}%` : "Nog geen data"}.
        </p>
      </Paneel>

      <div className="mt-6">
        <ExportKnoppen periode={periode} datasets={[{ key: "contactaanvragen", label: "Contactaanvragen" }]} />
      </div>
    </div>
  );
}
