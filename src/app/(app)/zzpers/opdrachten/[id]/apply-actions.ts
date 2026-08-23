"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { rateLimit } from "@/lib/ratelimit";
import {
  applyToJob,
  ReactieBestaatAlError,
  withdrawApplication,
} from "@/server/applications/service";

export interface ApplyState {
  error?: string;
  ok?: boolean;
}

export async function reageerOpOpdracht(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const user = await requireCurrentRole("ZZP");
  if (!rateLimit(`apply:${user.id}`, 30, 60 * 60 * 1000).success) {
    return {
      error: "Te veel reacties in korte tijd. Probeer het later opnieuw.",
    };
  }
  const jobId = formData.get("jobId");
  if (typeof jobId !== "string") return { error: "Onbekende opdracht." };

  const bericht = formData.get("bericht");
  const tariefRaw = formData.get("uurtariefEuro");
  const tarief =
    typeof tariefRaw === "string" && tariefRaw
      ? Math.round(Number(tariefRaw) * 100)
      : undefined;

  try {
    await applyToJob(user.id, jobId, {
      bericht:
        typeof bericht === "string" && bericht.trim()
          ? bericht.trim()
          : undefined,
      uurtariefVoorstelCents:
        tarief != null && Number.isFinite(tarief) ? tarief : undefined,
    });
  } catch (err) {
    if (err instanceof ReactieBestaatAlError) return { error: err.message };
    throw err;
  }
  revalidatePath(`/zzpers/opdrachten/${jobId}`);
  return { ok: true };
}

export async function trekReactieIn(formData: FormData): Promise<void> {
  const user = await requireCurrentRole("ZZP");
  const applicationId = formData.get("applicationId");
  const jobId = formData.get("jobId");
  if (typeof applicationId === "string") {
    await withdrawApplication(user.id, applicationId);
    if (typeof jobId === "string") {
      revalidatePath(`/zzpers/opdrachten/${jobId}`);
    }
    revalidatePath("/zzpers/reacties");
  }
}
