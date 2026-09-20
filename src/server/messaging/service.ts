import "server-only";
import type { Conversation, Message, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { trackEvent } from "@/lib/analytics/track";
import { notify } from "@/server/notifications/service";

export class GeenToegangError extends Error {
  constructor() {
    super("Geen toegang tot dit gesprek.");
    this.name = "GeenToegangError";
  }
}

interface Deelname {
  isZzp: boolean;
  companyId: string;
  zzpUserId: string;
}

/** Controleert of de gebruiker deelnemer is en of hij de ZZP- of bedrijfskant is. */
async function deelname(
  userId: string,
  conversation: { companyId: string; zzpProfileId: string },
): Promise<Deelname | null> {
  const zzp = await db.zZPProfile.findUnique({
    where: { id: conversation.zzpProfileId },
    select: { userId: true },
  });
  if (!zzp) return null;
  if (zzp.userId === userId) {
    return {
      isZzp: true,
      companyId: conversation.companyId,
      zzpUserId: zzp.userId,
    };
  }
  const member = await db.companyMember.findFirst({
    where: { companyId: conversation.companyId, userId },
    select: { id: true },
  });
  if (member) {
    return {
      isZzp: false,
      companyId: conversation.companyId,
      zzpUserId: zzp.userId,
    };
  }
  return null;
}

/**
 * Start (of hervat) het directe gesprek tussen een bedrijf en een zzp'er.
 * Er is per bedrijf/zzp'er-paar hooguit één gesprek. Alleen bedrijfsleden
 * kunnen een gesprek starten; alleen zichtbare profielen zijn benaderbaar.
 */
export async function startDirectConversation(
  userId: string,
  zzpProfileId: string,
): Promise<Conversation & { nieuw: boolean }> {
  const member = await db.companyMember.findFirst({
    where: { userId },
    select: { companyId: true },
  });
  if (!member) throw new GeenToegangError();

  const zzp = await db.zZPProfile.findFirst({
    where: { id: zzpProfileId, zichtbaar: true, deletedAt: null },
    select: { id: true },
  });
  if (!zzp) throw new GeenToegangError();

  const bestaand = await db.conversation.findUnique({
    where: {
      companyId_zzpProfileId: { companyId: member.companyId, zzpProfileId },
    },
  });
  if (bestaand) return { ...bestaand, nieuw: false };
  const nieuw = await db.conversation.create({
    data: { companyId: member.companyId, zzpProfileId },
  });
  await trackEvent("contact_request_sent", {
    userId,
    userRole: "COMPANY",
    page: `/vind-zzper/${zzpProfileId}`,
    metadata: { conversationId: nieuw.id, zzpProfileId, companyId: member.companyId },
  });
  return { ...nieuw, nieuw: true };
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  body: string,
): Promise<Message | null> {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) throw new GeenToegangError();
  const d = await deelname(userId, conversation);
  if (!d) throw new GeenToegangError();

  const tekst = body.trim();
  if (!tekst) return null;

  const [bericht] = await db.$transaction([
    db.message.create({
      data: { conversationId, senderUserId: userId, body: tekst },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { laatsteBericht: new Date() },
    }),
  ]);

  await trackEvent("message_sent", {
    userId,
    userRole: d.isZzp ? "ZZP" : "COMPANY",
    metadata: { conversationId, lengte: tekst.length },
  });

  // Notificeer de tegenpartij.
  if (d.isZzp) {
    const members = await db.companyMember.findMany({
      where: { companyId: d.companyId },
      select: { userId: true },
    });
    await Promise.all(
      members.map((m) =>
        notify({
          userId: m.userId,
          type: "NIEUW_BERICHT",
          titel: "Nieuw bericht",
          tekst: "Je hebt een nieuw bericht van een zzp'er.",
          link: `/bedrijven/berichten/${conversationId}`,
        }),
      ),
    );
  } else {
    await notify({
      userId: d.zzpUserId,
      type: "NIEUW_BERICHT",
      titel: "Nieuw bericht",
      tekst: "Je hebt een nieuw bericht van een opdrachtgever.",
      link: `/zzpers/berichten/${conversationId}`,
    });
  }

  return bericht;
}

/**
 * Haalt berichten op sinds een bepaald moment (voor live polling) en markeert
 * inkomende berichten als gelezen. Autoriseert via deelname; gooit bij geen
 * toegang. Zonder `sinds` worden alle berichten teruggegeven.
 */
export async function getMessagesSince(
  userId: string,
  conversationId: string,
  sinds?: Date,
): Promise<Message[]> {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, companyId: true, zzpProfileId: true },
  });
  if (!conversation) throw new GeenToegangError();
  const d = await deelname(userId, conversation);
  if (!d) throw new GeenToegangError();

  const messages = await db.message.findMany({
    where: {
      conversationId,
      ...(sinds ? { createdAt: { gt: sinds } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  await db.message.updateMany({
    where: { conversationId, gelezenOp: null, senderUserId: { not: userId } },
    data: { gelezenOp: new Date() },
  });

  return messages;
}

const conversationInclude = {
  company: true,
  zzpProfile: true,
} satisfies Prisma.ConversationInclude;

export type ConversationListItem = Prisma.ConversationGetPayload<{
  include: typeof conversationInclude;
}> & { ongelezen: number };

export async function listConversationsForUser(
  userId: string,
): Promise<ConversationListItem[]> {
  const conversations = await db.conversation.findMany({
    where: {
      OR: [
        { zzpProfile: { userId } },
        { company: { members: { some: { userId } } } },
      ],
    },
    include: conversationInclude,
    orderBy: { laatsteBericht: "desc" },
  });

  return Promise.all(
    conversations.map(async (c) => ({
      ...c,
      ongelezen: await db.message.count({
        where: {
          conversationId: c.id,
          gelezenOp: null,
          senderUserId: { not: userId },
        },
      }),
    })),
  );
}

export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    company: true;
    zzpProfile: true;
    messages: true;
  };
}>;

export async function unreadMessagesCount(userId: string): Promise<number> {
  return db.message.count({
    where: {
      gelezenOp: null,
      senderUserId: { not: userId },
      conversation: {
        OR: [
          { zzpProfile: { userId } },
          { company: { members: { some: { userId } } } },
        ],
      },
    },
  });
}

export async function getConversation(
  userId: string,
  conversationId: string,
): Promise<ConversationWithMessages | null> {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      company: true,
      zzpProfile: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) return null;
  const d = await deelname(userId, conversation);
  if (!d) throw new GeenToegangError();

  // Markeer inkomende berichten als gelezen.
  await db.message.updateMany({
    where: { conversationId, gelezenOp: null, senderUserId: { not: userId } },
    data: { gelezenOp: new Date() },
  });

  return conversation;
}
