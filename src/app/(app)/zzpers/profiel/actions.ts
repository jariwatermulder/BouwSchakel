"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { rateLimit } from "@/lib/ratelimit";
import {
  leesUploadAfbeelding,
  OngeldigeAfbeeldingError,
  verwerkProfielFoto,
} from "@/lib/images";
import {
  removePortfolioItem,
  removeProfielFoto,
  setProfielFoto,
} from "@/server/zzp/profile";

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

/** Profielfoto uploaden: valideren, verkleinen (512×512 WebP), opslaan. */
export async function uploadProfielFoto(formData: FormData): Promise<void> {
  const user = await requireCurrentRole("ZZP");
  if (!rateLimit(`foto:${user.id}`, 20, 60 * 60 * 1000).success) {
    redirect("/zzpers/profiel?foto=limiet");
  }
  let webp: Buffer;
  try {
    const ruw = await leesUploadAfbeelding(formData.get("foto"));
    if (!ruw) redirect("/zzpers/profiel?foto=leeg");
    webp = await verwerkProfielFoto(ruw);
  } catch (err) {
    if (err instanceof OngeldigeAfbeeldingError) redirect("/zzpers/profiel?foto=fout");
    throw err;
  }
  await setProfielFoto(user.id, webp);
  revalidatePath("/zzpers/profiel");
  redirect("/zzpers/profiel?foto=ok");
}

export async function verwijderProfielFoto(): Promise<void> {
  const user = await requireCurrentRole("ZZP");
  await removeProfielFoto(user.id);
  revalidatePath("/zzpers/profiel");
  redirect("/zzpers/profiel");
}
