"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentRole } from "@/lib/auth/current-user";
import {
  inviteZzp,
  rejectApplication,
  selectCandidate,
} from "@/server/applications/service";

export async function selecteerKandidaat(formData: FormData): Promise<void> {
  const user = await requireCurrentRole("COMPANY");
  const applicationId = formData.get("applicationId");
  const jobId = formData.get("jobId");
  if (typeof applicationId === "string") {
    await selectCandidate(user.id, applicationId);
    if (typeof jobId === "string") {
      revalidatePath(`/bedrijven/opdrachten/${jobId}`);
    }
  }
}

export async function wijsKandidaatAf(formData: FormData): Promise<void> {
  const user = await requireCurrentRole("COMPANY");
  const applicationId = formData.get("applicationId");
  const jobId = formData.get("jobId");
  if (typeof applicationId === "string") {
    await rejectApplication(user.id, applicationId);
    if (typeof jobId === "string") {
      revalidatePath(`/bedrijven/opdrachten/${jobId}`);
    }
  }
}

export async function nodigKandidaatUit(formData: FormData): Promise<void> {
  const user = await requireCurrentRole("COMPANY");
  const jobId = formData.get("jobId");
  const zzpProfileId = formData.get("zzpProfileId");
  if (typeof jobId === "string" && typeof zzpProfileId === "string") {
    await inviteZzp(user.id, jobId, zzpProfileId);
    revalidatePath(`/bedrijven/opdrachten/${jobId}`);
  }
}
