import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Icon } from "@/components/home/pictos";
import { Avatar } from "@/components/avatar";
import { publiekeUrl } from "@/lib/storage/url";
import { sectorMetaVan } from "@/lib/sector-meta";
import { formatEuro } from "@/lib/utils";
import { displayNaam, getPublicZzper } from "@/server/zzpers/directory";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AccountNodig } from "@/components/account-nodig";
import { neemContactOpAction } from "../actions";
import { MeldProfielForm } from "../meld-profiel-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // Zonder account tonen we geen profielgegevens, ook niet in de paginatitel.
  const user = await getCurrentUser();
  if (!user) return { title: "Profiel van een zzp'er", robots: { index: false } };
  const data = await getPublicZzper(id);
  if (!data) return { title: "Profiel niet gevonden" };
  const naam = displayNaam(data);
  return {
    title: `${naam} — zzp'er`,
    description: data.over?.slice(0, 155) ?? `Bekijk het profiel van ${naam} op ZZP Schakel.`,
    robots: { index: false },
  };
}

export default async function ZzperProfielPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gemeld?: string }>;
}) {
  const [{ id }, { gemeld }] = await Promise.all([params, searchParams]);
  const user = await getCurrentUser();

  // Profielen zijn alleen met een account zichtbaar. Na registreren of
  // inloggen komt de bezoeker op dit profiel terug.
  if (!user) {
    return (
      <Container className="max-w-4xl py-8 md:py-12">
        <Link href="/vind-zzper" className="text-foreground-muted hover:text-foreground text-sm">
          ← Terug naar zoeken
        </Link>
        <div className="mt-4">
          <AccountNodig
            next={`/vind-zzper/${id}`}
            titel="Om dit profiel te bekijken maak je een account aan als opdrachtgever."
          />
        </div>
      </Container>
    );
  }

  const data = await getPublicZzper(id);
  if (!data) notFound();

  const p = data;
  const naam = displayNaam(p);
  const geverifieerd = p.verificatieStatus === "GEVERIFIEERD";

  return (
    <Container className="max-w-4xl py-8 md:py-12">
      <Link href="/vind-zzper" className="text-foreground-muted hover:text-foreground text-sm">
        ← Terug naar alle zzp’ers
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Hoofdkolom */}
        <div>
          <div className="flex items-center gap-4">
            <Avatar fotoKey={p.fotoKey} naam={naam} size={72} className="ring-brand-50 ring-4" />
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{naam}</h1>
              <p className="text-foreground-muted mt-0.5 text-sm">
                {p.werkgebiedPlaats || "Heel Nederland"}
                {p.jarenErvaring ? ` · ${p.jarenErvaring} jaar ervaring` : ""}
              </p>
            </div>
          </div>

          {/* Vertrouwenslabels */}
          <div className="mt-4 flex flex-wrap gap-2">
            {geverifieerd ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Icon name="shield" className="h-3.5 w-3.5" /> Geverifieerd
              </span>
            ) : null}
            {p.eigenBus ? (
              <span className="border-border bg-surface rounded-full border px-3 py-1 text-xs font-medium">
                Eigen vervoer
              </span>
            ) : null}
            {p.vca ? (
              <span className="border-border bg-surface rounded-full border px-3 py-1 text-xs font-medium">
                VCA
              </span>
            ) : null}
          </div>

          {p.over ? (
            <Card className="mt-6">
              <CardTitle>Over</CardTitle>
              <p className="text-foreground-muted mt-2 text-sm whitespace-pre-line">
                {p.over}
              </p>
            </Card>
          ) : null}

          {/* Vakgebieden */}
          {p.skills.length > 0 || p.vakgebiedAnders ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">Vakgebieden</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.vakgebiedAnders ? (
                  <span className="bg-brand-50 text-brand-700 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold">
                    {p.vakgebiedAnders}
                  </span>
                ) : null}
                {p.skills.map((s) => {
                  const meta = sectorMetaVan(s.skill.slug);
                  return (
                    <span
                      key={s.skillId}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
                      style={{ backgroundColor: `${meta.kleur}1a`, color: meta.kleur }}
                    >
                      <Icon name={meta.icon} className="h-3.5 w-3.5" />
                      {s.skill.naam}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Werk / portfolio */}
          {p.portfolio.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">Werk van {naam}</h2>
              <ul className="mt-2 grid gap-3 sm:grid-cols-2">
                {p.portfolio.map((item) => (
                  <li key={item.id} className="border-border bg-surface overflow-hidden rounded-xl border">
                    {item.afbeeldingKey ? (
                      <Image
                        src={publiekeUrl(item.afbeeldingKey)}
                        alt={item.titel}
                        width={800}
                        height={600}
                        unoptimized
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : null}
                    <div className="p-3">
                      <p className="text-sm font-semibold">{item.titel}</p>
                      {item.omschrijving ? (
                        <p className="text-foreground-muted mt-0.5 text-xs">{item.omschrijving}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Certificaten */}
          {p.specialisatieAnders ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">Specialisatie</h2>
              <p className="text-foreground-muted mt-2 text-sm">{p.specialisatieAnders}</p>
            </div>
          ) : null}

          {p.certifications.length > 0 || p.certificatenAnders ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">Certificaten</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.certificatenAnders ? (
                  <span className="border-border bg-surface inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm">
                    <Icon name="shield" className="text-foreground-muted h-3.5 w-3.5" />
                    {p.certificatenAnders}
                  </span>
                ) : null}
                {p.certifications.map((c) => (
                  <span
                    key={c.id}
                    className="border-border bg-surface inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
                  >
                    <Icon name="shield" className="text-foreground-muted h-3.5 w-3.5" />
                    {c.certification.naam}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

        </div>

        {/* Contact-zijbalk */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <p className="text-sm font-semibold">
              {p.uurtariefCents ? `${formatEuro(p.uurtariefCents)} / uur` : "Tarief op aanvraag"}
            </p>
            <p className="text-foreground-muted mt-1 text-xs">
              Neem contact op — geen opdracht nodig, wel een account.
            </p>
            <form action={neemContactOpAction} className="mt-4">
              <input type="hidden" name="zzpProfileId" value={p.id} />
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-colors"
              >
                Neem contact op
              </button>
            </form>
            <p className="text-foreground-muted mt-3 text-center text-xs">
              Je stuurt een bericht via ZZP Schakel; de zzp’er antwoordt je
              rechtstreeks. Afspraken maken jullie samen.
            </p>
          </Card>
          <MeldProfielForm zzpProfileId={p.id} ingelogd={Boolean(user)} gemeld={gemeld} />
        </aside>
      </div>
    </Container>
  );
}
