import "server-only";
import type { Notification, NotificationType } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { serverEnv } from "@/lib/env";

/**
 * Notificaties: in-app + (optioneel) e-mail, met inachtneming van de
 * voorkeuren per gebruiker. Zie docs/ARCHITECTURE.md §6.
 */
export interface NieuweNotificatie {
  userId: string;
  type: NotificationType;
  titel: string;
  tekst: string;
  link?: string;
}

// Koppelt een notificatietype aan de e-mailvoorkeur-kolom (indien van toepassing).
const EMAIL_VOORKEUR: Partial<Record<NotificationType, string>> = {
  NIEUWE_REACTIE: "emailReacties",
  UITNODIGING: "emailReacties",
  GESELECTEERD: "emailReacties",
  AFGEWEZEN: "emailReacties",
  NIEUW_BERICHT: "emailBerichten",
  NIEUWE_MATCH: "emailMatches",
  REVIEW_ONTVANGEN: "emailReviews",
};

export async function notify(input: NieuweNotificatie): Promise<void> {
  await db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      titel: input.titel,
      tekst: input.tekst,
      link: input.link ?? null,
    },
  });

  const voorkeurKolom = EMAIL_VOORKEUR[input.type];
  if (!voorkeurKolom) return;

  const [user, pref] = await Promise.all([
    db.user.findUnique({ where: { id: input.userId } }),
    db.notificationPreference.findUnique({ where: { userId: input.userId } }),
  ]);
  if (!user) return;

  // Standaard aan wanneer geen voorkeuren zijn opgeslagen.
  const emailAan =
    pref == null ||
    (pref as unknown as Record<string, boolean>)[voorkeurKolom] === true;
  if (!emailAan) return;

  const link = input.link ? `${serverEnv().APP_URL}${input.link}` : undefined;
  await sendEmail({
    to: user.email,
    subject: `${input.titel} — ZZP Connect`,
    text: `${input.tekst}${link ? `\n\n${link}` : ""}`,
  }).catch(() => {
    // E-mail mag nooit de hoofdactie laten falen.
  });
}

export async function listNotifications(
  userId: string,
  limit = 30,
): Promise<Notification[]> {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function unreadCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, gelezenOp: null } });
}

export async function markAllRead(userId: string): Promise<void> {
  await db.notification.updateMany({
    where: { userId, gelezenOp: null },
    data: { gelezenOp: new Date() },
  });
}
