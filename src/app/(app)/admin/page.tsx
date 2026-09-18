import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { getPlatformStats } from "@/server/admin/stats";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-navy-800 text-3xl font-extrabold">{value}</p>
      <p className="text-foreground-muted mt-1 text-sm">{label}</p>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const s = await getPlatformStats();
  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Adminoverzicht</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Belangrijkste getal: gesprekken — contact dat via ZZP Schakel tot stand
        komt tussen opdrachtgevers en zzp’ers.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Gesprekken" value={s.gesprekken} />
        <Tile label="Berichten (totaal)" value={s.berichten} />
        <Tile label="Berichten laatste 7 dagen" value={s.berichtenLaatste7Dagen} />
        <Tile label="Zichtbare profielen" value={s.zichtbareProfielen} />
        <Tile label="ZZP'ers" value={s.zzpers} />
        <Tile label="Bedrijven" value={s.bedrijven} />
      </div>

      <h2 className="mt-8 text-lg font-semibold">Aandacht nodig</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Wachtende verificaties" value={s.wachtendeVerificaties} />
        <Tile label="Open reports" value={s.openReports} />
        <Tile label="Open klachten" value={s.openKlachten} />
        <Tile label="Nieuwe contactberichten" value={s.nieuweContactberichten} />
      </div>
    </Container>
  );
}
