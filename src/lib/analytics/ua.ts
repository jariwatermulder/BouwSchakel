/**
 * Minimale user-agent-classificatie. We slaan de ruwe user-agent nooit op;
 * alleen deze grove categorieën (privacyvriendelijk, geen fingerprinting).
 */
export interface UaInfo {
  deviceType: "desktop" | "mobile" | "tablet" | "onbekend";
  browser: string;
  os: string;
}

export function parseUserAgent(ua: string | null | undefined): UaInfo {
  const s = ua ?? "";
  if (!s) return { deviceType: "onbekend", browser: "Onbekend", os: "Onbekend" };

  const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(s) || (/Android/i.test(s) && !/Mobile/i.test(s));
  const isMobile = !isTablet && /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(s);
  const deviceType: UaInfo["deviceType"] = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  let os = "Overig";
  if (/Windows/i.test(s)) os = "Windows";
  else if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Mac OS X|Macintosh/i.test(s)) os = "macOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/CrOS/i.test(s)) os = "ChromeOS";
  else if (/Linux/i.test(s)) os = "Linux";

  let browser = "Overig";
  if (/Edg\//i.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(s)) browser = "Opera";
  else if (/SamsungBrowser/i.test(s)) browser = "Samsung Internet";
  else if (/Firefox\//i.test(s)) browser = "Firefox";
  else if (/Chrome\/|CriOS/i.test(s)) browser = "Chrome";
  else if (/Safari\//i.test(s) && !/Chrome/i.test(s)) browser = "Safari";

  return { deviceType, browser, os };
}
