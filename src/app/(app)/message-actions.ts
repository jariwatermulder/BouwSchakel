"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { rateLimit } from "@/lib/ratelimit";
import {
  sendMessage,
  startOrGetConversation,
} from "@/server/messaging/service";

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
