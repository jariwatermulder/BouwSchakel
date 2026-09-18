"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  emailSchema,
  loginSchema,
  passwordSchema,
  registerSchema,
} from "@/lib/validations/auth";
import {
  authenticate,
  EmailInGebruikError,
  OngeldigeInlogError,
  OngeldigeResetLinkError,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "@/server/auth/service";
import { createSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/ratelimit";
import { safeNextPath, withNext } from "@/lib/auth/next";
import { db } from "@/lib/db";

/** Versie van de voorwaarden/privacyverklaring waar de gebruiker mee instemt. */
const VOORWAARDEN_VERSIE = "2026-09";

export interface AuthFormState {
  error?: string;
}

async function sessionMeta() {
  const h = await headers();
  return {
    userAgent: h.get("user-agent"),
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  };
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Ongeldige invoer.";
    return { error: first };
  }
  // Uitdrukkelijke instemming met de voorwaarden en kennisname van de
  // privacyverklaring is verplicht en wordt vastgelegd in de auditlog.
  if (formData.get("akkoord") !== "on") {
    return {
      error:
        "Ga akkoord met de algemene voorwaarden en de privacyverklaring om een account aan te maken.",
    };
  }

  const limit = rateLimit(`register:${parsed.data.email}`, 5, 60 * 60 * 1000);
  if (!limit.success) {
    return { error: "Te veel pogingen. Probeer het later opnieuw." };
  }

  try {
    const user = await registerUser(parsed.data);
    const meta = await sessionMeta();
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        actie: "VOORWAARDEN_GEACCEPTEERD",
        subjectType: "User",
        subjectId: user.id,
        ip: meta.ip,
        meta: { versie: VOORWAARDEN_VERSIE, userAgent: meta.userAgent },
      },
    });
    await createSession(user.id, meta);
  } catch (err) {
    if (err instanceof EmailInGebruikError) return { error: err.message };
    throw err;
  }
  // Direct door naar het opbouwen van profiel/bedrijf; de gekozen
  // vervolgbestemming (bijv. een zzp-profiel om contact mee op te nemen)
  // reizen we mee zodat de gebruiker daar terugkomt.
  const next = safeNextPath(formData.get("next"));
  redirect(
    withNext(
      parsed.data.role === "ZZP"
        ? "/zzpers/registreren"
        : "/bedrijven/registreren",
      next,
    ),
  );
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Vul een geldig e-mailadres en wachtwoord in." };
  }

  const limit = rateLimit(`login:${parsed.data.email}`, 10, 15 * 60 * 1000);
  if (!limit.success) {
    return { error: "Te veel inlogpogingen. Probeer het later opnieuw." };
  }

  let role: "ZZP" | "COMPANY" | "ADMIN" = "ZZP";
  try {
    const user = await authenticate(parsed.data);
    role = user.role;
    await createSession(user.id, await sessionMeta());
  } catch (err) {
    if (err instanceof OngeldigeInlogError) return { error: err.message };
    throw err;
  }
  const next = safeNextPath(formData.get("next"));
  if (next) redirect(next);
  redirect(
    role === "ZZP"
      ? "/zzpers/dashboard"
      : role === "COMPANY"
        ? "/bedrijven/dashboard"
        : "/admin",
  );
}

export interface ForgotFormState {
  error?: string;
  ok?: boolean;
}

/** Vraagt een reset-link aan. Antwoordt altijd hetzelfde (geen enumeratie). */
export async function forgotPasswordAction(
  _prev: ForgotFormState,
  formData: FormData,
): Promise<ForgotFormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Vul een geldig e-mailadres in." };

  const meta = await sessionMeta();
  const perEmail = rateLimit(`reset:${parsed.data}`, 3, 60 * 60 * 1000);
  const perIp = rateLimit(`reset-ip:${meta.ip ?? "onbekend"}`, 10, 60 * 60 * 1000);
  if (!perEmail.success || !perIp.success) {
    return { error: "Te veel aanvragen. Probeer het later opnieuw." };
  }

  try {
    await requestPasswordReset(parsed.data);
  } catch (err) {
    // E-mail versturen is best-effort; de gebruiker krijgt dezelfde melding.
    console.warn("[auth] Reset-mail niet verzonden:", err instanceof Error ? err.message : err);
  }
  return { ok: true };
}

export interface ResetFormState {
  error?: string;
}

/** Stelt een nieuw wachtwoord in op basis van een reset-token en logt direct in. */
export async function resetPasswordAction(
  _prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const token = formData.get("token");
  const password = formData.get("password");
  const herhaal = formData.get("password2");
  if (typeof token !== "string" || !token) {
    return { error: "Deze link is ongeldig. Vraag een nieuwe aan." };
  }
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldig wachtwoord." };
  }
  if (password !== herhaal) {
    return { error: "De wachtwoorden komen niet overeen." };
  }

  const meta = await sessionMeta();
  if (!rateLimit(`reset-token:${meta.ip ?? "onbekend"}`, 10, 15 * 60 * 1000).success) {
    return { error: "Te veel pogingen. Probeer het later opnieuw." };
  }

  let role: "ZZP" | "COMPANY" | "ADMIN" = "ZZP";
  try {
    const user = await resetPassword({ token, password: parsed.data });
    role = user.role;
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        actie: "WACHTWOORD_HERSTELD",
        subjectType: "User",
        subjectId: user.id,
        ip: meta.ip,
      },
    });
    await createSession(user.id, meta);
  } catch (err) {
    if (err instanceof OngeldigeResetLinkError) return { error: err.message };
    throw err;
  }
  redirect(
    role === "ZZP"
      ? "/zzpers/dashboard"
      : role === "COMPANY"
        ? "/bedrijven/dashboard"
        : "/admin",
  );
}
