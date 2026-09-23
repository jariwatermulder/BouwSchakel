import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { bronNaam } from "@/lib/analytics/bronnen";
import { EVENTS, type EventName } from "@/lib/analytics/events";
import { sectorVan } from "@/lib/sectoren";
import { cached } from "@/server/analytics/cache";
import {
  bucketLabels,
  plusDagen,
  startVanDag,
  type Bucket,
  type Periode,
} from "@/server/analytics/periode";

/**
 * Alle aggregaties voor het admin-dashboard. Uitsluitend echte data uit de
 * eigen database (gebruikers, profielen, gesprekken) en de eigen
 * analytics_events. Alles wat nog niet gemeten wordt, geeft `null` terug en
 * wordt in de UI als "Nog geen data" getoond - nooit als 0 of verzonnen.
 *
 * Zware queries lopen via een cache van 60 s (zie cache.ts).
 */

const n = (v: unknown): number => Number(v ?? 0);

/** Lokale (Amsterdamse) tijdbucket in SQL; zelfde vorm als bucketLabel(). */
function bucketSql(bucket: Bucket, kolom = Prisma.sql`"createdAt"`): Prisma.Sql {
  const fmt = bucket === "hour" ? 'YYYY-MM-DD"T"HH24:00' : "YYYY-MM-DD";
  return Prisma.sql`to_char(date_trunc(${bucket}, (${kolom} AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Amsterdam'), ${fmt})`;
}

export interface ReeksPunt {
  label: string;
  waarde: number;
}

function vulGaten(rows: { label: string; waarde: number }[], p: Periode): ReeksPunt[] {
  const map = new Map(rows.map((r) => [r.label, r.waarde]));
  return bucketLabels(p.van, p.tot, p.bucket).map((label) => ({
    label,
    waarde: map.get(label) ?? 0,
  }));
}

function pct(deel: number, geheel: number): number | null {
  if (!geheel) return null;
  return Math.round((deel / geheel) * 1000) / 10;
}

function verschilPct(nu: number, vorige: number): number | null {
  if (!vorige) return nu > 0 ? null : 0;
  return Math.round(((nu - vorige) / vorige) * 100);
}

// ── Basisbouwstenen ──────────────────────────────────────────────────────────

async function telEvents(
  name: EventName,
  van: Date,
  tot: Date,
  distinct?: "anonymousId" | "sessionId" | "userId",
): Promise<number> {
  if (!distinct) {
    return db.analyticsEvent.count({ where: { eventName: name, createdAt: { gte: van, lt: tot } } });
  }
  const kolom = Prisma.raw(`"${distinct}"`);
  const rows = await db.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(DISTINCT ${kolom}) AS c FROM "analytics_events"
    WHERE "eventName" = ${name} AND "createdAt" >= ${van} AND "createdAt" < ${tot} AND ${kolom} IS NOT NULL`;
  return n(rows[0]?.c);
}

async function eventReeks(name: EventName, p: Periode, distinct?: "anonymousId" | "sessionId"): Promise<ReeksPunt[]> {
  const expr = distinct ? Prisma.sql`COUNT(DISTINCT ${Prisma.raw(`"${distinct}"`)})` : Prisma.sql`COUNT(*)`;
  const rows = await db.$queryRaw<{ label: string; waarde: bigint }[]>`
    SELECT ${bucketSql(p.bucket)} AS label, ${expr} AS waarde
    FROM "analytics_events"
    WHERE "eventName" = ${name} AND "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}
    GROUP BY 1 ORDER BY 1`;
  return vulGaten(rows.map((r) => ({ label: r.label, waarde: n(r.waarde) })), p);
}

async function gebruikersReeks(p: Periode, rol: "ZZP" | "COMPANY" | null): Promise<ReeksPunt[]> {
  const rolFilter = rol ? Prisma.sql`AND "role" = ${rol}::"UserRole"` : Prisma.empty;
  const rows = await db.$queryRaw<{ label: string; waarde: bigint }[]>`
    SELECT ${bucketSql(p.bucket)} AS label, COUNT(*) AS waarde
    FROM "User"
    WHERE "createdAt" >= ${p.van} AND "createdAt" < ${p.tot} AND "deletedAt" IS NULL ${rolFilter}
    GROUP BY 1 ORDER BY 1`;
  return vulGaten(rows.map((r) => ({ label: r.label, waarde: n(r.waarde) })), p);
}

async function gesprekkenReeks(p: Periode): Promise<ReeksPunt[]> {
  const rows = await db.$queryRaw<{ label: string; waarde: bigint }[]>`
    SELECT ${bucketSql(p.bucket)} AS label, COUNT(*) AS waarde
    FROM "Conversation"
    WHERE "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}
    GROUP BY 1 ORDER BY 1`;
  return vulGaten(rows.map((r) => ({ label: r.label, waarde: n(r.waarde) })), p);
}

const telUsers = (rol: "ZZP" | "COMPANY" | null, van?: Date, tot?: Date) =>
  db.user.count({
    where: {
      deletedAt: null,
      ...(rol ? { role: rol } : { role: { in: ["ZZP", "COMPANY"] } }),
      ...(van && tot ? { createdAt: { gte: van, lt: tot } } : {}),
    },
  });

/** Gebruikers met een login of gemeten activiteit in de periode. */
async function actieveGebruikers(van: Date, tot: Date): Promise<number> {
  const rows = await db.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*) AS c FROM "User" u
    WHERE u."deletedAt" IS NULL AND u."role" IN ('ZZP','COMPANY') AND (
      (u."lastLoginAt" >= ${van} AND u."lastLoginAt" < ${tot})
      OR EXISTS (SELECT 1 FROM "analytics_events" e WHERE e."userId" = u."id" AND e."createdAt" >= ${van} AND e."createdAt" < ${tot})
    )`;
  return n(rows[0]?.c);
}

// ── KPI-overzicht ────────────────────────────────────────────────────────────

export interface Kpi {
  id: string;
  label: string;
  /** null = nog geen data / niet meetbaar. */
  waarde: number | null;
  /** Vergelijking met de vorige periode in %, null als niet berekenbaar. */
  verschil?: number | null;
  vergelijking?: string;
  /** Percentage in plaats van aantal. */
  procent?: boolean;
  reeks?: ReeksPunt[];
  toelichting?: string;
}

export interface KpiOverzicht {
  kpis: Kpi[];
  aandacht: { label: string; waarde: number; href: string }[];
}

