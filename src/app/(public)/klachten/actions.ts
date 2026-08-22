"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";

const schema = z.object({
  naam: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  onderwerp: z.string().trim().min(1).max(160),
  bericht: z.string().trim().min(5).max(4000),
});

export interface KlachtState {
  error?: string;
  ok?: boolean;
}

export async function dienKlachtIn(
  _prev: KlachtState,
  formData: FormData,
): Promise<KlachtState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "onbekend";
  if (!rateLimit(`klacht:${ip}`, 5, 60 * 60 * 1000).success) {
    return { error: "Te veel inzendingen. Probeer het later opnieuw." };
  }

  const parsed = schema.safeParse({
    naam: formData.get("naam"),
    email: formData.get("email"),
    onderwerp: formData.get("onderwerp"),
    bericht: formData.get("bericht"),
  });
  if (!parsed.success) {
    return { error: "Controleer de ingevulde velden." };
  }

  await db.complaint.create({ data: parsed.data });
  return { ok: true };
}
