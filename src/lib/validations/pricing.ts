import { z } from "zod";

export const pricingSchema = z.object({
  feeModel: z.enum(["PER_UUR", "VAST"]),
  succesfeePerUurEuro: z.coerce.number().min(0).max(1000),
  vasteBemiddelingsfeeEuro: z.coerce.number().min(0).max(100000),
  proMaandEuro: z.coerce.number().min(0).max(100000),
  btwPercentage: z.coerce.number().int().min(0).max(100),
});

export type PricingFormInput = z.infer<typeof pricingSchema>;

/** Zet euro-invoer om naar de centen-structuur voor opslag. */
export function pricingToCents(input: PricingFormInput) {
  return {
    feeModel: input.feeModel,
    succesfeePerUurCents: Math.round(input.succesfeePerUurEuro * 100),
    vasteBemiddelingsfeeCents: Math.round(input.vasteBemiddelingsfeeEuro * 100),
    proMaandCents: Math.round(input.proMaandEuro * 100),
    btwPercentage: input.btwPercentage,
  };
}
