import { z } from "zod";
import { normaliseerKvk } from "@/lib/kvk";

/**
 * Verplicht KvK-nummer: spaties, punten en streepjes worden weggehaald
 * ("12 345 678" → "12345678"); daarna moeten er precies 8 cijfers overblijven.
 */
export const kvkNummerSchema = z.preprocess(
  (v) => (typeof v === "string" ? normaliseerKvk(v) : v),
  z
    .string({ message: "KvK-nummer is verplicht" })
    .min(1, "KvK-nummer is verplicht")
    .regex(/^\d{8}$/u, "KvK-nummer bestaat uit 8 cijfers"),
);
