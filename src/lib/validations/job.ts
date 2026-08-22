import { z } from "zod";

/** Validatie voor de 'opdracht plaatsen'-wizard. */
export const jobSchema = z.object({
  skillId: z.string().uuid("Kies een vakgebied"),
  specializationId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  titel: z.string().trim().max(120).optional(),
  locatiePlaats: z.string().trim().min(1, "Locatie is verplicht").max(120),
  locatieAdres: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  startdatum: z.coerce.date({ message: "Kies een startdatum" }),
  einddatum: z.coerce.date().optional(),
  duurDagen: z.coerce.number().int().min(1).max(3650).optional(),
  aantalPersonen: z.coerce.number().int().min(1).max(100).default(1),
  uurtariefEuro: z.coerce.number().min(1).max(500).optional(),
  omschrijving: z
    .string()
    .trim()
    .min(10, "Beschrijf de werkzaamheden (min. 10 tekens)")
    .max(4000),
  eigenGereedschapGewenst: z.boolean().default(false),
  contactpersoon: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  vereistenTekst: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  certificationIds: z.array(z.string().uuid()).default([]),
  directPubliceren: z.boolean().default(true),
});

export type JobInput = z.infer<typeof jobSchema>;