export function kpiOverzicht(p: Periode): Promise<KpiOverzicht> {
  return cached(`kpi:${p.query}`, async () => {
    const nu = new Date();
    const vandaag = startVanDag(nu);
    const morgen = plusDagen(vandaag, 1);
    const weekStart = plusDagen(vandaag, -6);
    const maandStart = plusDagen(vandaag, -29);
    const maandInPeriode: Periode = { ...p, van: maandStart, tot: morgen, bucket: "day", query: "30d" };

    const [
      zzpTotaal, zzpNieuw, zzpVorig, zzpMaand, zzpWeek,
      bedrijfTotaal, bedrijfNieuw, bedrijfVorig, bedrijfMaand, bedrijfWeek,
      accounts, accountsNieuw, accountsVorig,
      actief, actiefVorig,
      bezoekersVandaag, bezoekersWeek, bezoekersMaand, bezoekersVorigeMaand,
      bezoekersPeriode, bezoekersVorigePeriode,
      contact, contactVorig,
      weergaven, weergavenVorig,
      zoek, zoekVorig,
      registraties, registratiesVorig,
      bezoekersReeks, zzpReeks, bedrijfReeks, contactReeks, zoekReeks, weergavenReeks,
      openReports, openKlachten, nieuweContact, wachtendeVerificaties,
    ] = await Promise.all([
      telUsers("ZZP"), telUsers("ZZP", p.van, p.tot), telUsers("ZZP", p.vorigeVan, p.vorigeTot),
      telUsers("ZZP", maandStart, morgen), telUsers("ZZP", weekStart, morgen),
      telUsers("COMPANY"), telUsers("COMPANY", p.van, p.tot), telUsers("COMPANY", p.vorigeVan, p.vorigeTot),
      telUsers("COMPANY", maandStart, morgen), telUsers("COMPANY", weekStart, morgen),
      telUsers(null), telUsers(null, p.van, p.tot), telUsers(null, p.vorigeVan, p.vorigeTot),
      actieveGebruikers(p.van, p.tot), actieveGebruikers(p.vorigeVan, p.vorigeTot),
      telEvents("page_view", vandaag, morgen, "anonymousId"),
      telEvents("page_view", weekStart, morgen, "anonymousId"),
      telEvents("page_view", maandStart, morgen, "anonymousId"),
      telEvents("page_view", plusDagen(maandStart, -30), maandStart, "anonymousId"),
      telEvents("page_view", p.van, p.tot, "anonymousId"),
      telEvents("page_view", p.vorigeVan, p.vorigeTot, "anonymousId"),
      db.conversation.count({ where: { createdAt: { gte: p.van, lt: p.tot } } }),
      db.conversation.count({ where: { createdAt: { gte: p.vorigeVan, lt: p.vorigeTot } } }),
      telEvents("profile_viewed", p.van, p.tot), telEvents("profile_viewed", p.vorigeVan, p.vorigeTot),
      telEvents("search_performed", p.van, p.tot), telEvents("search_performed", p.vorigeVan, p.vorigeTot),
      telEvents("user_registered", p.van, p.tot), telEvents("user_registered", p.vorigeVan, p.vorigeTot),
      eventReeks("page_view", p, "anonymousId"),
      gebruikersReeks(p, "ZZP"), gebruikersReeks(p, "COMPANY"), gesprekkenReeks(p),
      eventReeks("search_performed", p), eventReeks("profile_viewed", p),
      db.report.count({ where: { status: "OPEN" } }),
      db.complaint.count({ where: { status: "OPEN" } }),
      db.contactMessage.count({ where: { status: "NIEUW" } }),
      db.zZPProfile.count({ where: { verificatieStatus: "IN_BEHANDELING" } }),
    ]);
    void maandInPeriode;

    const heeftTracking = bezoekersPeriode > 0 || bezoekersVorigePeriode > 0;
    const vs = `vs. vorige ${p.key === "vandaag" ? "dag" : p.key === "gisteren" ? "dag" : "periode"}`;

    const kpis: Kpi[] = [
      { id: "zzp-totaal", label: "ZZP'ers (totaal)", waarde: zzpTotaal, reeks: zzpReeks, toelichting: "Accounts met rol zzp'er" },
      { id: "zzp-maand", label: "Nieuwe zzp'ers (30 dagen)", waarde: zzpMaand },
      { id: "zzp-week", label: "Nieuwe zzp'ers (7 dagen)", waarde: zzpWeek },
      { id: "zzp-periode", label: "Nieuwe zzp'ers in periode", waarde: zzpNieuw, verschil: verschilPct(zzpNieuw, zzpVorig), vergelijking: vs, reeks: zzpReeks },
      { id: "bedrijf-totaal", label: "Bedrijven (totaal)", waarde: bedrijfTotaal, reeks: bedrijfReeks, toelichting: "Accounts met rol opdrachtgever" },
      { id: "bedrijf-maand", label: "Nieuwe bedrijven (30 dagen)", waarde: bedrijfMaand },
      { id: "bedrijf-week", label: "Nieuwe bedrijven (7 dagen)", waarde: bedrijfWeek },
      { id: "bedrijf-periode", label: "Nieuwe bedrijven in periode", waarde: bedrijfNieuw, verschil: verschilPct(bedrijfNieuw, bedrijfVorig), vergelijking: vs, reeks: bedrijfReeks },
      { id: "accounts", label: "Geregistreerde accounts", waarde: accounts, verschil: verschilPct(accountsNieuw, accountsVorig), vergelijking: `nieuwe accounts ${vs}` },
      { id: "actief", label: "Actieve gebruikers", waarde: actief, verschil: verschilPct(actief, actiefVorig), vergelijking: vs, toelichting: "Ingelogd of activiteit gemeten in de periode" },
      { id: "bezoekers-vandaag", label: "Bezoekers vandaag", waarde: heeftTracking || bezoekersVandaag > 0 ? bezoekersVandaag : null },
      { id: "bezoekers-week", label: "Bezoekers deze week", waarde: heeftTracking || bezoekersWeek > 0 ? bezoekersWeek : null },
      { id: "bezoekers-maand", label: "Bezoekers (30 dagen)", waarde: heeftTracking || bezoekersMaand > 0 ? bezoekersMaand : null, verschil: verschilPct(bezoekersMaand, bezoekersVorigeMaand), vergelijking: "vs. vorige 30 dagen" },
      { id: "uniek-maand", label: "Unieke bezoekers in periode", waarde: heeftTracking ? bezoekersPeriode : null, verschil: verschilPct(bezoekersPeriode, bezoekersVorigePeriode), vergelijking: vs, reeks: bezoekersReeks },
      { id: "matches", label: "Matches", waarde: null, toelichting: "Niet van toepassing: ZZP Schakel heeft geen matching" },
      { id: "contact", label: "Contactaanvragen (gesprekken)", waarde: contact, verschil: verschilPct(contact, contactVorig), vergelijking: vs, reeks: contactReeks },
      { id: "weergaven", label: "Profielweergaven", waarde: heeftTracking || weergaven > 0 ? weergaven : null, verschil: verschilPct(weergaven, weergavenVorig), vergelijking: vs, reeks: weergavenReeks },
      { id: "zoek", label: "Zoekopdrachten", waarde: heeftTracking || zoek > 0 ? zoek : null, verschil: verschilPct(zoek, zoekVorig), vergelijking: vs, reeks: zoekReeks },
      {
        id: "conversie",
        label: "Conversie bezoeker → registratie",
        waarde: heeftTracking ? pct(registraties, bezoekersPeriode) : null,
        procent: true,
        verschil: heeftTracking ? verschilPct(pct(registraties, bezoekersPeriode) ?? 0, pct(registratiesVorig, bezoekersVorigePeriode) ?? 0) : null,
        vergelijking: vs,
        toelichting: "Registraties gedeeld door unieke bezoekers in de periode",
      },
    ];

    return {
      kpis,
      aandacht: [
        { label: "Wachtende verificaties", waarde: wachtendeVerificaties, href: "/admin/verificaties" },
        { label: "Open reports", waarde: openReports, href: "/admin/reports" },
        { label: "Open klachten", waarde: openKlachten, href: "/admin/klachten" },
        { label: "Nieuwe contactberichten", waarde: nieuweContact, href: "/admin/contact" },
      ],
    };
  });
}

