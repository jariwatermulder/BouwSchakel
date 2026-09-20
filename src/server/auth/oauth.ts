import "server-only";
import type { User, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { trackEvent } from "@/lib/analytics/track";
import type { OAuthIdentiteit } from "@/lib/auth/oauth-config";
import { VOORWAARDEN_VERSIE } from "@/lib/voorwaarden";

export class GeenAccountError extends Error {
  constructor() {
    super("Geen account gevonden voor dit e-mailadres.");
    this.name = "GeenAccountError";
  }
}

export class EmailNietBevestigdError extends Error {
  constructor() {
    super("Het e-mailadres bij dit account is niet bevestigd door de provider.");
    this.name = "EmailNietBevestigdError";
  }
}

export class AccountGeblokkeerdError extends Error {
  constructor() {
    super("Dit account is geblokkeerd.");
    this.name = "AccountGeblokkeerdError";
  }
}

/**
 * Logt in of registreert op basis van een geverifieerde externe identiteit.
 *
 * 1. Bekende koppeling (provider + sub) → inloggen.
 * 2. Bestaand account met hetzelfde, door de provider bevestigde e-mailadres
 *    → koppelen en inloggen.
 * 3. Anders: nieuw account, maar alleen als er een rol is gekozen en akkoord
 *    is gegeven met de voorwaarden (vanaf de registratiepagina). Vanaf de
 *    inlogpagina geven we GeenAccountError, zodat de bezoeker bewust
 *    registreert.
 */
export async function loginOfRegistreerMetOAuth(input: {
  identiteit: OAuthIdentiteit;
  rol?: UserRole;
  akkoord: boolean;
  ip: string | null;
  userAgent: string | null;
}): Promise<{ user: User; nieuw: boolean }> {
  const { identiteit } = input;

  const koppeling = await db.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: identiteit.provider, providerAccountId: identiteit.sub } },
    include: { user: true },
  });
  if (koppeling) {
    if (koppeling.user.status !== "ACTIEF" || koppeling.user.deletedAt) throw new AccountGeblokkeerdError();
    await trackEvent("login", { userId: koppeling.user.id, userRole: koppeling.user.role, page: "/inloggen", metadata: { methode: identiteit.provider } });
    return { user: koppeling.user, nieuw: false };
  }

  if (!identiteit.emailVerified) throw new EmailNietBevestigdError();

  const bestaand = await db.user.findUnique({ where: { email: identiteit.email } });
  if (bestaand) {
    if (bestaand.status !== "ACTIEF" || bestaand.deletedAt) throw new AccountGeblokkeerdError();
    await db.$transaction([
      db.oAuthAccount.create({
        data: { userId: bestaand.id, provider: identiteit.provider, providerAccountId: identiteit.sub, email: identiteit.email },
      }),
      db.user.update({
        where: { id: bestaand.id },
        data: { emailVerifiedAt: bestaand.emailVerifiedAt ?? new Date() },
      }),
      db.auditLog.create({
        data: { actorUserId: bestaand.id, actie: "OAUTH_GEKOPPELD", subjectType: "User", subjectId: bestaand.id, ip: input.ip, meta: { provider: identiteit.provider } },
      }),
    ]);
    await trackEvent("login", { userId: bestaand.id, userRole: bestaand.role, page: "/inloggen", metadata: { methode: identiteit.provider, gekoppeld: true } });
    return { user: bestaand, nieuw: false };
  }

  if (!input.rol || !input.akkoord) throw new GeenAccountError();

  const user = await db.user.create({
    data: {
      email: identiteit.email,
      passwordHash: null,
      role: input.rol,
      emailVerifiedAt: new Date(),
      oauthAccounts: {
        create: { provider: identiteit.provider, providerAccountId: identiteit.sub, email: identiteit.email },
      },
    },
  });
  await db.auditLog.create({
    data: {
      actorUserId: user.id,
      actie: "VOORWAARDEN_GEACCEPTEERD",
      subjectType: "User",
      subjectId: user.id,
      ip: input.ip,
      meta: { versie: VOORWAARDEN_VERSIE, userAgent: input.userAgent, methode: identiteit.provider },
    },
  });
  await trackEvent("user_registered", { userId: user.id, userRole: user.role, page: "/registreren", metadata: { rol: user.role, methode: identiteit.provider } });
  await trackEvent(user.role === "ZZP" ? "zzper_registered" : "company_registered", { userId: user.id, userRole: user.role, page: "/registreren", metadata: { methode: identiteit.provider } });
  return { user, nieuw: true };
}
