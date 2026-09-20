import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/home/pictos";
import { StatKaart } from "@/components/stat-kaart";
import { VoortgangKaart } from "@/components/voortgang-kaart";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getCompanyForUser } from "@/server/company/service";
import { berekenBedrijfVoortgang } from "@/server/company/voortgang";
import {
  listConversationsForUser,
  unreadMessagesCount,
} from "@/server/messaging/service";
import { unreadCount } from "@/server/notifications/service";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

function groet(): string {
  const uur = new Date().getHours();
  if (uur < 12) return "Goedemorgen";
  if (uur < 18) return "Goedemiddag";
  return "Goedenavond";
}

const tips = [
  {
    icon: "search",
    titel: "Zoek op vak en regio",
    tekst:
      "Kies een vakgebied en je plaats. Je ziet direct welke vakmensen in jouw buurt werken.",
  },
  {
    icon: "person",
    titel: "Bekijk profielen",
    tekst:
      "Vergelijk vakgebied, werkgebied, ervaring en tarief voordat je iemand benadert.",
  },
  {
    icon: "chat",
    titel: "Neem rechtstreeks contact op",
    tekst:
      "Stuur een bericht en maak zelf afspraken over de klus, de planning en het tarief.",
  },
];

export default async function BedrijfDashboardPage() {
  const user = await requireCurrentUser();
  const [company, ongelezenBerichten, ongelezenMeldingen, gesprekken] =
    await Promise.all([
      getCompanyForUser(user.id),
      unreadMessagesCount(user.id),
      unreadCount(user.id),
      listConversationsForUser(user.id),
    ]);
  const voortgang = berekenBedrijfVoortgang(company);

  const bedrijfsnaam = company?.naam.trim() || "";
  const aanhef = company?.contactpersoon?.trim() || bedrijfsnaam || user.email.split("@")[0] || "";
  const geverifieerd = company?.verificatieStatus === "GEVERIFIEERD";
  const profielCompleet = voortgang.ontbrekend.length === 0;

  return (
    <Container className="py-8 md:py-12">
      {/* Kop: begroeting, status en snelle acties */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            fotoKey={null}
            naam={bedrijfsnaam || aanhef}
            size={64}
            className="ring-brand-50 ring-4"
          />
          <div>
            <h1 className="bs-load text-2xl font-bold md:text-3xl">
              {groet()}, {aanhef}
            </h1>
            <div className="bs-load mt-2 flex flex-wrap gap-2" style={{ animationDelay: "80ms" }}>
              {bedrijfsnaam && company?.contactpersoon ? (
                <Badge variant="accent">{bedrijfsnaam}</Badge>
              ) : null}
              {profielCompleet ? (
                <Badge variant="verified">
                  <Icon name="check" className="h-3 w-3" /> Bedrijfsprofiel compleet
                </Badge>
              ) : (
                <Badge variant="pending">Bedrijfsprofiel {voortgang.pct}%</Badge>
              )}
              {geverifieerd ? (
                <Badge variant="verified">
                  <Icon name="shield" className="h-3 w-3" /> Geverifieerd
                </Badge>
              ) : (
                <Badge variant="neutral">Niet geverifieerd</Badge>
              )}
            </div>
          </div>
        </div>
        <div
          className="bs-load flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "120ms" }}
        >
          <ButtonLink href="/vind-zzper" variant="brand" className="justify-center rounded-xl">
            <Icon name="search" className="h-4 w-4" />
            Vind een zzp’er
          </ButtonLink>
          <ButtonLink
            href="/bedrijven/berichten"
            variant="outline"
            className="justify-center rounded-xl"
          >
            Berichten
            {ongelezenBerichten > 0 ? (
              <span className="bg-brand-500 ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white">
                {ongelezenBerichten > 9 ? "9+" : ongelezenBerichten}
              </span>
            ) : null}
          </ButtonLink>
        </div>
      </div>

      {/* Voortgang links, cijfers rechts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="bs-load" style={{ animationDelay: "160ms" }}>
          <VoortgangKaart voortgang={voortgang} />
        </div>

        <div className="grid content-start gap-4">
          <StatKaart
            href="/bedrijven/berichten"
            icon="chat"
            waarde={ongelezenBerichten}
            label={ongelezenBerichten === 1 ? "ongelezen bericht" : "ongelezen berichten"}
            accent={ongelezenBerichten > 0}
            delay={200}
          />
          <StatKaart
            href="/bedrijven/berichten"
            icon="users"
            waarde={gesprekken.length}
            label={gesprekken.length === 1 ? "gesprek met een zzp’er" : "gesprekken met zzp’ers"}
            delay={260}
          />
          <StatKaart
            href="/bedrijven/meldingen"
            icon="bolt"
            waarde={ongelezenMeldingen}
            label={ongelezenMeldingen === 1 ? "nieuwe melding" : "nieuwe meldingen"}
            delay={320}
          />
          <StatKaart
            href="/vind-zzper"
            icon="search"
            waarde="Zoek"
            label="vakmensen op vak en regio"
            delay={380}
          />
        </div>
      </div>

      {/* Zo vind je de juiste vakman */}
      <section className="mt-10" aria-labelledby="vinden-titel">
        <h2 id="vinden-titel" className="text-lg font-semibold">
          Zo vind je de juiste vakman
        </h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {tips.map((t, i) => (
            <li
              key={t.titel}
              className="border-border bg-surface-muted flex gap-4 rounded-[var(--radius-card)] border p-5"
            >
              <span className="bg-surface text-brand-600 border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                <Icon name={t.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">
                  <span className="text-brand-600 mr-1.5 tabular-nums">{i + 1}.</span>
                  {t.titel}
                </p>
                <p className="text-foreground-muted mt-1 text-sm leading-relaxed">{t.tekst}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Container>
  );
}
