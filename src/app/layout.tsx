import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Inter (merklettertype) zelf gehost: geen externe verbinding, geen
// blokkerend stylesheet en geen verspringende tekst. Variabel font, één
// bestand per tekenset (latin + latin-ext dekt Nederlands volledig).
const inter = localFont({
  src: [
    { path: "../fonts/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/inter-latin-ext-wght-normal.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});
import { CookieConsent } from "@/components/layout/cookie-consent";
import { PWARegister } from "@/components/pwa-register";
import { AnalyticsTracker } from "@/components/analytics/tracker";
import { resolveAppUrl } from "@/lib/app-url";
import { StructuredData } from "@/components/structured-data";

const appUrl = resolveAppUrl();

export const metadata: Metadata = {
  // Absolute basis voor canonicals, deelafbeeldingen en sitemap (zie src/lib/app-url.ts).
  metadataBase: new URL(appUrl),
  title: {
    default: "ZZP Schakel: vind vakmensen in jouw regio",
    template: "%s · ZZP Schakel",
  },
  description:
    "Zoek op vakgebied en regio. Maak gratis een account om het aanbod te bekijken en rechtstreeks contact te leggen met zelfstandige vakmensen.",
  // Geen vaste og:title/og:description/og:url: die volgen per pagina uit
  // title, description en canonical, zodat deelvoorbeelden de pagina beschrijven.
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "ZZP Schakel",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ZZP Schakel: vind vakmensen in jouw regio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
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
    <html lang="nl" className={`h-full ${inter.variable}`}>
      <body className="flex min-h-full flex-col">
        <StructuredData />
        {children}
        <CookieConsent />
        <PWARegister />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
