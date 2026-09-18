"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { db } from "@/lib/db";

const STATUSSEN = ["NIEUW", "BEANTWOORD", "GESLOTEN"] as const;
type Status = (typeof STATUSSEN)[number];

export async function zetContactStatus(formData: FormData): Promise<void> {
  const admin = await requireCurrentAdmin("SUPPORT");
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || typeof status !== "string") return;
  if (!STATUSSEN.includes(status as Status)) return;
  const nieuweStatus = status as Status;

  await db.contactMessage.update({
    where: { id },
    data: { status: nieuweStatus },
  });
  await db.auditLog.create({
    data: {
      actorUserId: admin.id,
      actie: "CONTACTBERICHT_STATUS",
      subjectType: "ContactMessage",
      subjectId: id,
      meta: { status: nieuweStatus },
    },
  });
  revalidatePath("/admin/contact");
}