// ── Website analytics ────────────────────────────────────────────────────────

export interface WebsiteStats {
  vandaag: number;
  gisteren: number;
  week: number;
  maand: number;
  uniek: number;
  sessies: number;
  gemSessieduurSec: number | null;
  paginaweergaven: number;
  paginasPerSessie: number | null;
  bouncePct: number | null;
  reeks: { label: string; bezoekers: number; paginaweergaven: number; sessies: number }[];
  heeftData: boolean;
}

export function websiteStats(p: Periode): Promise<WebsiteStats> {
  return cached(`web:${p.query}`, async () => {
    const vandaag = startVanDag(new Date());
    const morgen = plusDagen(vandaag, 1);
    const [vandaagN, gisterenN, weekN, maandN, uniek, sessies, paginaweergaven, duur, bounce, reeksB, reeksP, reeksS] =
      await Promise.all([
        telEvents("page_view", vandaag, morgen, "anonymousId"),
        telEvents("page_view", plusDagen(vandaag, -1), vandaag, "anonymousId"),
        telEvents("page_view", plusDagen(vandaag, -6), morgen, "anonymousId"),
        telEvents("page_view", plusDagen(vandaag, -29), morgen, "anonymousId"),
        telEvents("page_view", p.van, p.tot, "anonymousId"),
        telEvents("page_view", p.van, p.tot, "sessionId"),
        telEvents("page_view", p.van, p.tot),
        db.$queryRaw<{ gem: number | null }[]>`
          SELECT AVG(EXTRACT(EPOCH FROM (mx - mn))) AS gem FROM (
            SELECT "sessionId", MIN("createdAt") mn, MAX("createdAt") mx, COUNT(*) c
            FROM "analytics_events"
            WHERE "sessionId" IS NOT NULL AND "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}
            GROUP BY "sessionId" HAVING COUNT(*) > 1
          ) s`,
        db.$queryRaw<{ bounces: bigint; totaal: bigint }[]>`
          SELECT COUNT(*) FILTER (WHERE c = 1) AS bounces, COUNT(*) AS totaal FROM (
            SELECT "sessionId", COUNT(*) c FROM "analytics_events"
            WHERE "eventName" = 'page_view' AND "sessionId" IS NOT NULL AND "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}
            GROUP BY "sessionId"
          ) s`,
        eventReeks("page_view", p, "anonymousId"),
        eventReeks("page_view", p),
        eventReeks("page_view", p, "sessionId"),
      ]);
    const totaalSessies = n(bounce[0]?.totaal);
    return {
      vandaag: vandaagN,
      gisteren: gisterenN,
      week: weekN,
      maand: maandN,
      uniek,
      sessies,
      gemSessieduurSec: duur[0]?.gem != null ? Math.round(Number(duur[0].gem)) : null,
      paginaweergaven,
      paginasPerSessie: sessies ? Math.round((paginaweergaven / sessies) * 10) / 10 : null,
      bouncePct: totaalSessies ? pct(n(bounce[0]?.bounces), totaalSessies) : null,
      reeks: reeksB.map((b, i) => ({
        label: b.label,
        bezoekers: b.waarde,
        paginaweergaven: reeksP[i]?.waarde ?? 0,
        sessies: reeksS[i]?.waarde ?? 0,
      })),
      heeftData: paginaweergaven > 0,
    };
  });
}

export interface BronRij {
  bron: string;
  bezoekers: number;
  sessies: number;
  registraties: number;
  conversiePct: number | null;
}

/** Herkomst per sessie (eerste page_view van de sessie), met registraties uit dezelfde bezoeker in de periode. */
export function bronnen(p: Periode): Promise<BronRij[]> {
  return cached(`bronnen:${p.query}`, async () => {
    const rows = await db.$queryRaw<
      { referrer: string | null; utmSource: string | null; bezoekers: bigint; sessies: bigint; registraties: bigint }[]
    >`
      WITH eerste AS (
        SELECT DISTINCT ON ("sessionId") "sessionId", "anonymousId", "referrer", "utmSource"
        FROM "analytics_events"
        WHERE "eventName" = 'page_view' AND "sessionId" IS NOT NULL
          AND "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}
        ORDER BY "sessionId", "createdAt" ASC
      ),
      reg AS (
        SELECT DISTINCT "anonymousId" FROM "analytics_events"
        WHERE "eventName" = 'user_registered' AND "anonymousId" IS NOT NULL
          AND "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}
      )
      SELECT e."referrer", e."utmSource",
        COUNT(DISTINCT e."anonymousId") AS bezoekers,
        COUNT(*) AS sessies,
        COUNT(DISTINCT e."anonymousId") FILTER (WHERE e."anonymousId" IN (SELECT "anonymousId" FROM reg)) AS registraties
      FROM eerste e
      GROUP BY 1, 2`;
    const per = new Map<string, BronRij>();
    for (const r of rows) {
      const naam = bronNaam(r.referrer, r.utmSource);
      const b = per.get(naam) ?? { bron: naam, bezoekers: 0, sessies: 0, registraties: 0, conversiePct: null };
      b.bezoekers += n(r.bezoekers);
      b.sessies += n(r.sessies);
      b.registraties += n(r.registraties);
      per.set(naam, b);
    }
    return [...per.values()]
      .map((b) => ({ ...b, conversiePct: pct(b.registraties, b.bezoekers) }))
      .sort((a, b) => b.bezoekers - a.bezoekers);
  });
}

export interface PaginaRij {
  pagina: string;
  bezoeken: number;
  uniek: number;
  gemTijdSec: number | null;
  ctaClicks: number;
  registraties: number;
  conversiePct: number | null;
}

