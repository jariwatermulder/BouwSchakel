"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DocumentType } from "@prisma/client";
import { requireCurrentRole } from "@/lib/auth/current-user";
import { rateLimit } from "@/lib/ratelimit";
import { db } from "@/lib/db";
import {
  getStorageProvider,
  MAX_BESTANDSGROOTTE_BYTES,
  TOEGESTANE_MIMES,
  veiligeBestandsnaam,
} from "@/lib/storage";

const TYPES: DocumentType[] = ["IDENTITEIT", "VCA", "CERTIFICAAT", "VERZEKERING", "KVK", "OVERIG"];
const MAX_DOCUMENTEN = 20;

/** Document uploaden (PDF/JPG/PNG, max. 10 MB) voor verificatie. */
export async function uploadDocument(formData: FormData): Promise<void> {
  const user = await requireCurrentRole("ZZP");
  const terug: (status: string) => never = (status) =>
    redirect(`/zzpers/documenten?upload=${status}`);

  const type = formData.get("type");
  const bestand = formData.get("bestand");
  if (typeof type !== "string" || !TYPES.includes(type as DocumentType)) terug("fout");
  if (!(bestand instanceof File) || bestand.size === 0) terug("leeg");
  if (!(TOEGESTANE_MIMES as readonly string[]).includes(bestand.type)) terug("type");
  if (bestand.size > MAX_BESTANDSGROOTTE_BYTES) terug("groot");
  if (!rateLimit(`document:${user.id}`, 20, 60 * 60 * 1000).success) terug("limiet");
  if ((await db.document.count({ where: { ownerUserId: user.id } })) >= MAX_DOCUMENTEN) terug("max");

  const ext = bestand.type === "application/pdf" ? "pdf" : bestand.type === "image/png" ? "png" : "jpg";
  const key = `documenten/${user.id}/${randomUUID()}.${ext}`;
  const storage = await getStorageProvider();
  await storage.put({
    key,
    body: Buffer.from(await bestand.arrayBuffer()),
    contentType: bestand.type,
    ownerUserId: user.id,
  });
  await db.document.create({
    data: {
      ownerUserId: user.id,
      type: type as DocumentType,
      bestandsnaam: veiligeBestandsnaam(bestand.name),
      opslagKey: key,
      mime: bestand.type,
      grootte: bestand.size,
    },
  });
  revalidatePath("/zzpers/documenten");
  terug("ok");
}

export async function verwijderDocument(formData: FormData): Promise<void> {
  const user = await requireCurrentRole("ZZP");
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const doc = await db.document.findFirst({ where: { id, ownerUserId: user.id } });
  if (!doc) return;
  await db.document.delete({ where: { id: doc.id } });
  const storage = await getStorageProvider();
  await storage.delete(doc.opslagKey);
  revalidatePath("/zzpers/documenten");
}
