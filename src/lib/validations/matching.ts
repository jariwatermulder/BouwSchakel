import { z } from "zod";

const gewicht = z.coerce.number().int().min(0).max(100);

export const matchingSettingSchema = z.object({
  gewichtVakgebied: gewicht,
  gewichtBeschikbaarheid: gewicht,
  gewichtSpecialisatie: gewicht,
  gewichtLocatie: gewicht,
  gewichtTarief: gewicht,
  gewichtErvaring: gewicht,
  gewichtCertificaten: gewicht,
  gewichtBetrouwbaarheid: gewicht,
  minMatchScore: z.coerce.number().int().min(0).max(100),
  maxAfstandKm: z.coerce.number().int().min(1).max(1000),
});

export type MatchingSettingInput = z.infer<typeof matchingSettingSchema>;
