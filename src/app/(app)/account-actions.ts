"use server";

import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { destroySession } from "@/lib/auth/session";
import { deleteAccount } from "@/server/account/service";
import { trackEvent } from "@/lib/analytics/track";
import { db } from "@/lib/db";

export async function verwijderAccount(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  // Vereist expliciete bevestiging.
  if (formData.get("bevestig") !== "VERWIJDER") return;
  await trackEvent("account_deleted", { userRole: user.role });
  await destroySession();
  await deleteAccount(user.id);
  // AVG: eerdere analytics-events losmaken van het verwijderde account.
  await db.analyticsEvent.updateMany({ where: { userId: user.id }, data: { userId: null } });
  redirect("/");
}
