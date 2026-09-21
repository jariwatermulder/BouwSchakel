import { z } from "zod";
import { kvkNummerSchema } from "@/lib/validations/kvk";

const optioneel = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((v) => (v ? v : undefined));

export const companySchema = z.object({
  naam: z.string().trim().min(1, "Bedrijfsnaam is verplicht").max(160),
  // Verplicht: zonder KvK-nummer kan een opdrachtgever niet verder.
  kvkNummer: kvkNummerSchema,
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
