import "server-only";
import { db } from "@/lib/db";

/** Schrijft een regel naar het (append-only) audit log. */
export async function logAudit(input: {
  actorUserId: string;
  actie: string;
  subjectType?: string;
  subjectId?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  await db.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      actie: input.actie,
      subjectType: input.subjectType ?? null,
      subjectId: input.subjectId ?? null,
      meta: input.meta ? JSON.parse(JSON.stringify(input.meta)) : undefined,
    },
  });
}