export function paginas(p: Periode): Promise<PaginaRij[]> {
  return cached(`paginas:${p.query}`, async () => {
    const rows = await db.$queryRaw<
      { page: string; bezoeken: bigint; uniek: bigint; gemtijd: number | null; cta: bigint; registraties: bigint }[]
    >`
      WITH ev AS (
        SELECT "page", "sessionId", "anonymousId", "eventName", "createdAt",
          LEAD("createdAt") OVER (PARTITION BY "sessionId" ORDER BY "createdAt") AS volgende
        FROM "analytics_events"
        WHERE "createdAt" >= ${p.van} AND "createdAt" < ${p.tot} AND "page" IS NOT NULL
      ),
      landing AS (
        SELECT DISTINCT ON ("sessionId") "sessionId", "page"
        FROM ev WHERE "eventName" = 'page_view' AND "sessionId" IS NOT NULL
        ORDER BY "sessionId", "createdAt" ASC
      ),
      regsessies AS (
        SELECT DISTINCT "sessionId" FROM "analytics_events"
        WHERE "eventName" = 'user_registered' AND "sessionId" IS NOT NULL
          AND "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}
      )
      SELECT pv."page",
        COUNT(*) FILTER (WHERE pv."eventName" = 'page_view') AS bezoeken,
        COUNT(DISTINCT pv."anonymousId") FILTER (WHERE pv."eventName" = 'page_view') AS uniek,
        AVG(LEAST(EXTRACT(EPOCH FROM (pv.volgende - pv."createdAt")), 1800)) FILTER (WHERE pv."eventName" = 'page_view' AND pv.volgende IS NOT NULL) AS gemtijd,
        COUNT(*) FILTER (WHERE pv."eventName" = 'cta_clicked') AS cta,
        (SELECT COUNT(*) FROM landing l WHERE l."page" = pv."page" AND l."sessionId" IN (SELECT "sessionId" FROM regsessies)) AS registraties
      FROM ev pv
      GROUP BY pv."page"
      HAVING COUNT(*) FILTER (WHERE pv."eventName" = 'page_view') > 0
      ORDER BY bezoeken DESC
      LIMIT 200`;
    return rows.map((r) => ({
      pagina: r.page,
      bezoeken: n(r.bezoeken),
      uniek: n(r.uniek),
      gemTijdSec: r.gemtijd != null ? Math.round(Number(r.gemtijd)) : null,
      ctaClicks: n(r.cta),
      registraties: n(r.registraties),
      conversiePct: pct(n(r.registraties), n(r.uniek)),
    }));
  });
}

export interface VerdelingRij {
  naam: string;
  aantal: number;
}

export interface Devices {
  apparaten: VerdelingRij[];
  browsers: VerdelingRij[];
  besturingssystemen: VerdelingRij[];
}

export function devices(p: Periode): Promise<Devices> {
  return cached(`devices:${p.query}`, async () => {
    const per = async (kolom: "deviceType" | "browser" | "os") => {
      const rows = await db.$queryRaw<{ naam: string | null; aantal: bigint }[]>`
        SELECT ${Prisma.raw(`"${kolom}"`)} AS naam, COUNT(DISTINCT "sessionId") AS aantal
        FROM "analytics_events"
        WHERE "eventName" = 'page_view' AND "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}
        GROUP BY 1 ORDER BY 2 DESC LIMIT 12`;
      return rows.map((r) => ({ naam: r.naam ?? "Onbekend", aantal: n(r.aantal) }));
    };
    const [apparaten, browsers, besturingssystemen] = await Promise.all([per("deviceType"), per("browser"), per("os")]);
    const labels: Record<string, string> = { desktop: "Desktop", mobile: "Mobiel", tablet: "Tablet", onbekend: "Onbekend" };
    return {
      apparaten: apparaten.map((a) => ({ ...a, naam: labels[a.naam] ?? a.naam })),
      browsers,
      besturingssystemen,
    };
  });
}

// ── ZZP'ers ──────────────────────────────────────────────────────────────────

export interface ZzpStats {
  totaal: number;
  vandaag: number;
  week: number;
  maand: number;
  inPeriode: number;
  actief: number;
  compleet: number;
  incompleet: number;
  metFoto: number;
  zonderFoto: number;
  zichtbaar: number;
  gemCompleetheid: number | null;
  reeks: ReeksPunt[];
  sectoren: VerdelingRij[];
  beroepen: VerdelingRij[];
  regios: VerdelingRij[];
  beschikbaarheid: VerdelingRij[];
  zoekwoorden: VerdelingRij[];
}

export function zzpStats(p: Periode): Promise<ZzpStats> {
  return cached(`zzp:${p.query}`, async () => {
    const vandaag = startVanDag(new Date());
    const morgen = plusDagen(vandaag, 1);
    const profielFilter = { deletedAt: null, user: { deletedAt: null } } as const;
    const [totaal, vandaagN, week, maand, inPeriode, actief, profielen, compleet, metFoto, zichtbaar, gem, reeks, skills, regios, besch, zoek] =
      await Promise.all([
        telUsers("ZZP"),
        telUsers("ZZP", vandaag, morgen),
        telUsers("ZZP", plusDagen(vandaag, -6), morgen),
        telUsers("ZZP", plusDagen(vandaag, -29), morgen),
        telUsers("ZZP", p.van, p.tot),
        db.user.count({ where: { role: "ZZP", deletedAt: null, lastLoginAt: { gte: plusDagen(vandaag, -29) } } }),
        db.zZPProfile.count({ where: profielFilter }),
        db.zZPProfile.count({ where: { ...profielFilter, profielCompleetheidPct: 100 } }),
        db.zZPProfile.count({ where: { ...profielFilter, fotoKey: { not: null } } }),
        db.zZPProfile.count({ where: { ...profielFilter, zichtbaar: true } }),
        db.zZPProfile.aggregate({ where: profielFilter, _avg: { profielCompleetheidPct: true } }),
        gebruikersReeks(p, "ZZP"),
        db.$queryRaw<{ slug: string; naam: string; aantal: bigint }[]>`
          SELECT s."slug", s."naam", COUNT(*) AS aantal FROM "ZZPSkill" zs
          JOIN "Skill" s ON s."id" = zs."skillId"
          JOIN "ZZPProfile" p ON p."id" = zs."zzpProfileId" AND p."deletedAt" IS NULL
          GROUP BY 1, 2 ORDER BY 3 DESC`,
        db.$queryRaw<{ naam: string; aantal: bigint }[]>`
          SELECT INITCAP(LOWER(TRIM("werkgebiedPlaats"))) AS naam, COUNT(*) AS aantal FROM "ZZPProfile"
          WHERE "werkgebiedPlaats" IS NOT NULL AND TRIM("werkgebiedPlaats") <> '' AND "deletedAt" IS NULL
          GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
        db.$queryRaw<{ naam: string; aantal: bigint }[]>`
          SELECT a."type"::text AS naam, COUNT(DISTINCT a."zzpProfileId") AS aantal FROM "Availability" a
          GROUP BY 1 ORDER BY 2 DESC`,
        db.$queryRaw<{ naam: string; aantal: bigint }[]>`
          SELECT COALESCE(NULLIF("metadata"->>'vak', ''), '(alleen plaats)') AS naam, COUNT(*) AS aantal
          FROM "analytics_events" WHERE "eventName" = 'search_performed'
            AND "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}
          GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
      ]);
    const perSector = new Map<string, number>();
    for (const s of skills) {
      const sec = sectorVan(s.slug);
      perSector.set(sec, (perSector.get(sec) ?? 0) + n(s.aantal));
    }
    const beschLabels: Record<string, string> = { FULLTIME: "Fulltime", PARTTIME: "Parttime", INCIDENTEEL: "Incidenteel" };
    return {
      totaal,
      vandaag: vandaagN,
      week,
      maand,
      inPeriode,
      actief,
      compleet,
      incompleet: profielen - compleet,
      metFoto,
      zonderFoto: profielen - metFoto,
      zichtbaar,
      gemCompleetheid: profielen ? Math.round(gem._avg.profielCompleetheidPct ?? 0) : null,
      reeks,
      sectoren: [...perSector.entries()].map(([naam, aantal]) => ({ naam, aantal })).sort((a, b) => b.aantal - a.aantal),
      beroepen: skills.slice(0, 15).map((s) => ({ naam: s.naam, aantal: n(s.aantal) })),
      regios: regios.map((r) => ({ naam: r.naam, aantal: n(r.aantal) })),
      beschikbaarheid: besch.map((b) => ({ naam: beschLabels[b.naam] ?? b.naam, aantal: n(b.aantal) })),
      zoekwoorden: zoek.map((z) => ({ naam: z.naam, aantal: n(z.aantal) })),
    };
  });
}

