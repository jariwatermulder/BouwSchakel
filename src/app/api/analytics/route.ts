import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { getSessionUser } from "@/lib/auth/session";
import { parseUserAgent } from "@/lib/analytics/ua";
import { referrerHost } from "@/lib/analytics/bronnen";
import { geldigId } from "@/lib/analytics/track";
import { CLIENT_EVENTS, type EventName } from "@/lib/analytics/events";

/**
 * Ingest-eindpunt voor browser-events (gebundeld). Alleen events uit
 * CLIENT_EVENTS worden geaccepteerd; de ingelogde gebruiker wordt server-side
 * uit de sessiecookie bepaald (de browser kan geen user-id opgeven).
 */
const metadataSchema = z
  .record(z.string().max(60), z.union([z.string().max(300), z.number(), z.boolean(), z.null()]))
  .refine((m) => Object.keys(m).length <= 20, "Te veel metadata");

const eventSchema = z.object({
  name: z.enum(CLIENT_EVENTS as [EventName, ...EventName[]]),
  page: z.string().max(200),
  referrer: z.string().max(2000).nullable().optional(),
  utm: z
    .object({
      source: z.string().max(100).optional(),
      medium: z.string().max(100).optional(),
      campaign: z.string().max(100).optional(),
    })
    .optional(),
  metadata: metadataSchema.optional(),
  ts: z.number().optional(),
});

const bodySchema = z.object({
  anonymousId: z.string().regex(/^[a-f0-9]{32}$/i),
  sessionId: z.string().regex(/^[a-f0-9]{32}$/i),
  events: z.array(eventSchema).min(1).max(25),
});

export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige events" }, { status: 400 });
  }
  const { anonymousId, sessionId, events } = parsed.data;

  // Per bezoeker max. 300 events per 5 minuten.
  if (!rateLimit(`analytics:${anonymousId}`, 300, 5 * 60 * 1000).success) {
    return new Response(null, { status: 429 });
  }

  const [user, ua] = await Promise.all([
    getSessionUser().catch(() => null),
    Promise.resolve(parseUserAgent(req.headers.get("user-agent"))),
  ]);
  const eigenHost = req.headers.get("host") ?? undefined;
  const nu = Date.now();

  const rows: Prisma.AnalyticsEventCreateManyInput[] = events.map((e) => {
    // Tijdstip uit de browser alleen accepteren binnen een marge van 5 minuten.
    const ts = e.ts && Math.abs(nu - e.ts) < 5 * 60 * 1000 ? new Date(e.ts) : new Date(nu);
    return {
      eventName: e.name,
      userId: user?.id ?? null,
      userRole: user?.role ?? null,
      anonymousId: geldigId(anonymousId),
      sessionId: geldigId(sessionId),
      page: e.page,
      referrer: referrerHost(e.referrer, eigenHost),
      utmSource: e.utm?.source ?? null,
      utmMedium: e.utm?.medium ?? null,
      utmCampaign: e.utm?.campaign ?? null,
      deviceType: ua.deviceType,
      browser: ua.browser,
      os: ua.os,
      metadata: e.metadata ? (e.metadata as Prisma.InputJsonValue) : undefined,
      createdAt: ts,
    };
  });

  try {
    await db.analyticsEvent.createMany({ data: rows });
    // Bewaartermijn (privacyverklaring): maximaal 24 maanden. Opportunistisch
    // opruimen bij ~1% van de verzoeken, zodat er geen aparte cronjob nodig is.
    if (Math.random() < 0.01) {
      const grens = new Date();
      grens.setMonth(grens.getMonth() - 24);
      db.analyticsEvent.deleteMany({ where: { createdAt: { lt: grens } } }).catch(() => {});
    }
  } catch (err) {
    console.error("[analytics] ingest mislukt:", err);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
