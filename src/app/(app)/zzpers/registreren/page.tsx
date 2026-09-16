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
import {
  KERN_STAPPEN,
  OPTIONELE_STAPPEN,
  isStapSlug,
  isKernStap,
  type StapSlug,
} from "./steps";
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
    KERN_STAPPEN.find((s) => !stapDone(s.slug, profile))?.slug ?? "persoonlijk";
  const activeSlug: StapSlug = isStapSlug(stapParam)
    ? stapParam
    : eersteOnvoltooid;

  const kern = isKernStap(activeSlug);
  const groep = kern ? KERN_STAPPEN : OPTIONELE_STAPPEN;
  const groepIndex = groep.findIndex((s) => s.slug === activeSlug);
  const activeStap = groep[groepIndex];
  const vorige = groep[groepIndex - 1];
  const isLaatsteInGroep = groepIndex === groep.length - 1;

  const selectedSkillIds = profile?.skills.map((s) => s.skillId) ?? [];
  const [skills, specializations, certifications] = await Promise.all([
    listSkills(),
    activeSlug === "specialisatie"
      ? listSpecializations(selectedSkillIds)
      : Promise.resolve([]),
    activeSlug === "certificaten" ? listCertifications() : Promise.resolve([]),
  ]);

  return (
    <Container className="grid gap-8 py-8 md:grid-cols-[260px_1fr] md:py-12">
      {/* Stappen-navigatie */}
      <aside>
        <p className="text-foreground-muted text-xs font-semibold tracking-wide uppercase">
          Nodig om te starten
        </p>
        <ol className="mt-2 space-y-1">
          {KERN_STAPPEN.map((s, i) => (
            <StapLink
              key={s.slug}
              slug={s.slug}
              label={s.label}
              nummer={i + 1}
              done={stapDone(s.slug, profile)}
              active={s.slug === activeSlug}
            />
          ))}
        </ol>

        <p className="text-foreground-muted mt-6 text-xs font-semibold tracking-wide uppercase">
          Later aanvullen (optioneel)
        </p>
        <ol className="mt-2 space-y-1">
          {OPTIONELE_STAPPEN.map((s) => (
            <StapLink
              key={s.slug}
              slug={s.slug}
              label={s.label}
              done={stapDone(s.slug, profile)}
              active={s.slug === activeSlug}
            />
          ))}
        </ol>
      </aside>

      {/* Actieve stap */}
      <div>
        <h1 className="text-2xl font-bold">{activeStap?.label}</h1>
        <p className="text-foreground-muted mt-1 text-sm">
          {kern
            ? `Stap ${groepIndex + 1} van ${KERN_STAPPEN.length}. Je voortgang wordt automatisch opgeslagen.`
            : "Optioneel — je kunt dit later aanvullen. Je voortgang wordt automatisch opgeslagen."}
        </p>

        {kern ? (
          <div className="border-brand-100 bg-brand-50 text-brand-700 mt-4 rounded-lg border p-3 text-sm">
            Zodra je naam, vakgebied en werkgebied zijn ingevuld, staat je
            profiel online en kunnen opdrachtgevers je vinden. De rest vul je
            later aan.
          </div>
        ) : null}

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
                <ButtonLink href="/zzpers/profiel" variant="ghost">
                  Later verder
                </ButtonLink>
                <Button type="submit" variant="brand">
                  {isLaatsteInGroep
                    ? kern
                      ? "Profiel opslaan"
                      : "Opslaan"
                    : "Opslaan en verder"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}

function StapLink({
  slug,
  label,
  nummer,
  done,
  active,
}: {
  slug: StapSlug;
  label: string;
  nummer?: number;
  done: boolean;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={`/zzpers/registreren?stap=${slug}`}
        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
          active
            ? "bg-brand-50 text-brand-700 font-semibold"
            : "text-foreground-muted hover:bg-surface-muted"
        }`}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
            done ? "bg-emerald-500 text-white" : "bg-border text-foreground-muted"
          }`}
        >
          {done ? "✓" : (nummer ?? "+")}
        </span>
        {label}
      </Link>
    </li>
  );
}
