import { z } from "zod";

/**
 * Gedeelde Zod-schemas voor authenticatie. Deze worden zowel client-side
 * (React Hook Form) als server-side gebruikt, zodat validatie één bron van
 * waarheid heeft. Zie docs/ARCHITECTURE.md §4 en docs/SECURITY.md §3.
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "E-mailadres is verplicht")
  .email("Vul een geldig e-mailadres in")
  .max(254)
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(10, "Wachtwoord moet minimaal 10 tekens zijn")
  .max(128, "Wachtwoord mag maximaal 128 tekens zijn");

export const userRoleSchema = z.enum(["ZZP", "COMPANY"]);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Wachtwoord is verplicht"),
});

export const magicLinkRequestSchema = z.object({
  email: emailSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MagicLinkRequestInput = z.infer<typeof magicLinkRequestSchema>;
