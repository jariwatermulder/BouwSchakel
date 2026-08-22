import { z } from "zod";

const optioneel = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((v) => (v ? v : undefined));

export const companySchema = z.object({
  naam: z.string().trim().min(1, "Bedrijfsnaam is verplicht").max(160),
  kvkNummer: z
    .string()
    .trim()
    .regex(/^\d{8}$/u, "KvK-nummer bestaat uit 8 cijfers")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  contactpersoon: optioneel,
  telefoon: optioneel,
  website: z
    .string()
    .trim()
    .url("Vul een geldige URL in (bijv. https://...)")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  regio: optioneel,
  typeWerkzaamheden: optioneel,
  omschrijving: z.string().trim().max(2000).optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;
