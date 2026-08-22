import "server-only";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { isProduction } from "@/lib/env";

/**
 * Server-side sessies met een opaak token.
 *
 * Het ruwe token staat alleen in een httpOnly-cookie; de database bewaart enkel
 * de SHA-256-hash. De cookie is Secure (in productie), httpOnly en SameSite=Lax.
 * Zie docs/SECURITY.md §1.
 */
export const SESSION_COOKIE = "bs_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dagen

export async function createSession(
  userId: string,
  meta: { userAgent?: string | null; ip?: string | null } = {},
): Promise<void> {
  const { token, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({
    data: {
      userId,
      tokenHash,
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) return null;
  if (session.user.status !== "ACTIEF") return null;

  return session.user;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session
      .delete({ where: { tokenHash: hashToken(token) } })
      .catch(() => {
        // Sessie kan al verlopen/verwijderd zijn; niet fataal.
      });
  }
  store.delete(SESSION_COOKIE);
}
