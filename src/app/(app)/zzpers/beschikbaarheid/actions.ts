"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { availabilitySchema } from "@/lib/validations/zzp";
import { addAvailability, removeAvailability } from "@/server/zzp/profile";

export interface BeschikbaarheidState {
  error?: string;
}

export async function voegBeschikbaarheidToe(
  _prev: BeschikbaarheidState,
  formData: FormData,
): Promise<BeschikbaarheidState> {
  const user = await requireCurrentRole("ZZP");
  const parsed = availabilitySchema.safeParse({
    van: formData.get("van"),
    tot: formData.get("tot") || undefined,
    type: formData.get("type") ?? "FULLTIME",
  });
  if (!parsed.success) {
    return { error: "Vul een geldige begindatum in." };
  }
  if (parsed.data.tot && parsed.data.tot < parsed.data.van) {
    return { error: "De einddatum ligt vóór de begindatum." };
  }

  await addAvailability(user.id, {
    van: parsed.data.van,
    tot: parsed.data.tot,
    type: parsed.data.type,
  });
  revalidatePath("/zzpers/beschikbaarheid");
  return {};
}

export async function verwijderBeschikbaarheid(
  formData: FormData,
): Promise<void> {
  const user = await requireCurrentRole("ZZP");
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await removeAvailability(user.id, id);
    revalidatePath("/zzpers/beschikbaarheid");
  }
}
