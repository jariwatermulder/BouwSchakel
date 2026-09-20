/**
 * Centrale registry van analytics-events. Client en server delen dit bestand.
 *
 * Nieuw event toevoegen = één regel in EVENTS (+ eventueel CLIENT_EVENTS als
 * de browser het mag versturen). Er is geen schemawijziging nodig: extra
 * gegevens gaan in `metadata`.
 *
 * Niet in deze registry: matches, opdrachten en sollicitaties. ZZP Schakel
 * is een communicatieplatform zonder matching of opdrachten; die events
 * bestaan hier dus bewust niet.
 */
export const EVENTS = {
  // Bezoek (browser)
  page_view: "Pagina bekeken",
  session_start: "Sessie gestart",
  session_end: "Sessie beëindigd",
  cta_clicked: "CTA aangeklikt",
  button_clicked: "Knop aangeklikt",
  search_result_clicked: "Zoekresultaat aangeklikt",
  // Account (server)
  user_registered: "Account aangemaakt",
  zzper_registered: "Nieuwe zzp'er geregistreerd",
  company_registered: "Nieuw bedrijf geregistreerd",
  email_verified: "E-mailadres bevestigd",
  login: "Ingelogd",
  logout: "Uitgelogd",
  account_deleted: "Account verwijderd",
  // Profiel (server)
  profile_created: "Zzp'er heeft profiel aangemaakt",
  profile_completed: "Zzp-profiel 100% compleet",
  profile_visible: "Zzp-profiel zichtbaar geworden",
  company_profile_completed: "Bedrijfsprofiel afgerond",
  profile_photo_uploaded: "Profielfoto geüpload",
  // Zoeken en contact (server)
  search_performed: "Zoekopdracht uitgevoerd",
  profile_viewed: "Profiel bekeken",
  contact_request_sent: "Nieuwe contactaanvraag",
  message_sent: "Bericht verstuurd",
  profile_reported: "Profiel gemeld",
  contact_form_sent: "Contactformulier verstuurd",
} as const;

export type EventName = keyof typeof EVENTS;

export const EVENT_NAMES = Object.keys(EVENTS) as EventName[];

export function isEventName(value: unknown): value is EventName {
  return typeof value === "string" && Object.hasOwn(EVENTS, value);
}

/** Events die de browser via /api/analytics mag insturen. Alle andere komen alleen server-side. */
export const CLIENT_EVENTS: readonly EventName[] = [
  "page_view",
  "session_start",
  "session_end",
  "cta_clicked",
  "button_clicked",
  "search_result_clicked",
];

/** Cookies waarmee server-side events aan dezelfde bezoeker/sessie worden gekoppeld. */
export const ANONYMOUS_ID_COOKIE = "zs_aid";
export const SESSION_ID_COOKIE = "zs_sid";

/** Sessie verloopt na 30 minuten zonder activiteit. */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/** Vrije metadata per event; klein houden (max. ~2 KB). */
export type EventMetadata = Record<string, string | number | boolean | null>;
