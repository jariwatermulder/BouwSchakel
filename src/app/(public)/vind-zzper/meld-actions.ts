"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { rateLimit } from "@/lib/ratelimit";
import { trackEvent } from "@/lib/analytics/track";
import { db } from "@/lib/db";

const schema = z.object({
  zzpProfileId: z.string().uuid(),
  reden: z.enum(["NEPPROFIEL", "SPAM", "ONGEPAST", "ANDERS"]),
  toelichting: z.string().trim().max(1000).optional(),
});

/**
 * Meldt een zzp-profiel bij het beheerteam. Alleen voor ingelogde gebruikers;
 * hooguit één melding per profiel per melder, en hooguit 5 meldingen per uur.
 */
export async function meldProfielAction(formData: FormData): Promise<void> {
  const zzpProfileId = String(formData.get("zzpProfileId") ?? "");
  const terug = `/vind-zzper/${zzpProfileId}`;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/inloggen?next=${encodeURIComponent(terug)}`);
  }

  const parsed = schema.safeParse({
    zzpProfileId,
    reden: formData.get("reden"),
    toelichting: formData.get("toelichting") || undefined,
  });
  if (!parsed.success) redirect(`${terug}?gemeld=fout`);

  if (!rateLimit(`report:${user.id}`, 5, 60 * 60 * 1000).success) {
    redirect(`${terug}?gemeld=limiet`);
  }

  const profiel = await db.zZPProfile.findFirst({
    where: { id: parsed.data.zzpProfileId, zichtbaar: true, deletedAt: null },
    select: { id: true, userId: true },
  });
  if (!profiel) redirect(terug);
  if (profiel.userId === user.id) redirect(terug);

  const bestaand = await db.report.findFirst({
    where: {
      melderUserId: user.id,
      subjectType: "ZZP_PROFIEL",
      subjectId: profiel.id,
      status: { in: ["OPEN", "IN_BEHANDELING"] },
    },
    select: { id: true },
  });
  if (!bestaand) {
    await db.report.create({
      data: {
        melderUserId: user.id,
        subjectType: "ZZP_PROFIEL",
        subjectId: profiel.id,
        reden: parsed.data.reden,
        toelichting: parsed.data.toelichting ?? null,
      },
    });
    await trackEvent("profile_reported", { userId: user.id, userRole: user.role, page: terug, metadata: { reden: parsed.data.reden, zzpProfileId: profiel.id } });
  }
  redirect(`${terug}?gemeld=1`);
}
