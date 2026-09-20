# Analytics en admin-dashboard

Eigen, first-party meting van bezoekers en gedrag, plus een beveiligd
beheerdashboard op `/admin`. Geen Google Analytics; alle cijfers komen uit de
eigen database.

## Onderdelen

| Onderdeel | Bestand |
|---|---|
| Eventregistry (namen + labels) | `src/lib/analytics/events.ts` |
| Server-side tracking | `src/lib/analytics/track.ts` → `trackEvent(naam, { userId, metadata })` |
| Browser-tracking | `src/lib/analytics/client.ts` + `src/components/analytics/tracker.tsx` (in de root-layout) |
| Ingest-eindpunt (browser → database) | `src/app/api/analytics/route.ts` |
| Tabel | `analytics_events` (Prisma-model `AnalyticsEvent`, migratie `00000000000015_analytics_events`) |
| Aggregaties voor het dashboard | `src/server/analytics/queries.ts` (60 s cache in `cache.ts`) |
| Periodefilter | `src/server/analytics/periode.ts` (`?p=vandaag|gisteren|7d|30d|90d|12m|jaar|custom&van=&tot=`) |
| Admin-omgeving | `src/app/(app)/admin/**`, sidebar in `src/components/admin/admin-shell.tsx` |
| Live feed en export | `src/app/api/admin/activiteit/route.ts`, `src/app/api/admin/export/route.ts` |

## Een nieuw event toevoegen

1. Voeg de naam met een Nederlands label toe aan `EVENTS` in `src/lib/analytics/events.ts`.
2. Mag de browser het versturen (klik, weergave)? Zet het dan ook in `CLIENT_EVENTS`.
   Alle andere events komen uitsluitend server-side; de API weigert ze.
3. Meet het:
   - server: `await trackEvent("mijn_event", { userId, userRole, page, metadata: { ... } })`
   - browser: `data-track="cta_clicked" data-track-label="…"` op een element, of `track("button_clicked", { label })`
     uit `@/lib/analytics/client`.
4. Extra gegevens gaan in `metadata` (JSON); er is geen schemawijziging nodig.
5. Wil je het in het dashboard zien? Voeg een query toe in `queries.ts` en toon hem op de pagina.
   `activiteit()` bepaalt welke events in de live feed verschijnen (`FEED_EVENTS`).

## Privacy

- Bezoekers krijgen een willekeurig pseudoniem (`zs_aid`, 12 maanden) en een sessienummer
  (`zs_sid`, 30 minuten inactiviteit). Beide staan als cookie zodat server-side events aan
  dezelfde bezoeker gekoppeld worden.
- Geen IP-adres, geen ruwe user-agent (alleen apparaattype/browser/OS), referrer alleen als hostnaam.
- "Do Not Track" en Global Privacy Control worden gerespecteerd; `/admin` wordt niet gemeten.
- Bij accountverwijdering wordt `userId` op de events op `null` gezet. Events ouder dan 24 maanden
  worden opgeruimd (opportunistisch vanuit het ingest-eindpunt).
- Exports bevatten id's en pseudonieme gegevens, geen namen of e-mailadressen; elke export staat in de auditlog.

## Beveiliging

- `src/app/(app)/admin/layout.tsx` controleert server-side op rol `ADMIN` + `adminRole`; elke pagina
  roept daarnaast `requireCurrentAdmin(...)` aan en de API-routes controleren `hasAdminAtLeast`.
- Export vereist minimaal `ADMIN`; dashboards en feed minimaal `SUPPORT`.
- De tabel heeft RLS aan (zoals alle tabellen); de app verbindt via Prisma met de owner-rol.

## Wat niet gemeten wordt

ZZP Schakel heeft geen matching, opdrachten of sollicitaties. Die statistieken staan in het
dashboard als "Niet van toepassing"; ze worden nooit verzonnen.
