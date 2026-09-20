import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/home/pictos";
import { ProfielVoortgangKaart } from "@/components/zzp/profiel-voortgang";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProfileWithRelations } from "@/server/zzp/profile";
import { berekenVoortgang } from "@/server/zzp/voortgang";
import { unreadMessagesCount } from "@/server/messaging/service";
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

function formatDatum(d: Date): string {
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

/** Klikbare statistiekkaart: één cijfer, één label, één bestemming. */
function StatKaart({
  href,
  icon,
  waarde,
  label,
  sub,
  delay,
  accent = false,
}: {
  href: string;
  icon: string;
  waarde: string | number;
  label: string;
  sub?: string;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bs-load border-border bg-surface shadow-soft hover:border-brand-500 group flex items-center gap-4 rounded-[var(--radius-card)] border p-5 transition-colors"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          accent ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600"
        }`}
      >
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-bold tabular-nums leading-tight">{waarde}</span>
        <span className="text-foreground-muted block text-sm">
          {label}
          {sub ? <span className="text-foreground-muted/80"> · {sub}</span> : null}
        </span>
      </span>
      <span
        aria-hidden
        className="text-foreground-muted group-hover:text-brand-600 transition-colors"
      >
        →
      </span>
    </Link>
  );
}

const tips = [
  {
    icon: "search",
    titel: "Vakgebied en regio",
    tekst:
      "Opdrachtgevers zoeken op vakgebied en plaats. Kies je vak precies en stel je werkgebied ruim genoeg in.",
  },
  {
    icon: "hammer",
    titel: "Laat zien wat je doet",
    tekst:
      "Een korte introductie, je ervaring en een paar afgeronde klussen maken het verschil.",
  },
  {
    icon: "chat",
    titel: "Reageer snel",
    tekst:
      "Nieuwe berichten van opdrachtgevers vind je onder Berichten. Je krijgt er ook een e-mail van.",
  },
];

export default async function ZzpDashboardPage() {
  const user = await requireCurrentUser();
  const [profile, ongelezenBerichten, ongelezenMeldingen] = await Promise.all([
    getProfileWithRelations(user.id),
    unreadMessagesCount(user.id),
    unreadCount(user.id),
  ]);
  const voortgang = berekenVoortgang(profile);

  const voornaam = profile?.voornaam ?? user.email.split("@")[0] ?? "";
  const volledigeNaam =
    profile?.voornaam || profile?.achternaam
      ? `${profile?.voornaam ?? ""} ${profile?.achternaam ?? ""}`.trim()
      : voornaam;
  const geverifieerd = profile?.verificatieStatus === "GEVERIFIEERD";

  const periodes = profile?.availability.length ?? 0;
  const startdatum = profile?.startdatum ? formatDatum(profile.startdatum) : null;

  return (
    <Container className="py-8 md:py-12">
      {/* Kop: begroeting, status en snelle acties */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            fotoKey={profile?.fotoKey}
            naam={volledigeNaam}
            size={64}
            className="ring-brand-50 ring-4"
          />
          <div>
            <h1 className="bs-load text-2xl font-bold md:text-3xl">
              {groet()}, {voornaam}
            </h1>
            <div className="bs-load mt-2 flex flex-wrap gap-2" style={{ animationDelay: "80ms" }}>
              {voortgang.zichtbaar ? (
                <Badge variant="verified">
                  <Icon name="check" className="h-3 w-3" /> Zichtbaar voor opdrachtgevers
                </Badge>
              ) : (
                <Badge variant="pending">Nog niet zichtbaar</Badge>
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
          <ButtonLink href="/zzpers/profiel" variant="brand" className="justify-center rounded-xl">
            Bekijk mijn profiel
          </ButtonLink>
          <ButtonLink href="/zzpers/berichten" variant="outline" className="justify-center rounded-xl">
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
          <ProfielVoortgangKaart voortgang={voortgang} />
        </div>

        <div className="grid content-start gap-4">
          <StatKaart
            href="/zzpers/berichten"
            icon="chat"
            waarde={ongelezenBerichten}
            label={ongelezenBerichten === 1 ? "ongelezen bericht" : "ongelezen berichten"}
            accent={ongelezenBerichten > 0}
            delay={200}
          />
          <StatKaart
            href="/zzpers/meldingen"
            icon="bolt"
            waarde={ongelezenMeldingen}
            label={ongelezenMeldingen === 1 ? "nieuwe melding" : "nieuwe meldingen"}
            delay={260}
          />
          <StatKaart
            href="/zzpers/beschikbaarheid"
            icon="calendar"
            waarde={periodes}
            label={periodes === 1 ? "beschikbare periode" : "beschikbare periodes"}
            sub={startdatum ? `vanaf ${startdatum}` : undefined}
            delay={320}
          />
          <StatKaart
            href="/zzpers/documenten"
            icon="doc"
            waarde={
              (profile?.certifications.length ?? 0) + (profile?.certificatenAnders ? 1 : 0)
            }
            label="certificaten op je profiel"
            delay={380}
          />
        </div>
      </div>

      {/* Zo word je gevonden */}
      <section className="mt-10" aria-labelledby="gevonden-titel">
        <h2 id="gevonden-titel" className="text-lg font-semibold">
          Zo word je gevonden
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
