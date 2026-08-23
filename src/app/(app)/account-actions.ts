"use server";

import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { destroySession } from "@/lib/auth/session";
import { deleteAccount } from "@/server/account/service";

export async function verwijderAccount(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  // Vereist expliciete bevestiging.
  if (formData.get("bevestig") !== "VERWIJDER") return;
  await destroySession();
  await deleteAccount(user.id);
  redirect("/");
}
