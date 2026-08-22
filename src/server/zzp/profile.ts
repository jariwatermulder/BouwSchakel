import "server-only";
import type { BeschikbaarheidType, Prisma, ZZPProfile } from "@prisma/client";
import { db } from "@/lib/db";
import {
  computeCompleteness,
  MIN_ZICHTBAAR_PCT,
} from "@/server/zzp/completeness";

/** Haalt het profiel van een gebruiker op, of maakt het aan als het nog niet bestaat. */
export async function getOrCreateProfile(userId: string): Promise<ZZPProfile> {
  const bestaand = await db.zZPProfile.findUnique({ where: { userId } });
  if (bestaand) return bestaand;
  return db.zZPProfile.create({ data: { userId } });
}

const profileInclude = {
  skills: { include: { skill: true } },
  specializations: { include: { specialization: true } },
  certifications: { include: { certification: true } },
  availability: { orderBy: { van: "asc" } },
  portfolio: { orderBy: { volgorde: "asc" } },
} satisfies Prisma.ZZPProfileInclude;

export type ProfileWithRelations = Prisma.ZZPProfileGetPayload<{
  include: typeof profileInclude;
}>;

export async function getProfileWithRelations(
  userId: string,
): Promise<ProfileWithRelations | null> {
  return db.zZPProfile.findUnique({
    where: { userId },
    include: profileInclude,
  });
}

/** Herberekent de completeness en slaat deze (plus zichtbaarheid) op. */
export async function recomputeCompleteness(
  profileId: string,
): Promise<number> {
  const p = await db.zZPProfile.findUniqueOrThrow({
    where: { id: profileId },
    include: {
      _count: {
        select: {
          skills: true,
          specializations: true,
          certifications: true,
          availability: true,
        },
      },
    },
  });

  const pct = computeCompleteness({
    voornaam: p.voornaam,
    achternaam: p.achternaam,
    telefoon: p.telefoon,
    over: p.over,
    jarenErvaring: p.jarenErvaring,
    uurtariefCents: p.uurtariefCents,
    werkgebiedPlaats: p.werkgebiedPlaats,
    maxReisafstandKm: p.maxReisafstandKm,
    startdatum: p.startdatum,
    skillsCount: p._count.skills,
    specializationsCount: p._count.specializations,
    certificationsCount: p._count.certifications,
    availabilityCount: p._count.availability,
    eigenBus: p.eigenBus,
    eigenGereedschap: p.eigenGereedschap,
    vca: p.vca,
  });

  await db.zZPProfile.update({
    where: { id: profileId },
    data: {
      profielCompleetheidPct: pct,
      // Zichtbaarheid pas aanzetten bij voldoende compleet; nooit terugzetten
      // op false zolang de drempel gehaald blijft.
      zichtbaar: pct >= MIN_ZICHTBAAR_PCT ? true : p.zichtbaar,
    },
  });
  return pct;
}

type ScalarProfileData = Pick<
  Prisma.ZZPProfileUpdateInput,
  | "voornaam"
  | "achternaam"
  | "telefoon"
  | "bedrijfsnaam"
  | "kvkNummer"
  | "over"
  | "jarenErvaring"
  | "uurtariefCents"
  | "werkgebiedPlaats"
  | "maxReisafstandKm"
  | "eigenBus"
  | "eigenGereedschap"
  | "vca"
  | "startdatum"
>;

export async function updateProfileFields(
  userId: string,
  data: ScalarProfileData,
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  await db.zZPProfile.update({ where: { id: profile.id }, data });
  await recomputeCompleteness(profile.id);
}

export async function setSkills(
  userId: string,
  skillIds: string[],
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  await db.$transaction([
    db.zZPSkill.deleteMany({ where: { zzpProfileId: profile.id } }),
    db.zZPSkill.createMany({
      data: skillIds.map((skillId) => ({ zzpProfileId: profile.id, skillId })),
      skipDuplicates: true,
    }),
  ]);
  await recomputeCompleteness(profile.id);
}

export async function setSpecializations(
  userId: string,
  specializationIds: string[],
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  await db.$transaction([
    db.zZPSpecialization.deleteMany({ where: { zzpProfileId: profile.id } }),
    db.zZPSpecialization.createMany({
      data: specializationIds.map((specializationId) => ({
        zzpProfileId: profile.id,
        specializationId,
      })),
      skipDuplicates: true,
    }),
  ]);
  await recomputeCompleteness(profile.id);
}

export async function setCertifications(
  userId: string,
  certificationIds: string[],
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  await db.$transaction([
    db.zZPCertification.deleteMany({ where: { zzpProfileId: profile.id } }),
    db.zZPCertification.createMany({
      data: certificationIds.map((certificationId) => ({
        zzpProfileId: profile.id,
        certificationId,
      })),
      skipDuplicates: true,
    }),
  ]);
  await recomputeCompleteness(profile.id);
}

export async function addAvailability(
  userId: string,
  input: { van: Date; tot?: Date; type: BeschikbaarheidType },
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  await db.availability.create({
    data: {
      zzpProfileId: profile.id,
      van: input.van,
      tot: input.tot ?? null,
      type: input.type,
    },
  });
  await recomputeCompleteness(profile.id);
}

export async function removeAvailability(
  userId: string,
  availabilityId: string,
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  // Alleen eigen beschikbaarheid mag worden verwijderd.
  await db.availability.deleteMany({
    where: { id: availabilityId, zzpProfileId: profile.id },
  });
  await recomputeCompleteness(profile.id);
}

export async function addPortfolioItem(
  userId: string,
  input: { titel: string; omschrijving?: string },
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  const count = await db.portfolioItem.count({
    where: { zzpProfileId: profile.id },
  });
  await db.portfolioItem.create({
    data: {
      zzpProfileId: profile.id,
      titel: input.titel,
      omschrijving: input.omschrijving ?? null,
      volgorde: count,
    },
  });
}

export async function removePortfolioItem(
  userId: string,
  itemId: string,
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  await db.portfolioItem.deleteMany({
    where: { id: itemId, zzpProfileId: profile.id },
  });
}
