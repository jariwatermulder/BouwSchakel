import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { PWARegister } from "@/components/pwa-register";

// Bepaal een geldige basis-URL, ook als APP_URL ontbreekt, leeg is of het
// schema mist (bijv. "bouwschakel.vercel.app"). Zo kan een verkeerd ingevulde
// omgevingsvariabele de build nooit laten crashen.
function resolveAppUrl(): string {
  const fallback = "http://localhost:3000";
  const raw = process.env.APP_URL?.trim();
  if (!raw) return fallback;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return fallback;
  }
}

const appUrl = resolveAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "ZZP Schakel — De directe schakel tussen zzp'ers en bedrijven.",
    template: "%s · ZZP Schakel",
  },
  description:
    "ZZP Schakel is de directe schakel tussen zzp'ers en bedrijven: vind een vakman in jouw regio of laat je als zzp'er vinden. Rechtstreeks contact, zonder tussenlaag.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "ZZP Schakel",
    url: appUrl,
  },
  manifest: "/manifest.webmanifest",
  applicationName: "ZZP Schakel",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ZZP Schakel",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Inter is het merklettertype (brandguide). Caveat = handgeschreven accent. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <CookieConsent />
        <PWARegister />
      </body>
    </html>
  );
}
