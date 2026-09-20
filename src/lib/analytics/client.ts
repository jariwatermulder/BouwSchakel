"use client";

import {
  ANONYMOUS_ID_COOKIE,
  CLIENT_EVENTS,
  SESSION_ID_COOKIE,
  SESSION_TIMEOUT_MS,
  type EventMetadata,
  type EventName,
} from "@/lib/analytics/events";

/**
 * Browserkant van de first-party tracking.
 *
 * - Pseudonieme bezoeker-id (willekeurig, in localStorage + cookie) en
 *   sessie-id (30 min zonder activiteit = nieuwe sessie).
 * - Geen fingerprinting, geen IP, geen ruwe user-agent.
 * - Respecteert "Do Not Track" en Global Privacy Control: dan wordt niets
 *   verstuurd.
 * - Events worden kort gebundeld en met keepalive/sendBeacon verstuurd zodat
 *   ook een pagina-verlating nog aankomt.
 */

interface ClientEvent {
  name: EventName;
  page: string;
  referrer?: string | null;
  utm?: { source?: string; medium?: string; campaign?: string };
  metadata?: EventMetadata;
  ts: number;
}

const AID_KEY = "zs_aid";
const SID_KEY = "zs_sid";
const SID_TS_KEY = "zs_sid_ts";
const FLUSH_MS = 300;

let queue: ClientEvent[] = [];
let flushTimer: number | null = null;

function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function trackingToegestaan(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return false;
  return true;
}

function setCookie(naam: string, waarde: string, maxAgeSec: number) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${naam}=${waarde}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${secure}`;
}

function lees(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function schrijf(store: Storage, key: string, value: string) {
  try {
    store.setItem(key, value);
  } catch {
    // opslag niet beschikbaar (privémodus): dan alleen cookie
  }
}

export function anonymousId(): string {
  let id = lees(localStorage, AID_KEY);
  if (!id || !/^[a-f0-9]{32}$/.test(id)) {
    id = randomId();
    schrijf(localStorage, AID_KEY, id);
  }
  setCookie(ANONYMOUS_ID_COOKIE, id, 60 * 60 * 24 * 365);
  return id;
}

/** Geeft de sessie-id terug; `nieuw` is true als er zojuist een nieuwe sessie begon. */
export function sessionId(): { id: string; nieuw: boolean } {
  const nu = Date.now();
  let id = lees(sessionStorage, SID_KEY);
  const ts = Number(lees(sessionStorage, SID_TS_KEY) ?? 0);
  let nieuw = false;
  if (!id || !/^[a-f0-9]{32}$/.test(id) || nu - ts > SESSION_TIMEOUT_MS) {
    id = randomId();
    nieuw = true;
    schrijf(sessionStorage, SID_KEY, id);
  }
  schrijf(sessionStorage, SID_TS_KEY, String(nu));
  setCookie(SESSION_ID_COOKIE, id, Math.round(SESSION_TIMEOUT_MS / 1000));
  return { id, nieuw };
}

function verstuur(events: ClientEvent[], beacon: boolean) {
  if (events.length === 0) return;
  const body = JSON.stringify({
    anonymousId: anonymousId(),
    sessionId: sessionId().id,
    events,
  });
  if (beacon && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // stil falen: analytics mag de site nooit hinderen
  });
}

export function flush(beacon = false) {
  if (flushTimer !== null) {
    window.clearTimeout(flushTimer);
    flushTimer = null;
  }
  const batch = queue;
  queue = [];
  verstuur(batch, beacon);
}

/**
 * Centrale client-trackingfunctie. Alleen events uit CLIENT_EVENTS worden
 * geaccepteerd; de rest komt uitsluitend server-side.
 */
export function track(name: EventName, metadata?: EventMetadata, extra?: Partial<ClientEvent>) {
  if (!trackingToegestaan()) return;
  if (!CLIENT_EVENTS.includes(name)) return;
  queue.push({
    name,
    page: location.pathname,
    metadata,
    ts: Date.now(),
    ...extra,
  });
  if (flushTimer === null) {
    flushTimer = window.setTimeout(() => flush(false), FLUSH_MS);
  }
}

/** UTM-parameters uit de huidige URL. */
export function leesUtm(): ClientEvent["utm"] | undefined {
  const p = new URLSearchParams(location.search);
  const source = p.get("utm_source") ?? undefined;
  const medium = p.get("utm_medium") ?? undefined;
  const campaign = p.get("utm_campaign") ?? undefined;
  if (!source && !medium && !campaign) return undefined;
  return { source, medium, campaign };
}