// ── Bedrijven ────────────────────────────────────────────────────────────────

export interface BedrijfStats {
  totaal: number;
  vandaag: number;
  week: number;
  maand: number;
  inPeriode: number;
  actief: number;
  compleet: number;
  incompleet: number;
  opdrachten: null;
  contactaanvragen: number;
  contactInPeriode: number;
  reeks: ReeksPunt[];
  regios: VerdelingRij[];
  werkzaamheden: VerdelingRij[];
}

export function bedrijfStats(p: Periode): Promise<BedrijfStats> {
  return cached(`bedrijf:${p.query}`, async () => {
    const vandaag = startVanDag(new Date());
    const morgen = plusDagen(vandaag, 1);
    const [totaal, vandaagN, week, maand, inPeriode, actief, compleet, bedrijven, contact, contactPeriode, reeks, regios, werk] =
      await Promise.all([
        telUsers("COMPANY"),
        telUsers("COMPANY", vandaag, morgen),
        telUsers("COMPANY", plusDagen(vandaag, -6), morgen),
        telUsers("COMPANY", plusDagen(vandaag, -29), morgen),
        telUsers("COMPANY", p.van, p.tot),
        db.user.count({ where: { role: "COMPANY", deletedAt: null, lastLoginAt: { gte: plusDagen(vandaag, -29) } } }),
        db.company.count({ where: { naam: { not: "" }, kvkNummer: { not: null }, members: { some: {} } } }),
        db.company.count({ where: { members: { some: {} } } }),
        db.conversation.count(),
        db.conversation.count({ where: { createdAt: { gte: p.van, lt: p.tot } } }),
        gebruikersReeks(p, "COMPANY"),
        db.$queryRaw<{ naam: string; aantal: bigint }[]>`
          SELECT INITCAP(LOWER(TRIM("regio"))) AS naam, COUNT(*) AS aantal FROM "Company"
          WHERE "regio" IS NOT NULL AND TRIM("regio") <> '' GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
        db.$queryRaw<{ naam: string; aantal: bigint }[]>`
          SELECT INITCAP(LOWER(TRIM("typeWerkzaamheden"))) AS naam, COUNT(*) AS aantal FROM "Company"
          WHERE "typeWerkzaamheden" IS NOT NULL AND TRIM("typeWerkzaamheden") <> '' GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
      ]);
    return {
      totaal,
      vandaag: vandaagN,
      week,
      maand,
      inPeriode,
      actief,
      compleet,
      incompleet: bedrijven - compleet,
      opdrachten: null,
      contactaanvragen: contact,
      contactInPeriode: contactPeriode,
      reeks,
      regios: regios.map((r) => ({ naam: r.naam, aantal: n(r.aantal) })),
      werkzaamheden: werk.map((r) => ({ naam: r.naam, aantal: n(r.aantal) })),
    };
  });
}

// ── Contact (matching bestaat niet) ──────────────────────────────────────────

export interface ContactStats {
  totaal: number;
  vandaag: number;
  week: number;
  maand: number;
  inPeriode: number;
  vorigePeriode: number;
  gemPerZzper: number | null;
  gemPerBedrijf: number | null;
  beantwoord: number;
  beantwoordPct: number | null;
  berichten: number;
  berichtenInPeriode: number;
  weergaveNaarContactPct: number | null;
  reeks: ReeksPunt[];
}

export function contactStats(p: Periode): Promise<ContactStats> {
  return cached(`contact:${p.query}`, async () => {
    const vandaag = startVanDag(new Date());
    const morgen = plusDagen(vandaag, 1);
    const tel = (van?: Date, tot?: Date) =>
      db.conversation.count({ where: van && tot ? { createdAt: { gte: van, lt: tot } } : {} });
    const [totaal, vandaagN, week, maand, inPeriode, vorige, zzpMet, bedrijfMet, beantwoord, berichten, berichtenPeriode, weergaven, reeks] =
      await Promise.all([
        tel(),
        tel(vandaag, morgen),
        tel(plusDagen(vandaag, -6), morgen),
        tel(plusDagen(vandaag, -29), morgen),
        tel(p.van, p.tot),
        tel(p.vorigeVan, p.vorigeTot),
        db.$queryRaw<{ c: bigint }[]>`SELECT COUNT(DISTINCT "zzpProfileId") AS c FROM "Conversation"`,
        db.$queryRaw<{ c: bigint }[]>`SELECT COUNT(DISTINCT "companyId") AS c FROM "Conversation"`,
        db.$queryRaw<{ c: bigint }[]>`
          SELECT COUNT(*) AS c FROM "Conversation" c
          WHERE EXISTS (
            SELECT 1 FROM "Message" m JOIN "ZZPProfile" z ON z."id" = c."zzpProfileId"
            WHERE m."conversationId" = c."id" AND m."senderUserId" = z."userId"
          )`,
        db.message.count(),
        db.message.count({ where: { createdAt: { gte: p.van, lt: p.tot } } }),
        telEvents("profile_viewed", p.van, p.tot),
        gesprekkenReeks(p),
      ]);
    const zzpN = n(zzpMet[0]?.c);
    const bedrijfN = n(bedrijfMet[0]?.c);
    return {
      totaal,
      vandaag: vandaagN,
      week,
      maand,
      inPeriode,
      vorigePeriode: vorige,
      gemPerZzper: zzpN ? Math.round((totaal / zzpN) * 10) / 10 : null,
      gemPerBedrijf: bedrijfN ? Math.round((totaal / bedrijfN) * 10) / 10 : null,
      beantwoord: n(beantwoord[0]?.c),
      beantwoordPct: pct(n(beantwoord[0]?.c), totaal),
      berichten,
      berichtenInPeriode: berichtenPeriode,
      weergaveNaarContactPct: weergaven ? pct(inPeriode, weergaven) : null,
      reeks,
    };
  });
}

