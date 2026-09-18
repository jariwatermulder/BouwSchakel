import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import type { StorageProvider, StoredObject } from "./index";
import { publiekeUrl } from "./url";

/**
 * Bestandsopslag in Postgres (tabel StoredFile). Geen extra provider of
 * sleutels nodig: werkt direct op Supabase/Vercel. Bestanden zijn klein
 * (foto's worden verkleind, documenten max. 10 MB) en gaan via cascade mee
 * weg met de eigenaar. Later inwisselbaar voor object storage via dezelfde
 * StorageProvider-interface.
 */

export const PUBLIEK_PREFIX = "public/";

export function isPubliekeKey(key: string): boolean {
  return key.startsWith(PUBLIEK_PREFIX);
}

export { publiekeUrl } from "./url";

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET ontbreekt.");
  return s;
}

export function handtekening(key: string, exp: number): string {
  return createHmac("sha256", secret()).update(`${key}:${exp}`).digest("hex");
}

export function handtekeningGeldig(
  key: string,
  exp: number,
  sig: string,
): boolean {
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const verwacht = Buffer.from(handtekening(key, exp));
  const gegeven = Buffer.from(sig);
  return verwacht.length === gegeven.length && timingSafeEqual(verwacht, gegeven);
}

export class PostgresStorageProvider implements StorageProvider {
  async put(input: {
    key: string;
    body: Buffer;
    contentType: string;
    ownerUserId?: string | null;
  }): Promise<StoredObject> {
    await db.storedFile.upsert({
      where: { key: input.key },
      update: {
        mime: input.contentType,
        grootte: input.body.byteLength,
        data: input.body,
        publiek: isPubliekeKey(input.key),
        ownerUserId: input.ownerUserId ?? null,
      },
      create: {
        key: input.key,
        mime: input.contentType,
        grootte: input.body.byteLength,
        data: input.body,
        publiek: isPubliekeKey(input.key),
        ownerUserId: input.ownerUserId ?? null,
      },
    });
    return { key: input.key };
  }

  async signedUrl(key: string, expiresInSeconds: number): Promise<string> {
    if (isPubliekeKey(key)) return publiekeUrl(key);
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return `${publiekeUrl(key)}?exp=${exp}&sig=${handtekening(key, exp)}`;
  }

  async delete(key: string): Promise<void> {
    await db.storedFile.deleteMany({ where: { key } });
  }
}

/** Leest een bestand (zonder autorisatie; die doet de aanroeper). */
export async function leesBestand(key: string) {
  return db.storedFile.findUnique({
    where: { key },
    select: { mime: true, grootte: true, data: true, publiek: true },
  });
}
