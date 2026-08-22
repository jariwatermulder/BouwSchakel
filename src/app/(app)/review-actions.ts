"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { reviewSchema } from "@/lib/validations/review";
import {
  completeAssignment,
  createReview,
  OpdrachtNietAfgerondError,
  ReviewBestaatAlError,
} from "@/server/reviews/service";

export interface ReviewState {
  error?: string;
  ok?: boolean;
}

export async function plaatsReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await requireCurrentUser();
  const assignmentId = formData.get("assignmentId");
  if (typeof assignmentId !== "string") return { error: "Onbekende opdracht." };

  const parsed = reviewSchema.safeParse({
    scoreKwaliteit: formData.get("scoreKwaliteit"),
    scoreCommunicatie: formData.get("scoreCommunicatie"),
    scoreBetrouwbaarheid: formData.get("scoreBetrouwbaarheid"),
    scoreAfspraken: formData.get("scoreAfspraken"),
    toelichting: formData.get("toelichting"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Controleer de scores.",
    };
  }

  try {
    await createReview(user.id, assignmentId, parsed.data);
  } catch (err) {
    if (err instanceof ReviewBestaatAlError) return { error: err.message };
    if (err instanceof OpdrachtNietAfgerondError) return { error: err.message };
    throw err;
  }
  const basePath = formData.get("basePath");
  if (typeof basePath === "string") revalidatePath(basePath);
  return { ok: true };
}

export async function markeerOpdrachtAfgerond(
  formData: FormData,
): Promise<void> {
  const user = await requireCurrentUser();
  const assignmentId = formData.get("assignmentId");
  const urenRaw = formData.get("gewerkteUren");
  if (typeof assignmentId !== "string") return;
  const uren =
    typeof urenRaw === "string" && urenRaw ? Number(urenRaw) : undefined;
  await completeAssignment(
    user.id,
    assignmentId,
    uren != null && Number.isFinite(uren) ? uren : undefined,
  );
  const basePath = formData.get("basePath");
  if (typeof basePath === "string") revalidatePath(basePath);
}
