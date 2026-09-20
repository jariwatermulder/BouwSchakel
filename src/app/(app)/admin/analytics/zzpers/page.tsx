import type { Metadata } from "next";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { parsePeriode } from "@/server/analytics/periode";
import { geografie, profielKwaliteit, zzpStats } from "@/server/analytics/queries";
import { TijdGrafiek } from "@/components/admin/charts";
import { Cijfer, ExportKnoppen, Kwaliteit, PaginaKop, Paneel, Verdeling } from "@/components/admin/ui";

export const metadata: Metadata = { title: "ZZP'ers", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ p?: string; van?: string; tot?: string }>;

export default async function AdminZzpersPage({ searchParams }: { searchParams: SP }) {
  await requireCurrentAdmin("SUPPORT");
  const periode = parsePeriode(await searchParams);
  const [s, kwaliteit, geo] = await Promise.all([zzpStats(periode), profielKwaliteit(), geografie()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <PaginaKop titel="ZZP'ers" intro="Registraties, profielkwaliteit en waar de vraag zit." periode={periode} bijgewerkt={new Date().toISOString()} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Cijfer label="Totaal zzp’ers" waarde={s.totaal} />
        <Cijfer label="Nieuw vandaag" waarde={s.vandaag} />
        <Cijfer label="Nieuw deze week" waarde={s.week} sub="Laatste 7 dagen" />
        <Cijfer label="Nieuw deze maand" waarde={s.maand} sub="Laatste 30 dagen" />
        <Cijfer label="Nieuw in periode" waarde={s.inPeriode} sub={periode.label} />
        <Cijfer label="Actieve zzp’ers" waarde={s.actief} sub="Ingelogd in de laatste 30 dagen" />
        <Cijfer label="Profielen compleet" waarde={s.compleet} sub="100% ingevuld" />
        <Cijfer label="Profielen incompleet" waarde={s.incompleet} />
        <Cijfer label="Met foto / zonder foto" waarde={`${s.metFoto} / ${s.zonderFoto}`} />
        <Cijfer label="Gem. profielcompleetheid" waarde={s.gemCompleetheid} procent sub={`${s.zichtbaar} profielen zichtbaar in de etalage`} />
      </div>

      <Paneel titel="Nieuwe zzp’ers" sub={`Per ${periode.bucket === "hour" ? "uur" : periode.bucket === "day" ? "dag" : periode.bucket === "week" ? "week" : "maand"} · ${periode.label}`} className="mt-6">
        {s.reeks.some((r) => r.waarde > 0) ? (
          <TijdGrafiek data={s.reeks} bucket={periode.bucket} series={[{ key: "waarde", label: "Nieuwe zzp’ers" }]} type="bar" />
        ) : (
          <p className="text-foreground-muted py-10 text-center text-sm">Geen nieuwe zzp’ers in deze periode.</p>
        )}
      </Paneel>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Paneel titel="Populaire sectoren" sub="Aantal gekozen vakgebieden per sector"><Verdeling data={s.sectoren} /></Paneel>
        <Paneel titel="Populaire beroepen" sub="Gekozen vakgebieden"><Verdeling data={s.beroepen} /></Paneel>
        <Paneel titel="Regio's van zzp’ers" sub="Opgegeven plaats van het werkgebied"><Verdeling data={s.regios} /></Paneel>
        <Paneel titel="Beschikbaarheid" sub="Zzp'ers per type beschikbaarheid"><Verdeling data={s.beschikbaarheid} /></Paneel>
        <Paneel titel="Gezochte vakgebieden" sub={`Zoekopdrachten van opdrachtgevers · ${periode.label}`}><Verdeling data={s.zoekwoorden} /></Paneel>
        <Paneel titel="Zichtbare zzp’ers per plaats" sub="Top 20 plaatsen van zichtbare profielen; provincies zijn nog niet vastgelegd">
          <Verdeling data={geo.zzp} />
        </Paneel>
      </div>

      <Paneel titel="Profile completion" sub="Welk deel van de zzp-profielen heeft elk onderdeel ingevuld" className="mt-6">
        <Kwaliteit rijen={kwaliteit.zzp} />
      </Paneel>

      <div className="mt-6">
        <ExportKnoppen periode={periode} datasets={[{ key: "zzp-registraties", label: "ZZP-registraties" }]} />
      </div>
    </div>
  );
}