// ── Funnel / conversie ───────────────────────────────────────────────────────

export interface FunnelStap {
  id: string;
  label: string;
  waarde: number | null;
  toelichting?: string;
}

export interface Funnel {
  stappen: FunnelStap[];
  per1000: { zzpers: number | null; bedrijven: number | null };
  registratieNaarProfielPct: number | null;
  contactNaarAntwoordPct: number | null;
}

export function funnel(p: Periode): Promise<Funnel> {
  return cached(`funnel:${p.query}`, async () => {
    const [bezoekers, registraties, zzpNieuw, bedrijfNieuw, profielen, bedrijfProfielen, zoekers, kijkers, contact, beantwoord] =
      await Promise.all([
        telEvents("page_view", p.van, p.tot, "anonymousId"),
        telUsers(null, p.van, p.tot),
        telUsers("ZZP", p.van, p.tot),
        telUsers("COMPANY", p.van, p.tot),
        db.zZPProfile.count({ where: { deletedAt: null, voornaam: { not: null }, createdAt: { gte: p.van, lt: p.tot } } }),
        db.company.count({ where: { naam: { not: "" }, kvkNummer: { not: null }, createdAt: { gte: p.van, lt: p.tot } } }),
        telEvents("search_performed", p.van, p.tot, "userId"),
        telEvents("profile_viewed", p.van, p.tot, "userId"),
        db.conversation.count({ where: { createdAt: { gte: p.van, lt: p.tot } } }),
        db.$queryRaw<{ c: bigint }[]>`
          SELECT COUNT(*) AS c FROM "Conversation" c
          WHERE c."createdAt" >= ${p.van} AND c."createdAt" < ${p.tot} AND EXISTS (
            SELECT 1 FROM "Message" m JOIN "ZZPProfile" z ON z."id" = c."zzpProfileId"
            WHERE m."conversationId" = c."id" AND m."senderUserId" = z."userId")`,
      ]);
    const heeftTracking = bezoekers > 0;
    const profielTotaal = profielen + bedrijfProfielen;
    return {
      stappen: [
        { id: "bezoeker", label: "Websitebezoeker", waarde: heeftTracking ? bezoekers : null, toelichting: "Unieke bezoekers (pseudoniem)" },
        { id: "registratie", label: "Registratie", waarde: registraties },
        { id: "profiel", label: "Profiel aangemaakt", waarde: profielTotaal, toelichting: "Zzp-profiel met naam of bedrijfsprofiel met naam en KvK" },
        { id: "zoek", label: "Zoekopdracht", waarde: heeftTracking ? zoekers : null, toelichting: "Ingelogde gebruikers met minstens één zoekopdracht" },
        { id: "weergave", label: "Profielweergave", waarde: heeftTracking ? kijkers : null, toelichting: "Ingelogde gebruikers die een profiel bekeken" },
        { id: "contact", label: "Contact", waarde: contact, toelichting: "Nieuwe gesprekken" },
        { id: "match", label: "Match", waarde: null, toelichting: "Niet van toepassing: geen matching op ZZP Schakel" },
        { id: "opdracht", label: "Opdracht", waarde: null, toelichting: "Niet van toepassing: geen opdrachten op ZZP Schakel" },
      ],
      per1000: {
        zzpers: heeftTracking ? Math.round((zzpNieuw / bezoekers) * 1000 * 10) / 10 : null,
        bedrijven: heeftTracking ? Math.round((bedrijfNieuw / bezoekers) * 1000 * 10) / 10 : null,
      },
      registratieNaarProfielPct: pct(profielTotaal, registraties),
      contactNaarAntwoordPct: pct(n(beantwoord[0]?.c), contact),
    };
  });
}

// ── Zoekgedrag ───────────────────────────────────────────────────────────────

export interface ZoekRij {
  vak: string;
  plaats: string;
  aantal: number;
  gemResultaten: number | null;
  zonderResultaat: number;
}

export interface Zoekgedrag {
  totaal: number;
  zonderResultaat: number;
  gemResultaten: number | null;
  naarProfielweergavePct: number | null;
  naarContactPct: number | null;
  top: ZoekRij[];
  vakken: VerdelingRij[];
  plaatsen: VerdelingRij[];
  zonderResultaatLijst: ZoekRij[];
}

export function zoekgedrag(p: Periode): Promise<Zoekgedrag> {
  return cached(`zoek:${p.query}`, async () => {
    const basis = Prisma.sql`"eventName" = 'search_performed' AND "createdAt" >= ${p.van} AND "createdAt" < ${p.tot}`;
    const [totaal, zonder, gem, top, vakken, plaatsen, vervolg] = await Promise.all([
      db.analyticsEvent.count({ where: { eventName: "search_performed", createdAt: { gte: p.van, lt: p.tot } } }),
      db.$queryRaw<{ c: bigint }[]>`SELECT COUNT(*) AS c FROM "analytics_events" WHERE ${basis} AND ("metadata"->>'resultaten')::int = 0`,
      db.$queryRaw<{ gem: number | null }[]>`SELECT AVG(("metadata"->>'resultaten')::numeric) AS gem FROM "analytics_events" WHERE ${basis} AND "metadata"->>'resultaten' IS NOT NULL`,
      db.$queryRaw<{ vak: string | null; plaats: string | null; aantal: bigint; gem: number | null; zonder: bigint }[]>`
        SELECT "metadata"->>'vak' AS vak, "metadata"->>'plaats' AS plaats, COUNT(*) AS aantal,
          AVG(("metadata"->>'resultaten')::numeric) AS gem,
          COUNT(*) FILTER (WHERE ("metadata"->>'resultaten')::int = 0) AS zonder
        FROM "analytics_events" WHERE ${basis}
        GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 50`,
      db.$queryRaw<{ naam: string; aantal: bigint }[]>`
        SELECT "metadata"->>'vak' AS naam, COUNT(*) AS aantal FROM "analytics_events"
        WHERE ${basis} AND "metadata"->>'vak' IS NOT NULL GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
      db.$queryRaw<{ naam: string; aantal: bigint }[]>`
        SELECT "metadata"->>'plaats' AS naam, COUNT(*) AS aantal FROM "analytics_events"
        WHERE ${basis} AND "metadata"->>'plaats' IS NOT NULL GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
      db.$queryRaw<{ sessies: bigint; weergave: bigint; contact: bigint }[]>`
        WITH z AS (
          SELECT DISTINCT "sessionId" FROM "analytics_events" WHERE ${basis} AND "sessionId" IS NOT NULL
        )
        SELECT COUNT(*) AS sessies,
          COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "analytics_events" e WHERE e."sessionId" = z."sessionId" AND e."eventName" = 'profile_viewed' AND e."createdAt" >= ${p.van} AND e."createdAt" < ${p.tot})) AS weergave,
          COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "analytics_events" e WHERE e."sessionId" = z."sessionId" AND e."eventName" = 'contact_request_sent' AND e."createdAt" >= ${p.van} AND e."createdAt" < ${p.tot})) AS contact
        FROM z`,
    ]);
    const rij = (r: { vak: string | null; plaats: string | null; aantal: bigint; gem: number | null; zonder: bigint }): ZoekRij => ({
      vak: r.vak ?? "(alle vakgebieden)",
      plaats: r.plaats ?? "(heel Nederland)",
      aantal: n(r.aantal),
      gemResultaten: r.gem != null ? Math.round(Number(r.gem) * 10) / 10 : null,
      zonderResultaat: n(r.zonder),
    });
    const sessies = n(vervolg[0]?.sessies);
    return {
      totaal,
      zonderResultaat: n(zonder[0]?.c),
      gemResultaten: gem[0]?.gem != null ? Math.round(Number(gem[0].gem) * 10) / 10 : null,
      naarProfielweergavePct: sessies ? pct(n(vervolg[0]?.weergave), sessies) : null,
      naarContactPct: sessies ? pct(n(vervolg[0]?.contact), sessies) : null,
      top: top.map(rij),
      vakken: vakken.map((v) => ({ naam: v.naam, aantal: n(v.aantal) })),
      plaatsen: plaatsen.map((v) => ({ naam: v.naam, aantal: n(v.aantal) })),
      zonderResultaatLijst: top.map(rij).filter((r) => r.zonderResultaat > 0).sort((a, b) => b.zonderResultaat - a.zonderResultaat),
    };
  });
}

