import { z } from "zod";

/**
 * Zod-schemas voor de ZZP-registratie (per stap) en profielonderdelen.
 * Gedeeld tussen server actions en (waar nuttig) client-validatie.
 */

const optionalTrimmed = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? v : undefined));

export const persoonlijkSchema = z.object({
  voornaam: z.string().trim().min(1, "Voornaam is verplicht").max(80),
  achternaam: z.string().trim().min(1, "Achternaam is verplicht").max(80),
  telefoon: optionalTrimmed,
});

export const bedrijfSchema = z.object({
  bedrijfsnaam: optionalTrimmed,
  kvkNummer: z
    .string()
    .trim()
    .regex(/^\d{8}$/u, "KvK-nummer bestaat uit 8 cijfers")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const vakgebiedSchema = z.object({
  skillIds: z.array(z.string().uuid()).min(1, "Kies minstens één vakgebied"),
});

export const specialisatieSchema = z.object({
  specializationIds: z.array(z.string().uuid()).default([]),
});

export const ervaringSchema = z.object({
  jarenErvaring: z.coerce
    .number()
    .int()
    .min(0, "Kan niet negatief zijn")
    .max(60),
  over: z.string().trim().max(2000).optional(),
});

export const tariefSchema = z.object({
  uurtariefEuro: z.coerce
    .number()
    .min(1, "Vul een geldig uurtarief in")
    .max(500),
});

export const werkgebiedSchema = z.object({
  werkgebiedPlaats: z.string().trim().min(1, "Plaats is verplicht").max(120),
  maxReisafstandKm: z.coerce
    .number()
    .int()
    .min(1, "Minimaal 1 km")
    .max(500, "Maximaal 500 km"),
});

export const materieelSchema = z.object({
  eigenBus: z.boolean().default(false),
  eigenGereedschap: z.boolean().default(false),
  vca: z.boolean().default(false),
});

export const certificatenSchema = z.object({
  certificationIds: z.array(z.string().uuid()).default([]),
});

export const availabilitySchema = z.object({
  van: z.coerce.date(),
  tot: z.coerce.date().optional(),
  type: z.enum(["FULLTIME", "PARTTIME", "INCIDENTEEL"]).default("FULLTIME"),
});

export const portfolioItemSchema = z.object({
  titel: z.string().trim().min(1, "Titel is verplicht").max(120),
  omschrijving: z.string().trim().max(1000).optional(),
});

export type PersoonlijkInput = z.infer<typeof persoonlijkSchema>;
export type WerkgebiedInput = z.infer<typeof werkgebiedSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
