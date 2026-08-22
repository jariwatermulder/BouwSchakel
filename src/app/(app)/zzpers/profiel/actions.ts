"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { removePortfolioItem } from "@/server/zzp/profile";

export async function verwijderPortfolioItem(
  formData: FormData,
): Promise<void> {
  const user = await requireCurrentRole("ZZP");
  const itemId = formData.get("itemId");
  if (typeof itemId === "string" && itemId) {
    await removePortfolioItem(user.id, itemId);
    revalidatePath("/zzpers/profiel");
  }
}
