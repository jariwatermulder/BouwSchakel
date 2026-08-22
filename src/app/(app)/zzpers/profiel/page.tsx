import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProfileWithRelations } from "@/server/zzp/profile";
import { formatEuro } from "@/lib/utils";
import { verwijderPortfolioItem } from "./actions";

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

export default async function ProfielPage() {
  const user = await requireCurrentUser();
  const p = await getProfileWithRelations(user.id);

  const naam =
    p?.voornaam || p?.achternaam
      ? `${p?.voornaam ?? ""} ${p?.achternaam ?? ""}`.trim()
      : "Naam nog niet ingevuld";

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{naam}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {p?.skills.map((s) => (
              <Badge key={s.skillId} variant="accent">
                {s.skill.naam}
              </Badge>
            ))}
            {p?.verificatieStatus === "GEVERIFIEERD" ? (
              <Badge variant="verified">Geverifieerd</Badge>
            ) : (
              <Badge variant="neutral">Niet geverifieerd</Badge>
            )}
          </div>
        </div>
        <ButtonLink href="/zzpers/registreren" variant="outline">
          Profiel bewerken
        </ButtonLink>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
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

        <Card>
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
            {p?.certifications.map((c) => (
              <Badge key={c.certificationId} variant="neutral">
                {c.certification.naam}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {p?.over ? (
        <Card className="mt-6">
          <CardTitle>Over mij</CardTitle>
          <p className="text-foreground-muted mt-2 text-sm whitespace-pre-line">
            {p.over}
          </p>
        </Card>
      ) : null}

      <Card className="mt-6">
        <CardTitle>Portfolio</CardTitle>
        {p && p.portfolio.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {p.portfolio.map((item) => (
              <li
                key={item.id}
                className="border-border flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{item.titel}</p>
                  {item.omschrijving ? (
                    <p className="text-foreground-muted text-sm">
                      {item.omschrijving}
                    </p>
                  ) : null}
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
            Nog geen portfolio-items. Voeg ze toe via profiel bewerken.
          </p>
        )}
      </Card>
    </Container>
  );
}