// ── Profielkwaliteit ─────────────────────────────────────────────────────────

export interface KwaliteitRij {
  label: string;
  aantal: number | null;
  totaal: number;
  toelichting?: string;
}

export function profielKwaliteit(): Promise<{ zzp: KwaliteitRij[]; bedrijf: KwaliteitRij[] }> {
  return cached("kwaliteit", async () => {
    const f = { deletedAt: null, user: { deletedAt: null } } as const;
    const [tot, naam, compleet, foto, over, ervaring, locatie, spec, besch, kvk, tarief] = await Promise.all([
      db.zZPProfile.count({ where: f }),
      db.zZPProfile.count({ where: { ...f, voornaam: { not: null } } }),
      db.zZPProfile.count({ where: { ...f, profielCompleetheidPct: 100 } }),
      db.zZPProfile.count({ where: { ...f, fotoKey: { not: null } } }),
      db.zZPProfile.count({ where: { ...f, over: { not: null } } }),
      db.zZPProfile.count({ where: { ...f, jarenErvaring: { not: null } } }),
      db.zZPProfile.count({ where: { ...f, werkgebiedPlaats: { not: null } } }),
      db.zZPProfile.count({ where: { ...f, OR: [{ specializations: { some: {} } }, { specialisatieAnders: { not: null } }] } }),
      db.zZPProfile.count({ where: { ...f, OR: [{ availability: { some: {} } }, { startdatum: { not: null } }] } }),
      db.zZPProfile.count({ where: { ...f, kvkNummer: { not: null } } }),
      db.zZPProfile.count({ where: { ...f, uurtariefCents: { not: null } } }),
    ]);
    const cf = { members: { some: {} } } as const;
    const [ctot, cnaam, ccompleet, comschrijving, clocatie, ccontact, csector, cwebsite] = await Promise.all([
      db.company.count({ where: cf }),
      db.company.count({ where: { ...cf, naam: { not: "" } } }),
      db.company.count({ where: { ...cf, naam: { not: "" }, kvkNummer: { not: null } } }),
      db.company.count({ where: { ...cf, omschrijving: { not: null } } }),
      db.company.count({ where: { ...cf, regio: { not: null } } }),
      db.company.count({ where: { ...cf, OR: [{ telefoon: { not: null } }, { contactpersoon: { not: null } }] } }),
      db.company.count({ where: { ...cf, typeWerkzaamheden: { not: null } } }),
      db.company.count({ where: { ...cf, website: { not: null } } }),
    ]);
    return {
      zzp: [
        { label: "Profiel aangemaakt (naam)", aantal: naam, totaal: tot },
        { label: "KvK-nummer", aantal: kvk, totaal: tot },
        { label: "Locatie / werkgebied", aantal: locatie, totaal: tot },
        { label: "Beschikbaarheid", aantal: besch, totaal: tot },
        { label: "Ervaring", aantal: ervaring, totaal: tot },
        { label: "Uurtarief", aantal: tarief, totaal: tot },
        { label: "Omschrijving", aantal: over, totaal: tot },
        { label: "Specialisaties", aantal: spec, totaal: tot },
        { label: "Foto", aantal: foto, totaal: tot },
        { label: "Profiel 100% compleet", aantal: compleet, totaal: tot },
      ],
      bedrijf: [
        { label: "Bedrijfsnaam", aantal: cnaam, totaal: ctot },
        { label: "Bedrijfsprofiel compleet (naam + KvK)", aantal: ccompleet, totaal: ctot },
        { label: "Omschrijving", aantal: comschrijving, totaal: ctot },
        { label: "Locatie / regio", aantal: clocatie, totaal: ctot },
        { label: "Contactgegevens", aantal: ccontact, totaal: ctot },
        { label: "Sector / type werkzaamheden", aantal: csector, totaal: ctot },
        { label: "Website", aantal: cwebsite, totaal: ctot },
        { label: "Logo", aantal: null, totaal: ctot, toelichting: "Nog geen logoveld in het bedrijfsprofiel" },
        { label: "Opdrachten", aantal: null, totaal: ctot, toelichting: "Niet van toepassing" },
      ],
    };
  });
}

// ── Live activiteit ──────────────────────────────────────────────────────────

const FEED_EVENTS: EventName[] = [
  "zzper_registered",
  "company_registered",
  "profile_created",
  "profile_visible",
  "company_profile_completed",
  "search_performed",
  "contact_request_sent",
  "message_sent",
  "profile_viewed",
  "contact_form_sent",
  "profile_reported",
];

export interface ActiviteitItem {
  id: string;
  tijd: string;
  event: EventName;
  tekst: string;
}

