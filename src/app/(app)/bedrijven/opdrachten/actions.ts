"use server";

import { revalidatePath } from "next/cache";
import type { JobStatus } from "@prisma/client";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { setJobStatus } from "@/server/jobs/service";

const TOEGESTAAN: JobStatus[] = [
  "GEPUBLICEERD",
  "GESLOTEN",
  "VERVULD",
  "GEANNULEERD",
];

export async function wijzigOpdrachtStatus(formData: FormData): Promise<void> {
  const user = await requireCurrentRole("COMPANY");
  const jobId = formData.get("jobId");
  const status = formData.get("status");
  if (
    typeof jobId === "string" &&
    typeof status === "string" &&
    (TOEGESTAAN as string[]).includes(status)
  ) {
    await setJobStatus(user.id, jobId, status as JobStatus);
    revalidatePath(`/bedrijven/opdrachten/${jobId}`);
    revalidatePath("/bedrijven/opdrachten");
  }
}
