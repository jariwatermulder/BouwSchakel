import "server-only";
import type { User, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/send";
import { serverEnv } from "@/lib/env";

/** Domeinfouten voor de authenticatie-flows. */
export class EmailInGebruikError extends Error {
  constructor() {
    super("Er bestaat al een account met dit e-mailadres.");
    this.name = "EmailInGebruikError";
  }
}

export class OngeldigeInlogError extends Error {
  constructor() {
    super("E-mailadres of wachtwoord is onjuist.");
    this.name = "OngeldigeInlogError";
  }
}

const EMAIL_VERIFICATIE_TTL_MS = 1000 * 60 * 60 * 24; // 24 uur

export async function registerUser(input: {
  email: string;
  password: string;
  role: UserRole;
}): Promise<User> {
  const bestaand = await db.user.findUnique({ where: { email: input.email } });
  if (bestaand) throw new EmailInGebruikError();

  const passwordHash = await hashPassword(input.password);
  const user = await db.user.create({
    data: { email: input.email, passwordHash, role: input.role },
  });

  await createEmailVerification(user);
  return user;
}

async function createEmailVerification(user: User): Promise<void> {
  const { token, tokenHash } = generateToken();
  await db.verificationToken.create({
    data: {
      userId: user.id,
      type: "EMAIL_VERIFICATIE",
      tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATIE_TTL_MS),
    },
  });

  const url = `${serverEnv().APP_URL}/verifieer?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Bevestig je e-mailadres — BouwSchakel",
    text: `Welkom bij BouwSchakel. Bevestig je e-mailadres via: ${url}`,
  });
}

export async function authenticate(input: {
  email: string;
  password: string;
}): Promise<User> {
  const user = await db.user.findUnique({ where: { email: input.email } });
  // Verifieer altijd tegen een hash om timing-verschillen te beperken.
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinva";
  const ok = await verifyPassword(input.password, hash);

  if (!user || !user.passwordHash || !ok) throw new OngeldigeInlogError();
  if (user.status !== "ACTIEF") throw new OngeldigeInlogError();

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  return user;
}