function activiteitTekst(e: { eventName: string; userRole: string | null; metadata: unknown }): string {
  const m = (e.metadata ?? {}) as Record<string, unknown>;
  const rol = e.userRole === "COMPANY" ? "Opdrachtgever" : e.userRole === "ZZP" ? "Zzp'er" : "Bezoeker";
  switch (e.eventName as EventName) {
    case "search_performed": {
      const vak = typeof m.vak === "string" ? `"${m.vak}"` : "alle vakgebieden";
      const plaats = typeof m.plaats === "string" ? ` in ${m.plaats}` : "";
      const res = typeof m.resultaten === "number" ? ` (${m.resultaten} resultaten)` : "";
      return `${rol} zocht naar ${vak}${plaats}${res}`;
    }
    case "profile_viewed":
      return `Opdrachtgever bekeek een profiel${typeof m.vak === "string" ? ` (${m.vak})` : ""}`;
    case "message_sent":
      return `${rol} stuurde een bericht`;
    case "company_profile_completed":
      return `Bedrijfsprofiel afgerond${typeof m.regio === "string" && m.regio ? ` (${m.regio})` : ""}`;
    default:
      return EVENTS[e.eventName as EventName] ?? e.eventName;
  }
}

export async function activiteit(sinds?: Date, limit = 40): Promise<ActiviteitItem[]> {
  const rows = await db.analyticsEvent.findMany({
    where: { eventName: { in: FEED_EVENTS }, ...(sinds ? { createdAt: { gt: sinds } } : {}) },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, eventName: true, userRole: true, metadata: true, createdAt: true },
  });
  return rows.map((r) => ({
    id: r.id,
    tijd: r.createdAt.toISOString(),
    event: r.eventName as EventName,
    tekst: activiteitTekst(r),
  }));
}

// ── Geografie ────────────────────────────────────────────────────────────────

export function geografie(): Promise<{ zzp: VerdelingRij[]; bedrijven: VerdelingRij[] }> {
  return cached("geo", async () => {
    const [zzp, bedrijven] = await Promise.all([
      db.$queryRaw<{ naam: string; aantal: bigint }[]>`
        SELECT INITCAP(LOWER(TRIM("werkgebiedPlaats"))) AS naam, COUNT(*) AS aantal FROM "ZZPProfile"
        WHERE "werkgebiedPlaats" IS NOT NULL AND TRIM("werkgebiedPlaats") <> '' AND "deletedAt" IS NULL AND "zichtbaar" = true
        GROUP BY 1 ORDER BY 2 DESC LIMIT 20`,
      db.$queryRaw<{ naam: string; aantal: bigint }[]>`
        SELECT INITCAP(LOWER(TRIM("regio"))) AS naam, COUNT(*) AS aantal FROM "Company"
        WHERE "regio" IS NOT NULL AND TRIM("regio") <> '' GROUP BY 1 ORDER BY 2 DESC LIMIT 20`,
    ]);
    return {
      zzp: zzp.map((r) => ({ naam: r.naam, aantal: n(r.aantal) })),
      bedrijven: bedrijven.map((r) => ({ naam: r.naam, aantal: n(r.aantal) })),
    };
  });
}

// ── Export (CSV) ─────────────────────────────────────────────────────────────

export type ExportDataset = "zzp-registraties" | "bedrijfsregistraties" | "events" | "contactaanvragen";

export async function exportRows(dataset: ExportDataset, p: Periode): Promise<Record<string, unknown>[]> {
  const bereik = { gte: p.van, lt: p.tot };
  switch (dataset) {
    case "zzp-registraties": {
      const rows = await db.user.findMany({
        where: { role: "ZZP", deletedAt: null, createdAt: bereik },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, createdAt: true, emailVerifiedAt: true, lastLoginAt: true,
          zzpProfile: { select: { werkgebiedPlaats: true, profielCompleetheidPct: true, zichtbaar: true, verificatieStatus: true, kvkNummer: true } },
        },
        take: 20000,
      });
      return rows.map((r) => ({
        id: r.id, geregistreerd: r.createdAt.toISOString(), email_bevestigd: !!r.emailVerifiedAt,
        laatste_login: r.lastLoginAt?.toISOString() ?? "", plaats: r.zzpProfile?.werkgebiedPlaats ?? "",
        compleetheid_pct: r.zzpProfile?.profielCompleetheidPct ?? 0, zichtbaar: r.zzpProfile?.zichtbaar ?? false,
        verificatie: r.zzpProfile?.verificatieStatus ?? "", kvk_ingevuld: !!r.zzpProfile?.kvkNummer,
      }));
    }
    case "bedrijfsregistraties": {
      const rows = await db.user.findMany({
        where: { role: "COMPANY", deletedAt: null, createdAt: bereik },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, createdAt: true, emailVerifiedAt: true, lastLoginAt: true,
          companyMemberships: { select: { company: { select: { id: true, regio: true, kvkNummer: true, naam: true, typeWerkzaamheden: true, verificatieStatus: true } } } },
        },
        take: 20000,
      });
      return rows.map((r) => {
        const c = r.companyMemberships[0]?.company;
        return {
          id: r.id, geregistreerd: r.createdAt.toISOString(), email_bevestigd: !!r.emailVerifiedAt,
          laatste_login: r.lastLoginAt?.toISOString() ?? "", bedrijf_id: c?.id ?? "", profiel_compleet: !!(c?.naam && c?.kvkNummer),
          regio: c?.regio ?? "", type_werkzaamheden: c?.typeWerkzaamheden ?? "", verificatie: c?.verificatieStatus ?? "",
        };
      });
    }
    case "contactaanvragen": {
      const rows = await db.conversation.findMany({
        where: { createdAt: bereik },
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true, laatsteBericht: true, companyId: true, zzpProfileId: true, _count: { select: { messages: true } } },
        take: 20000,
      });
      return rows.map((r) => ({
        id: r.id, aangemaakt: r.createdAt.toISOString(), laatste_bericht: r.laatsteBericht.toISOString(),
        bedrijf_id: r.companyId, zzp_profiel_id: r.zzpProfileId, aantal_berichten: r._count.messages,
      }));
    }
    case "events":
    default: {
      const rows = await db.analyticsEvent.findMany({
        where: { createdAt: bereik },
        orderBy: { createdAt: "desc" },
        take: 50000,
      });
      return rows.map((r) => ({
        id: r.id, tijdstip: r.createdAt.toISOString(), event: r.eventName, gebruiker_id: r.userId ?? "", rol: r.userRole ?? "",
        bezoeker_id: r.anonymousId ?? "", sessie_id: r.sessionId ?? "", pagina: r.page ?? "", referrer: r.referrer ?? "",
        utm_source: r.utmSource ?? "", utm_medium: r.utmMedium ?? "", utm_campaign: r.utmCampaign ?? "",
        apparaat: r.deviceType ?? "", browser: r.browser ?? "", os: r.os ?? "", metadata: r.metadata ? JSON.stringify(r.metadata) : "",
      }));
    }
  }
}

export function naarCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const kolommen = Object.keys(rows[0]!);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [kolommen.join(";"), ...rows.map((r) => kolommen.map((k) => esc(r[k])).join(";"))].join("\n");
}
