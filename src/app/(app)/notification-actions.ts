"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { markAllRead } from "@/server/notifications/service";

export async function markeerMeldingenGelezen(
  formData: FormData,
): Promise<void> {
  const user = await requireCurrentUser();
  await markAllRead(user.id);
  const basePath = formData.get("basePath");
  if (typeof basePath === "string") revalidatePath(basePath);
}
