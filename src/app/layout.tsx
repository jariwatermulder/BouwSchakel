import type { Metadata } from "next";
import "./globals.css";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
