import "server-only";
import { cookies, headers } from "next/headers";
import type { Prisma, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import {
  ANONYMOUS_ID_COOKIE,
  SESSION_ID_COOKIE,
  type EventMetadata,
  type EventName,
} from "@/lib/analytics/events";
import { parseUserAgent } from "@/lib/analytics/ua";

export interface TrackOpties {
  userId?: string | null;
  userRole?: UserRole | null;
  /** Pad van de pagina waarop dit gebeurde, bijv. "/vind-zzper". */
  page?: string | null;
  metadata?: EventMetadata;
}

/**
 * Centrale server-side trackingfunctie. Gebruik in server actions, server
 * components en route handlers:
 *
 *   await trackEvent("contact_request_sent", { userId, metadata: { zzpProfileId } });
 *
 * Koppelt het event aan dezelfde bezoeker/sessie als de browser-tracking via
 * de cookies zs_aid/zs_sid. Faalt nooit richting de aanroeper: een
 * analytics-fout mag een gebruikersactie niet breken.
 */
export async function trackEvent(name: EventName, opties: TrackOpties = {}): Promise<void> {
  try {
    const [store, h] = await Promise.all([cookies(), headers()]);
    const ua = parseUserAgent(h.get("user-agent"));
    const anonymousId = geldigId(store.get(ANONYMOUS_ID_COOKIE)?.value);
    const sessionId = geldigId(store.get(SESSION_ID_COOKIE)?.value);

    await db.analyticsEvent.create({
      data: {
        eventName: name,
        userId: opties.userId ?? null,
        userRole: opties.userRole ?? null,
        anonymousId,
        sessionId,
        page: opties.page?.slice(0, 200) ?? null,
        deviceType: ua.deviceType,
        browser: ua.browser,
        os: ua.os,
        metadata: opties.metadata
          ? (opties.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });
  } catch (err) {
    // Alleen loggen; nooit doorgooien.
    console.error("[analytics] event niet opgeslagen:", name, err);
  }
}

/** Alleen onze eigen willekeurige id's (32 hex-tekens) accepteren. */
export function geldigId(value: string | undefined | null): string | null {
  return value && /^[a-f0-9]{32}$/i.test(value) ? value.toLowerCase() : null;
}
