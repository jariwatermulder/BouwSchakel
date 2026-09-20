import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { PWARegister } from "@/components/pwa-register";
import { AnalyticsTracker } from "@/components/analytics/tracker";
import { resolveAppUrl } from "@/lib/app-url";

const appUrl = resolveAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "ZZP Schakel — De directe schakel tussen zzp'ers en bedrijven.",
    template: "%s · ZZP Schakel",
  },
  description:
    "ZZP Schakel is de directe schakel tussen zzp'ers en bedrijven: vind een vakman in jouw regio of laat je als zzp'er vinden. Rechtstreeks contact, zonder tussenlaag.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "ZZP Schakel",
    url: appUrl,
    title: "ZZP Schakel — De directe schakel tussen zzp'ers en bedrijven.",
    description:
      "Vind een vakman in jouw regio of laat je als zzp'er vinden. Rechtstreeks contact, zonder tussenlaag.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ZZP Schakel — De directe schakel tussen zzp'ers en bedrijven.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZZP Schakel — De directe schakel tussen zzp'ers en bedrijven.",
    description:
      "Vind een vakman in jouw regio of laat je als zzp'er vinden. Rechtstreeks contact, zonder tussenlaag.",
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
    <html lang="nl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Inter is het merklettertype (brandguide). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <CookieConsent />
        <PWARegister />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
