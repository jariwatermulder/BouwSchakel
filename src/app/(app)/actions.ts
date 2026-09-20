"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/current-user";
import { trackEvent } from "@/lib/analytics/track";

export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) await trackEvent("logout", { userId: user.id, userRole: user.role });
  await destroySession();
  redirect("/");
}
