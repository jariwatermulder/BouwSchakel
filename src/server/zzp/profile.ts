import "server-only";
import { randomUUID } from "node:crypto";
import { getStorageProvider } from "@/lib/storage";
import type { BeschikbaarheidType, Prisma, ZZPProfile } from "@prisma/client";
import { db } from "@/lib/db";
import { trackEvent } from "@/lib/analytics/track";
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
    // "Anders, namelijk…" telt mee als ingevulde keuze.
    skillsCount: p._count.skills + (p.vakgebiedAnders ? 1 : 0),
    specializationsCount: p._count.specializations + (p.specialisatieAnders ? 1 : 0),
    certificationsCount: p._count.certifications + (p.certificatenAnders ? 1 : 0),
    availabilityCount: p._count.availability,
    eigenBus: p.eigenBus,
    eigenGereedschap: p.eigenGereedschap,
    vca: p.vca,
  });

  // Zonder KvK-nummer is een profiel nooit zichtbaar. Met KvK-nummer gaat de
  // zichtbaarheid aan bij voldoende compleetheid en nooit meer terug op false
  // zolang de drempel gehaald blijft.
  const heeftKvk = !!p.kvkNummer;
  const zichtbaar = heeftKvk && (pct >= MIN_ZICHTBAAR_PCT || p.zichtbaar);

  await db.zZPProfile.update({
    where: { id: profileId },
    data: { profielCompleetheidPct: pct, zichtbaar },
  });
  if (pct === 100 && p.profielCompleetheidPct < 100) {
    await trackEvent("profile_completed", { userId: p.userId, userRole: "ZZP" });
  }
  if (zichtbaar && !p.zichtbaar) {
    await trackEvent("profile_visible", { userId: p.userId, userRole: "ZZP", metadata: { pct } });
  }
  return pct;
}

type ScalarProfileData = Pick<
  Prisma.ZZPProfileUpdateInput,
  | "voornaam"
  | "achternaam"
  | "telefoon"
  | "bedrijfsnaam"
  | "kvkNummer"
  | "kvkNaam"
  | "kvkGecontroleerdOp"
  | "over"
  | "jarenErvaring"
  | "uurtariefCents"
  | "werkgebiedPlaats"
  | "maxReisafstandKm"
  | "eigenBus"
  | "eigenGereedschap"
  | "vca"
  | "startdatum"
  | "vakgebiedAnders"
  | "specialisatieAnders"
  | "certificatenAnders"
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

export const MAX_PORTFOLIO_ITEMS = 12;

export async function addPortfolioItem(
  userId: string,
  input: { titel: string; omschrijving?: string; afbeelding?: Buffer | null },
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  const count = await db.portfolioItem.count({
    where: { zzpProfileId: profile.id },
  });
  if (count >= MAX_PORTFOLIO_ITEMS) return;

  let afbeeldingKey: string | null = null;
  if (input.afbeelding) {
    afbeeldingKey = `public/portfolio/${profile.id}/${randomUUID()}.webp`;
    const storage = await getStorageProvider();
    await storage.put({
      key: afbeeldingKey,
      body: input.afbeelding,
      contentType: "image/webp",
      ownerUserId: userId,
    });
  }

  await db.portfolioItem.create({
    data: {
      zzpProfileId: profile.id,
      titel: input.titel,
      omschrijving: input.omschrijving ?? null,
      afbeeldingKey,
      volgorde: count,
    },
  });
}

export async function removePortfolioItem(
  userId: string,
  itemId: string,
): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  const item = await db.portfolioItem.findFirst({
    where: { id: itemId, zzpProfileId: profile.id },
    select: { id: true, afbeeldingKey: true },
  });
  if (!item) return;
  await db.portfolioItem.delete({ where: { id: item.id } });
  if (item.afbeeldingKey) {
    const storage = await getStorageProvider();
    await storage.delete(item.afbeeldingKey);
  }
}

/** Slaat een (al verwerkte) profielfoto op en ruimt de vorige op. */
export async function setProfielFoto(
  userId: string,
  webp: Buffer,
): Promise<string> {
  const profile = await getOrCreateProfile(userId);
  const key = `public/profiel/${profile.id}/${randomUUID()}.webp`;
  const storage = await getStorageProvider();
  await storage.put({ key, body: webp, contentType: "image/webp", ownerUserId: userId });
  await db.zZPProfile.update({ where: { id: profile.id }, data: { fotoKey: key } });
  if (profile.fotoKey) await storage.delete(profile.fotoKey);
  await trackEvent("profile_photo_uploaded", { userId, userRole: "ZZP", metadata: { vervangen: !!profile.fotoKey } });
  return key;
}

export async function removeProfielFoto(userId: string): Promise<void> {
  const profile = await getOrCreateProfile(userId);
  if (!profile.fotoKey) return;
  await db.zZPProfile.update({ where: { id: profile.id }, data: { fotoKey: null } });
  const storage = await getStorageProvider();
  await storage.delete(profile.fotoKey);
}
