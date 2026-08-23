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
    default: "BouwSchakel — De juiste vakman. Op het juiste moment.",
    template: "%s · BouwSchakel",
  },
  description:
    "BouwSchakel verbindt bouwbedrijven met geverifieerde zelfstandige vakmensen. Plaats snel een opdracht of vind jouw volgende klus.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "BouwSchakel",
    url: appUrl,
  },
  manifest: "/manifest.webmanifest",
  applicationName: "BouwSchakel",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BouwSchakel",
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
      <body className="flex min-h-full flex-col">
        {children}
        <CookieConsent />
        <PWARegister />
      </body>
    </html>
  );
}
