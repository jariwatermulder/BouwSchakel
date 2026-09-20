import "server-only";
import { trackEvent } from "@/lib/analytics/track";
import type { User, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateToken, hashToken } from "@/lib/auth/tokens";
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
  // Best-effort: het versturen van de verificatiemail mag registratie nooit
  // blokkeren. Zolang er geen e-mailprovider is geconfigureerd, wordt de mail
  // niet verzonden, maar het account (status ACTIEF) is direct bruikbaar.
  try {
    await sendEmail({
      to: user.email,
      subject: "Bevestig je e-mailadres — ZZP Schakel",
      text: `Welkom bij ZZP Schakel. Bevestig je e-mailadres via: ${url}`,
    });
  } catch (err) {
    console.warn(
      `[auth] Verificatiemail niet verzonden voor ${user.email}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

export class OngeldigeVerificatieLinkError extends Error {
  constructor() {
    super("Deze bevestigingslink is ongeldig of verlopen.");
    this.name = "OngeldigeVerificatieLinkError";
  }
}

/**
 * Bevestigt een e-mailadres via het token uit de verificatiemail. Een gebruikt
 * of verlopen token geeft een fout; een al bevestigd adres blijft bevestigd.
 */
export async function verifyEmail(token: string): Promise<User> {
  const record = await db.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (
    !record ||
    record.type !== "EMAIL_VERIFICATIE" ||
    record.usedAt ||
    record.expiresAt < new Date() ||
    record.user.status !== "ACTIEF"
  ) {
    throw new OngeldigeVerificatieLinkError();
  }

  const [user] = await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: record.user.emailVerifiedAt ?? new Date() },
    }),
    db.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
  await trackEvent("email_verified", { userId: user.id, userRole: user.role, page: "/verifieer" });
  return user;
}

/**
 * Stuurt (opnieuw) een verificatiemail voor een nog niet bevestigd adres.
 * Oude, ongebruikte tokens worden ongeldig gemaakt.
 */
export async function resendEmailVerification(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.emailVerifiedAt || user.status !== "ACTIEF") return;
  await db.verificationToken.deleteMany({
    where: { userId, type: "EMAIL_VERIFICATIE", usedAt: null },
  });
  await createEmailVerification(user);
}

const WACHTWOORD_RESET_TTL_MS = 1000 * 60 * 60; // 1 uur

/**
 * Start een wachtwoord-reset. Geeft bewust nooit prijs of het e-mailadres
 * bestaat (geen account-enumeratie): de aanroeper toont altijd dezelfde
 * bevestiging. Alleen voor actieve accounts met wachtwoord wordt een
 * eenmalig, kort geldig token gemaild.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || user.status !== "ACTIEF") return;

  // Eerdere, ongebruikte reset-tokens ongeldig maken.
  await db.verificationToken.deleteMany({
    where: { userId: user.id, type: "WACHTWOORD_RESET", usedAt: null },
  });

  const { token, tokenHash } = generateToken();
  await db.verificationToken.create({
    data: {
      userId: user.id,
      type: "WACHTWOORD_RESET",
      tokenHash,
      expiresAt: new Date(Date.now() + WACHTWOORD_RESET_TTL_MS),
    },
  });

  const url = `${serverEnv().APP_URL}/wachtwoord-herstellen?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Nieuw wachtwoord instellen — ZZP Schakel",
    text: `Je hebt gevraagd om een nieuw wachtwoord voor ZZP Schakel. Stel het in via deze link (1 uur geldig): ${url}\n\nHeb je dit niet aangevraagd? Dan kun je deze e-mail negeren; je wachtwoord blijft ongewijzigd.`,
    html: [
      "<p>Je hebt gevraagd om een nieuw wachtwoord voor ZZP Schakel.</p>",
      `<p><a href="${url}">Stel je nieuwe wachtwoord in</a> (link is 1 uur geldig).</p>`,
      "<p>Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren; je wachtwoord blijft ongewijzigd.</p>",
    ].join(""),
  });
}

export class OngeldigeResetLinkError extends Error {
  constructor() {
    super("Deze link is ongeldig of verlopen. Vraag een nieuwe aan.");
    this.name = "OngeldigeResetLinkError";
  }
}

/**
 * Rondt een wachtwoord-reset af: controleert het token (ongebruikt, niet
 * verlopen), zet het nieuwe wachtwoord, markeert het token als gebruikt en
 * beëindigt alle bestaande sessies van het account.
 */
export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<User> {
  const record = await db.verificationToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
    include: { user: true },
  });
  if (
    !record ||
    record.type !== "WACHTWOORD_RESET" ||
    record.usedAt ||
    record.expiresAt < new Date() ||
    record.user.status !== "ACTIEF"
  ) {
    throw new OngeldigeResetLinkError();
  }

  const passwordHash = await hashPassword(input.password);
  const [user] = await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      // Wie de reset-mail kan lezen, heeft het adres aantoonbaar in bezit.
      data: { passwordHash, emailVerifiedAt: record.user.emailVerifiedAt ?? new Date() },
    }),
    db.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);
  return user;
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
