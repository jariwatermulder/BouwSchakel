"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { rateLimit } from "@/lib/ratelimit";
import {
  getMessagesSince,
  sendMessage,
  startOrGetConversation,
} from "@/server/messaging/service";
import type { ChatBericht } from "@/lib/chat";
import type { Message } from "@prisma/client";

function naarChatBericht(m: Message): ChatBericht {
  return {
    id: m.id,
    body: m.body,
    senderUserId: m.senderUserId,
    createdAt: m.createdAt.toISOString(),
  };
}

/** Verstuurt een bericht in een bestaand gesprek. */
export async function verstuurBericht(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const conversationId = formData.get("conversationId");
  const body = formData.get("body");
  const basePath = formData.get("basePath");
  if (
    typeof conversationId === "string" &&
    typeof body === "string" &&
    body.trim()
  ) {
    if (!rateLimit(`message:${user.id}`, 60, 60 * 1000).success) return;
    await sendMessage(user.id, conversationId, body);
    if (typeof basePath === "string") {
      revalidatePath(`${basePath}/${conversationId}`);
    }
  }
}

/**
 * Verstuurt een bericht en geeft het opgeslagen bericht terug (voor de live
 * chat, zodat de client het direct kan tonen).
 */
export async function stuurBericht(
  conversationId: string,
  body: string,
): Promise<ChatBericht | null> {
  const user = await requireCurrentUser();
  if (typeof body !== "string" || !body.trim()) return null;
  if (!rateLimit(`message:${user.id}`, 60, 60 * 1000).success) return null;
  const bericht = await sendMessage(user.id, conversationId, body);
  return bericht ? naarChatBericht(bericht) : null;
}

/**
 * Haalt nieuwe berichten op sinds een tijdstip (live polling) en markeert
 * inkomende berichten als gelezen.
 */
export async function haalNieuweBerichten(
  conversationId: string,
  sindsIso?: string,
): Promise<ChatBericht[]> {
  const user = await requireCurrentUser();
  if (!rateLimit(`poll:${user.id}`, 120, 60 * 1000).success) return [];
  const sinds = sindsIso ? new Date(sindsIso) : undefined;
  const berichten = await getMessagesSince(user.id, conversationId, sinds);
  return berichten.map(naarChatBericht);
}

/** Opent (of maakt) een gesprek en navigeert ernaartoe. */
export async function openGesprek(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const jobId = formData.get("jobId");
  const zzpProfileId = formData.get("zzpProfileId");
  const basePath = formData.get("basePath");
  if (
    typeof jobId !== "string" ||
    typeof zzpProfileId !== "string" ||
    typeof basePath !== "string"
  ) {
    return;
  }
  const conversation = await startOrGetConversation(
    user.id,
    jobId,
    zzpProfileId,
  );
  redirect(`${basePath}/${conversation.id}`);
}
