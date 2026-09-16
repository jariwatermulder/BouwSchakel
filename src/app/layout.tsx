import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { PWARegister } from "@/components/pwa-register";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

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
    default: "ZZP Connect — De juiste zzp'er. Op het juiste moment.",
    template: "%s · ZZP Connect",
  },
  description:
    "ZZP Connect verbindt opdrachtgevers met geverifieerde zelfstandige professionals (zzp'ers). Plaats snel een opdracht of vind jouw volgende klus.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "ZZP Connect",
    url: appUrl,
  },
  manifest: "/manifest.webmanifest",
  applicationName: "ZZP Connect",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ZZP Connect",
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
  themeColor: "#0F2540",
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
        {/* Fonts in de root layout gelden voor de hele app (geen single-page issue). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <CookieConsent />
        <PWAInstallPrompt />
        <PWARegister />
      </body>
    </html>
  );
}
