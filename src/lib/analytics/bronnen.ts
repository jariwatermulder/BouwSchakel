/**
 * Herkomst van bezoekers: vertaalt referrer-host en UTM-bron naar een
 * leesbare bron (Google, Instagram, …). Puur, zodat het testbaar is en zowel
 * in queries als in de UI gebruikt kan worden.
 */
const BEKENDE_BRONNEN: { naam: string; patroon: RegExp }[] = [
  { naam: "Google", patroon: /(^|\.)google\./i },
  { naam: "Bing", patroon: /(^|\.)bing\.com$/i },
  { naam: "DuckDuckGo", patroon: /duckduckgo\.com$/i },
  { naam: "Instagram", patroon: /instagram\.com$|(^|\.)l\.instagram\.com$/i },
  { naam: "Facebook", patroon: /facebook\.com$|(^|\.)fb\.com$|(^|\.)lm\.facebook\.com$/i },
  { naam: "TikTok", patroon: /tiktok\.com$/i },
  { naam: "LinkedIn", patroon: /linkedin\.com$|(^|\.)lnkd\.in$/i },
  { naam: "Marktplaats", patroon: /marktplaats\.nl$/i },
  { naam: "YouTube", patroon: /youtube\.com$|youtu\.be$/i },
  { naam: "X (Twitter)", patroon: /(^|\.)twitter\.com$|(^|\.)x\.com$|(^|\.)t\.co$/i },
  { naam: "WhatsApp", patroon: /whatsapp\.com$/i },
  { naam: "Werkspot", patroon: /werkspot\.nl$/i },
];

const UTM_BRONNEN: Record<string, string> = {
  google: "Google",
  instagram: "Instagram",
  ig: "Instagram",
  facebook: "Facebook",
  fb: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  marktplaats: "Marktplaats",
  youtube: "YouTube",
  twitter: "X (Twitter)",
  x: "X (Twitter)",
  whatsapp: "WhatsApp",
  nieuwsbrief: "Nieuwsbrief",
  newsletter: "Nieuwsbrief",
  email: "E-mail",
  mail: "E-mail",
};

/** Alleen de hostnaam van een referrer-URL, zonder "www." (nooit het pad: privacy). */
export function referrerHost(referrer: string | null | undefined, eigenHost?: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    if (!host) return null;
    if (eigenHost && host === eigenHost.toLowerCase().replace(/^www\./, "")) return null;
    return host;
  } catch {
    return null;
  }
}

export function bronNaam(referrerHost: string | null, utmSource: string | null): string {
  if (utmSource) {
    const key = utmSource.trim().toLowerCase();
    return UTM_BRONNEN[key] ?? `Campagne: ${utmSource.trim()}`;
  }
  if (!referrerHost) return "Direct";
  const bekend = BEKENDE_BRONNEN.find((b) => b.patroon.test(referrerHost));
  return bekend ? bekend.naam : `Overige websites (${referrerHost})`;
}
