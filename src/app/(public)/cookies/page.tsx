import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";

export const metadata: Metadata = {
  title: "Cookies",
  robots: { index: false },
};

export default function CookiesPage() {
  return (
    <>
      <PageIntro title="Cookiebeleid" />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm">
          <p>
            ZZP Connect gebruikt functionele cookies die nodig zijn om het
            platform te laten werken, waaronder een beveiligde sessiecookie na
            inloggen. Voor eventuele analytische cookies wordt
            privacyvriendelijke meting nagestreefd en, waar vereist, toestemming
            gevraagd.
          </p>
          <p>Een volledig overzicht van gebruikte cookies volgt.</p>
        </div>
      </Container>
    </>
  );
}
