import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  getOrCreateProfile,
  getProfileWithRelations,
  type ProfileWithRelations,
} from "@/server/zzp/profile";
import {
  listCertifications,
  listSkills,
  listSpecializations,
} from "@/server/catalog";
import { REGISTRATIE_STAPPEN, isStapSlug, type StapSlug } from "./steps";
import { StepFields } from "./step-fields";
import { saveStap } from "./actions";

export const metadata: Metadata = {
  title: "Profiel aanmaken",
  robots: { index: false },
};

function stapDone(slug: StapSlug, p: ProfileWithRelations | null): boolean {
  if (!p) return false;
  switch (slug) {
    case "persoonlijk":
      return !!p.voornaam && !!p.achternaam;
    case "vakgebied":
      return p.skills.length > 0;
    case "ervaring":
      return p.jarenErvaring != null;
    case "tarief":
      return (p.uurtariefCents ?? 0) > 0;
    case "werkgebied":
      return !!p.werkgebiedPlaats && (p.maxReisafstandKm ?? 0) > 0;
    case "beschikbaarheid":
      return p.availability.length > 0 || p.startdatum != null;
    default:
      return true; // optionele stappen blokkeren de voortgang niet
  }
}

export default async function RegistrerenPage({
  searchParams,
}: {
  searchParams: Promise<{ stap?: string; fout?: string }>;
}) {
  const user = await requireCurrentUser();
  await getOrCreateProfile(user.id);
  const profile = await getProfileWithRelations(user.id);

  const { stap: stapParam, fout } = await searchParams;
  const eersteOnvoltooid =
    REGISTRATIE_STAPPEN.find((s) => !stapDone(s.slug, profile))?.slug ??
    "persoonlijk";
  const activeSlug: StapSlug = isStapSlug(stapParam)
    ? stapParam
    : eersteOnvoltooid;

  const activeIndex = REGISTRATIE_STAPPEN.findIndex(
    (s) => s.slug === activeSlug,
  );
  const activeStap = REGISTRATIE_STAPPEN[activeIndex];
  const vorige = REGISTRATIE_STAPPEN[activeIndex - 1];
  const isLaatste = activeIndex === REGISTRATIE_STAPPEN.length - 1;

  const selectedSkillIds = profile?.skills.map((s) => s.skillId) ?? [];
  const [skills, specializations, certifications] = await Promise.all([
    listSkills(),
    activeSlug === "specialisatie"
      ? listSpecializations(selectedSkillIds)
      : Promise.resolve([]),
    activeSlug === "certificaten" ? listCertifications() : Promise.resolve([]),
  ]);

  const pct = profile?.profielCompleetheidPct ?? 0;

  return (
    <Container className="grid gap-8 py-8 md:grid-cols-[240px_1fr] md:py-12">
      {/* Stappen-navigatie */}
      <aside>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Profiel compleet</span>
            <span className="text-navy-700 font-semibold">{pct}%</span>
          </div>
          <div className="bg-border mt-1 h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-accent-500 h-full rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <ol className="space-y-1">
          {REGISTRATIE_STAPPEN.map((s, i) => {
            const done = stapDone(s.slug, profile);
            const active = s.slug === activeSlug;
            return (
              <li key={s.slug}>
                <Link
                  href={`/zzpers/registreren?stap=${s.slug}`}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                    active
                      ? "bg-navy-50 text-navy-900 font-semibold"
                      : "text-foreground-muted hover:bg-surface-muted"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      done
                        ? "bg-emerald-500 text-white"
                        : "bg-border text-foreground-muted"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Actieve stap */}
      <div>
        <h1 className="text-2xl font-bold">{activeStap?.label}</h1>
        <p className="text-foreground-muted mt-1 text-sm">
          Stap {activeIndex + 1} van {REGISTRATIE_STAPPEN.length}. Je voortgang
          wordt automatisch opgeslagen — je kunt later verdergaan.
        </p>

        {fout ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
          >
            Controleer de ingevulde velden en probeer het opnieuw.
          </p>
        ) : null}

        <Card className="mt-6">
          <form action={saveStap} className="space-y-6">
            <input type="hidden" name="stap" value={activeSlug} />
            <StepFields
              slug={activeSlug}
              profile={profile}
              skills={skills}
              specializations={specializations}
              certifications={certifications}
            />
            <div className="flex items-center justify-between gap-3 pt-2">
              {vorige ? (
                <ButtonLink
                  href={`/zzpers/registreren?stap=${vorige.slug}`}
                  variant="ghost"
                >
                  Vorige
                </ButtonLink>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3">
                <ButtonLink href="/zzpers/dashboard" variant="ghost">
                  Later verder
                </ButtonLink>
                <Button type="submit" variant="accent">
                  {isLaatste ? "Afronden" : "Opslaan en verder"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}
