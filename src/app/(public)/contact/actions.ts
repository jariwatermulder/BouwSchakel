"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { trackEvent } from "@/lib/analytics/track";
import { sendEmail } from "@/lib/email/send";

const schema = z.object({
  naam: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).toLowerCase(),
  onderwerp: z.string().trim().min(1).max(160),
  bericht: z.string().trim().min(10).max(4000),
  // Honeypot: echte gebruikers laten dit veld leeg.
  website: z.string().max(0).optional().or(z.literal("")),
});

export interface ContactState {
  error?: string;
  ok?: boolean;
}

export async function verstuurContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!rateLimit(`contact:${ip ?? "onbekend"}`, 5, 60 * 60 * 1000).success) {
    return { error: "Te veel berichten. Probeer het later opnieuw." };
  }

  const parsed = schema.safeParse({
    naam: formData.get("naam"),
    email: formData.get("email"),
    onderwerp: formData.get("onderwerp"),
    bericht: formData.get("bericht"),
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) {
    return { error: "Controleer de ingevulde velden (bericht minimaal 10 tekens)." };
  }
  const { website: _honeypot, ...data } = parsed.data;
  void _honeypot;

  const record = await db.contactMessage.create({ data: { ...data, ip } });
  await trackEvent("contact_form_sent", { page: "/contact", metadata: { onderwerp: data.onderwerp.slice(0, 80) } });

  // Best-effort notificatie naar de beheer-inbox; het bericht staat sowieso in
  // de database (Beheer → Contact) en de inzender krijgt altijd dezelfde melding.
  const naar = process.env.CONTACT_EMAIL?.trim();
  if (naar) {
    try {
      await sendEmail({
        to: naar,
        subject: `[Contact] ${data.onderwerp}`,
        text: `Van: ${data.naam} <${data.email}>\nOnderwerp: ${data.onderwerp}\n\n${data.bericht}\n\nBericht #${record.id}`,
      });
    } catch (err) {
      console.warn("[contact] Notificatiemail niet verzonden:", err instanceof Error ? err.message : err);
    }
  }
  return { ok: true };
}
