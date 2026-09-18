"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { rateLimit } from "@/lib/ratelimit";
import { resendEmailVerification } from "@/server/auth/service";

/** Stuurt de bevestigingsmail opnieuw (hooguit 3× per uur per account). */
export async function stuurVerificatieOpnieuw(): Promise<void> {
  const user = await requireCurrentUser();
  if (user.emailVerifiedAt) return;
  if (!rateLimit(`verify-resend:${user.id}`, 3, 60 * 60 * 1000).success) return;
  await resendEmailVerification(user.id);
  revalidatePath("/zzpers/instellingen");
  revalidatePath("/bedrijven/instellingen");
}
