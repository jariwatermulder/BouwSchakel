"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import {
  authenticate,
  EmailInGebruikError,
  OngeldigeInlogError,
  registerUser,
} from "@/server/auth/service";
import { createSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/ratelimit";

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

  const limit = rateLimit(`register:${parsed.data.email}`, 5, 60 * 60 * 1000);
  if (!limit.success) {
    return { error: "Te veel pogingen. Probeer het later opnieuw." };
  }

  try {
    const user = await registerUser(parsed.data);
    await createSession(user.id, await sessionMeta());
  } catch (err) {
    if (err instanceof EmailInGebruikError) return { error: err.message };
    throw err;
  }
  redirect("/");
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

  try {
    const user = await authenticate(parsed.data);
    await createSession(user.id, await sessionMeta());
  } catch (err) {
    if (err instanceof OngeldigeInlogError) return { error: err.message };
    throw err;
  }
  redirect("/");
}
