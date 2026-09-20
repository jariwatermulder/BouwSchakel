"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { bedrijfOnboardingPad } from "@/server/company/service";
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

  const terug = `/vind-zzper/${zzpProfileId}`;
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/registreren?rol=bedrijf&next=${encodeURIComponent(terug)}`,
    );
  }

  // Zonder bedrijfsnaam en KvK-nummer eerst het bedrijfsprofiel afmaken.
  if (user.role === "COMPANY") {
    const onboarding = await bedrijfOnboardingPad(user.id, terug);
    if (onboarding) redirect(onboarding);
  }

  let conversationId: string;
  try {
    const c = await startDirectConversation(user.id, zzpProfileId);
    conversationId = c.id;
  } catch (e) {
    if (e instanceof GeenToegangError) {
      // Ingelogd, maar (nog) geen bedrijf: vul kort het bedrijf aan en kom
      // daarna terug op dit profiel om contact op te nemen.
      redirect(
        `/bedrijven/registreren?next=${encodeURIComponent(terug)}`,
      );
    }
    throw e;
  }
  redirect(`/bedrijven/berichten/${conversationId}`);
}
