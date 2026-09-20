import type { Metadata } from "next";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { parsePeriode } from "@/server/analytics/periode";
import { zoekgedrag } from "@/server/analytics/queries";
import { DataTabel } from "@/components/admin/data-tabel";
import { Cijfer, PaginaKop, Paneel, Verdeling } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Zoekgedrag", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ p?: string; van?: string; tot?: string }>;

export default async function AdminZoekgedragPage({ searchParams }: { searchParams: SP }) {
  await requireCurrentAdmin("SUPPORT");
  const periode = parsePeriode(await searchParams);
  const z = await zoekgedrag(periode);
  const heeft = z.totaal > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <PaginaKop
        titel="Zoekgedrag"
        intro="Wat zoeken opdrachtgevers, en waar ontbreekt aanbod? Gemeten op de etalage bij elke zoekopdracht met een filter."
        periode={periode}
        bijgewerkt={new Date().toISOString()}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Cijfer label="Zoekopdrachten" waarde={heeft ? z.totaal : null} sub={periode.label} />
        <Cijfer label="Zonder resultaat" waarde={heeft ? z.zonderResultaat : null} sub="Ingelogde zoekopdrachten met 0 resultaten" />
        <Cijfer label="Gem. resultaten" waarde={heeft ? z.gemResultaten : null} sub="Per ingelogde zoekopdracht" />
        <Cijfer label="Zoek → profielweergave" waarde={heeft ? z.naarProfielweergavePct : null} procent sub="Sessies met een zoekopdracht die een profiel bekeken" />
        <Cijfer label="Zoek → contact" waarde={heeft ? z.naarContactPct : null} procent sub="Sessies met een zoekopdracht die contact opnamen" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Paneel titel="Populairste beroepen" sub="Gezochte vakgebieden"><Verdeling data={z.vakken} /></Paneel>
        <Paneel titel="Populairste regio's" sub="Gezochte plaatsen"><Verdeling data={z.plaatsen} /></Paneel>
      </div>

      <Paneel titel="Populairste zoekopdrachten" sub="Combinatie van vakgebied en plaats" className="mt-6">
        <DataTabel
          rijen={z.top.map((r) => ({ vak: r.vak, plaats: r.plaats, aantal: r.aantal, gem: r.gemResultaten, zonder: r.zonderResultaat }))}
          kolommen={[
            { key: "vak", label: "Vakgebied" },
            { key: "plaats", label: "Plaats" },
            { key: "aantal", label: "Zoekopdrachten", type: "getal" },
            { key: "gem", label: "Gem. resultaten", type: "getal" },
            { key: "zonder", label: "Zonder resultaat", type: "getal" },
          ]}
          sorteerOp="aantal"
        />
      </Paneel>

      <Paneel titel="Zoekopdrachten zonder resultaat" sub="Hier ontbreekt aanbod: interessant voor werving van zzp'ers" className="mt-6">
        <DataTabel
          rijen={z.zonderResultaatLijst.map((r) => ({ vak: r.vak, plaats: r.plaats, zonder: r.zonderResultaat, aantal: r.aantal }))}
          kolommen={[
            { key: "vak", label: "Vakgebied" },
            { key: "plaats", label: "Plaats" },
            { key: "zonder", label: "Keer zonder resultaat", type: "getal" },
            { key: "aantal", label: "Totaal gezocht", type: "getal" },
          ]}
          sorteerOp="zonder"
          leeg="Geen zoekopdrachten zonder resultaat in deze periode."
        />
      </Paneel>
    </div>
  );
}
