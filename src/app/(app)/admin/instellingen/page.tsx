import type { Metadata } from "next";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { CLIENT_EVENTS, EVENTS, type EventName } from "@/lib/analytics/events";
import { CACHE_TTL_MS } from "@/server/analytics/cache";
import { parsePeriode } from "@/server/analytics/periode";
import { ExportKnoppen, PaginaKop, Paneel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Instellingen", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ p?: string; van?: string; tot?: string }>;

export default async function AdminInstellingenPage({ searchParams }: { searchParams: SP }) {
  await requireCurrentAdmin("ADMIN");
  const periode = parsePeriode(await searchParams);
  const [totaal, perEvent, oudste] = await Promise.all([
    db.analyticsEvent.count(),
    db.analyticsEvent.groupBy({ by: ["eventName"], _count: { _all: true } }),
    db.analyticsEvent.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);
  const tel = new Map(perEvent.map((e) => [e.eventName, e._count._all]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <PaginaKop titel="Instellingen" intro="Hoe de eigen analytics werkt, welke events bestaan en export van ruwe data." periode={periode} bijgewerkt={new Date().toISOString()} />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Paneel titel="Tracking">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-foreground-muted">Opgeslagen events</dt><dd className="font-semibold tabular-nums">{totaal.toLocaleString("nl-NL")}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-foreground-muted">Meten sinds</dt><dd className="font-semibold">{oudste ? oudste.createdAt.toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam" }) : "Nog geen events"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-foreground-muted">Dashboardcache</dt><dd className="font-semibold">{CACHE_TTL_MS / 1000} seconden</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-foreground-muted">Activiteitenfeed</dt><dd className="font-semibold">elke 10 s (polling)</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-foreground-muted">Google Analytics</dt><dd className="font-semibold">niet in gebruik</dd></div>
          </dl>
          <p className="text-foreground-muted mt-4 text-xs leading-relaxed">
            Privacy: bezoekers krijgen een willekeurige, pseudonieme id (cookie <code>zs_aid</code>) en een sessie-id die na 30 minuten
            inactiviteit vervalt. Er worden geen IP-adressen, ruwe user-agents of wachtwoorden opgeslagen; van de referrer alleen de
            hostnaam. Bezoekers met &ldquo;Do Not Track&rdquo; of Global Privacy Control worden niet gemeten. De admin-omgeving zelf wordt niet
            gemeten. Bij verwijdering van een account worden de events losgekoppeld van het account.
          </p>
        </Paneel>
        <Paneel titel="Export" sub={`Ruwe data als CSV (scheidingsteken ;) voor ${periode.label}`}>
          <ExportKnoppen
            periode={periode}
            datasets={[
              { key: "zzp-registraties", label: "ZZP-registraties" },
              { key: "bedrijfsregistraties", label: "Bedrijfsregistraties" },
              { key: "events", label: "Website events" },
              { key: "contactaanvragen", label: "Contactaanvragen" },
            ]}
          />
          <p className="text-foreground-muted mt-3 text-xs">Exports bevatten alleen id’s en pseudonieme gegevens, geen namen of e-mailadressen.</p>
        </Paneel>
      </div>

      <Paneel titel="Events" sub="Alle events in de registry. Nieuwe events voeg je toe in src/lib/analytics/events.ts; extra gegevens gaan in metadata, zonder schemawijziging." className="mt-6">
        <div className="border-border overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-foreground-muted text-left text-xs tracking-wide uppercase">
              <tr>
                <th className="px-3 py-2 font-semibold">Event</th>
                <th className="px-3 py-2 font-semibold">Betekenis</th>
                <th className="px-3 py-2 font-semibold">Bron</th>
                <th className="px-3 py-2 text-right font-semibold">Gemeten</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {(Object.keys(EVENTS) as EventName[]).map((naam) => (
                <tr key={naam} className="bg-surface">
                  <td className="px-3 py-2 font-mono text-xs">{naam}</td>
                  <td className="px-3 py-2">{EVENTS[naam]}</td>
                  <td className="px-3 py-2">{CLIENT_EVENTS.includes(naam) ? "browser" : "server"}</td>
                  <td className="text-foreground-muted px-3 py-2 text-right tabular-nums">{(tel.get(naam) ?? 0).toLocaleString("nl-NL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-foreground-muted mt-3 text-xs">
          Niet gemeten omdat het platform ze niet kent: matches, opdrachten, sollicitaties en geaccepteerde contactaanvragen (contact loopt via berichten).
        </p>
      </Paneel>
    </div>
  );
}
