import { z } from "zod";

/**
 * Server-side environment validatie.
 *
 * Bewust lui (lazy): we valideren pas bij het eerste gebruik, niet bij import.
 * Zo blijft `next build` groen zonder dat alle secrets aanwezig hoeven te zijn,
 * terwijl runtime-code wél een duidelijke fout krijgt bij ontbrekende config.
 * Secrets komen uitsluitend uit environment variables (zie .env.example).
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET moet minimaal 32 tekens zijn"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  // E-mail (optioneel): zonder deze waarden worden mails niet verstuurd,
  // maar blijft de app gewoon werken.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Log server-side; nooit naar de client lekken.
    console.error(
      "Ongeldige server-omgevingsvariabelen:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Server is verkeerd geconfigureerd (environment).");
  }
  cached = parsed.data;
  return cached;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
