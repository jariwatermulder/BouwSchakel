import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { ProfielVoortgangKaart } from "@/components/zzp/profiel-voortgang";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProfileWithRelations, MAX_PORTFOLIO_ITEMS } from "@/server/zzp/profile";
import { berekenVoortgang } from "@/server/zzp/voortgang";
import { formatEuro } from "@/lib/utils";
import { publiekeUrl } from "@/lib/storage/url";
import {
  uploadProfielFoto,
  verwijderPortfolioItem,
  verwijderProfielFoto,
} from "./actions";

const FOTO_MELDING: Record<string, { tekst: string; fout: boolean }> = {
  ok: { tekst: "Je profielfoto is bijgewerkt.", fout: false },
  leeg: { tekst: "Kies eerst een foto.", fout: true },
  fout: { tekst: "Kies een JPG-, PNG- of WebP-afbeelding van maximaal 8 MB.", fout: true },
  limiet: { tekst: "Je hebt veel foto's geüpload. Probeer het later opnieuw.", fout: true },
};

export const metadata: Metadata = {
  title: "Mijn profiel",
  robots: { index: false },
};

function Rij({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex justify-between gap-4 border-b py-2 text-sm last:border-0">
      <span className="text-foreground-muted">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  );
}

export default async function ProfielPage({
  searchParams,
}: {
  searchParams: Promise<{ foto?: string }>;
}) {
  const user = await requireCurrentUser();
  const [p, { foto }] = await Promise.all([getProfileWithRelations(user.id), searchParams]);
  const fotoMelding = foto ? FOTO_MELDING[foto] : undefined;

  const naam =
    p?.voornaam || p?.achternaam
      ? `${p?.voornaam ?? ""} ${p?.achternaam ?? ""}`.trim()
      : "Naam nog niet ingevuld";
  const voortgang = berekenVoortgang(p);

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar fotoKey={p?.fotoKey} naam={naam} size={72} className="ring-brand-50 ring-4" />
          <div>
          <h1 className="text-2xl font-bold md:text-3xl">{naam}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {p?.skills.map((s) => (
              <Badge key={s.skillId} variant="accent">
                {s.skill.naam}
              </Badge>
            ))}
            {p?.vakgebiedAnders ? (
              <Badge variant="accent">{p.vakgebiedAnders}</Badge>
            ) : null}
            {p?.verificatieStatus === "GEVERIFIEERD" ? (
              <Badge variant="verified">Geverifieerd</Badge>
            ) : (
              <Badge variant="neutral">Niet geverifieerd</Badge>
            )}
          </div>
          </div>
        </div>
        <ButtonLink href="/zzpers/registreren" variant="outline">
          Profiel bewerken
        </ButtonLink>
      </div>

      {fotoMelding ? (
        <p
          role={fotoMelding.fout ? "alert" : "status"}
          className={`mt-4 rounded-lg border p-3 text-sm ${
            fotoMelding.fout
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-emerald-300 bg-emerald-50 text-emerald-800"
          }`}
        >
          {fotoMelding.tekst}
        </p>
      ) : null}

      <div className="bs-load mt-6">
        <ProfielVoortgangKaart voortgang={voortgang} compact />
      </div>

      <Card id="profielfoto" className="bs-load mt-6 scroll-mt-24">
        <CardTitle>Profielfoto</CardTitle>
        <CardDescription className="mt-1">
          Een duidelijke foto van jezelf zorgt dat opdrachtgevers je sneller
          vertrouwen en benaderen. JPG, PNG of WebP, max. 8 MB; we maken er een
          vierkante foto van en verwijderen locatiegegevens.
        </CardDescription>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <form action={uploadProfielFoto} className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="foto" className="text-foreground mb-1 block text-sm font-medium">
                Nieuwe foto
              </label>
              <input
                id="foto"
                name="foto"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp"
                className="border-border bg-surface file:bg-brand-50 file:text-brand-700 block h-11 rounded-lg border p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1 file:font-medium"
              />
            </div>
            <Button type="submit" variant="brand">
              Foto uploaden
            </Button>
          </form>
          {p?.fotoKey ? (
            <form action={verwijderProfielFoto}>
              <Button type="submit" variant="ghost" className="text-red-600">
                Foto verwijderen
              </Button>
            </form>
          ) : null}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="bs-load">
          <CardTitle>Gegevens</CardTitle>
          <div className="mt-3">
            {p?.telefoon ? <Rij label="Telefoon" value={p.telefoon} /> : null}
            {p?.bedrijfsnaam ? (
              <Rij label="Bedrijf" value={p.bedrijfsnaam} />
            ) : null}
            {p?.kvkNummer ? <Rij label="KvK" value={p.kvkNummer} /> : null}
            {p?.jarenErvaring != null ? (
              <Rij label="Ervaring" value={`${p.jarenErvaring} jaar`} />
            ) : null}
            {p?.uurtariefCents ? (
              <Rij
                label="Uurtarief"
                value={`${formatEuro(p.uurtariefCents)} p/u`}
              />
            ) : null}
            {p?.werkgebiedPlaats ? (
              <Rij
                label="Werkgebied"
                value={`${p.werkgebiedPlaats} (${p.maxReisafstandKm ?? "?"} km)`}
              />
            ) : null}
          </div>
        </Card>

        <Card className="bs-load" style={{ animationDelay: "90ms" }}>
          <CardTitle>Materieel & specialisaties</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {p?.eigenBus ? <Badge>Eigen bus</Badge> : null}
            {p?.eigenGereedschap ? <Badge>Eigen gereedschap</Badge> : null}
            {p?.vca ? <Badge variant="verified">VCA</Badge> : null}
            {p?.specializations.map((s) => (
              <Badge key={s.specializationId} variant="neutral">
                {s.specialization.naam}
              </Badge>
            ))}
            {p?.specialisatieAnders ? (
              <Badge variant="neutral">{p.specialisatieAnders}</Badge>
            ) : null}
            {p?.certifications.map((c) => (
              <Badge key={c.certificationId} variant="neutral">
                {c.certification.naam}
              </Badge>
            ))}
            {p?.certificatenAnders ? (
              <Badge variant="neutral">{p.certificatenAnders}</Badge>
            ) : null}
          </div>
        </Card>
      </div>

      {p?.over ? (
        <Card className="bs-load mt-6">
          <CardTitle>Over mij</CardTitle>
          <p className="text-foreground-muted mt-2 text-sm whitespace-pre-line">
            {p.over}
          </p>
        </Card>
      ) : null}

      <Card className="bs-load mt-6">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Portfolio</CardTitle>
          {p && p.portfolio.length < MAX_PORTFOLIO_ITEMS ? (
            <ButtonLink href="/zzpers/registreren?stap=portfolio" variant="outline" size="sm">
              Werk toevoegen
            </ButtonLink>
          ) : null}
        </div>
        {p && p.portfolio.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {p.portfolio.map((item) => (
              <li
                key={item.id}
                className="border-border flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {item.afbeeldingKey ? (
                    <Image
                      src={publiekeUrl(item.afbeeldingKey)}
                      alt={item.titel}
                      width={96}
                      height={72}
                      unoptimized
                      className="h-[72px] w-24 shrink-0 rounded-lg object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                  <p className="font-medium">{item.titel}</p>
                  {item.omschrijving ? (
                    <p className="text-foreground-muted text-sm">
                      {item.omschrijving}
                    </p>
                  ) : null}
                  </div>
                </div>
                <form action={verwijderPortfolioItem}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:underline"
                  >
                    Verwijderen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-foreground-muted mt-2 text-sm">
            Nog geen werk toegevoegd. Laat met een paar foto&apos;s zien wat je
            maakt — dat overtuigt opdrachtgevers.
          </p>
        )}
      </Card>

    </Container>
  );
}
