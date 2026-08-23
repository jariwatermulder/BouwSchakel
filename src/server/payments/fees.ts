/**
 * Pure fee-berekening. Alle bedragen in centen. Configureerbaar via
 * PricingSetting (nooit hardcoded). Zie docs/PRODUCT_SPEC.md §19.
 */
export type FeeModel = "PER_UUR" | "VAST";

export interface FeeConfig {
  feeModel: FeeModel;
  succesfeePerUurCents: number;
  vasteBemiddelingsfeeCents: number;
  btwPercentage: number;
}

export interface FeeResultaat {
  subtotaalCents: number;
  btwCents: number;
  bedragCents: number; // incl. btw
}

/** Berekent de bemiddelingsfee (subtotaal) op basis van het model. */
export function berekenSubtotaal(
  config: FeeConfig,
  gewerkteUren: number | null,
): number {
  if (config.feeModel === "PER_UUR") {
    const uren = gewerkteUren && gewerkteUren > 0 ? gewerkteUren : 0;
    return uren * config.succesfeePerUurCents;
  }
  return config.vasteBemiddelingsfeeCents;
}

export function berekenFee(
  config: FeeConfig,
  gewerkteUren: number | null,
): FeeResultaat {
  const subtotaalCents = berekenSubtotaal(config, gewerkteUren);
  const btwCents = Math.round((subtotaalCents * config.btwPercentage) / 100);
  return {
    subtotaalCents,
    btwCents,
    bedragCents: subtotaalCents + btwCents,
  };
}
