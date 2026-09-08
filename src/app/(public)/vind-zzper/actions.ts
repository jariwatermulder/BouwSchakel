"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  GeenToegangError,
  startDirectConversation,
} from "@/server/messaging/service";

/**
 * "Neem contact op": start een direct gesprek (zonder opdracht). Gasten gaan
 * naar registreren; ingelogde bedrijven komen direct in de chat.
 */
export async function neemContactOpAction(formData: FormData): Promise<void> {
  const zzpProfileId = String(formData.get("zzpProfileId") ?? "");
  if (!zzpProfileId) return;

  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/registreren?rol=bedrijf&next=${encodeURIComponent(`/vind-zzper/${zzpProfileId}`)}`,
    );
  }

  let conversationId: string;
  try {
    const c = await startDirectConversation(user.id, zzpProfileId);
    conversationId = c.id;
  } catch (e) {
    if (e instanceof GeenToegangError) {
      // Ingelogd, maar (nog) geen bedrijf: laat een bedrijfsaccount aanmaken.
      redirect("/registreren?rol=bedrijf");
    }
    throw e;
  }
  redirect(`/bedrijven/berichten/${conversationId}`);
}
