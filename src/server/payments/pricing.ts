import "server-only";
import type { PricingSetting } from "@prisma/client";
import { db } from "@/lib/db";

export interface PricingConfig {
  feeModel: "PER_UUR" | "VAST";
  succesfeePerUurCents: number;
  vasteBemiddelingsfeeCents: number;
  proMaandCents: number;
  btwPercentage: number;
}

const DEFAULTS: PricingConfig = {
  feeModel: "PER_UUR",
  succesfeePerUurCents: 750,
  vasteBemiddelingsfeeCents: 0,
  proMaandCents: 19900,
  btwPercentage: 21,
};

function toConfig(row: PricingSetting | null): PricingConfig {
  if (!row) return DEFAULTS;
  return {
    feeModel: row.feeModel,
    succesfeePerUurCents: row.succesfeePerUurCents,
    vasteBemiddelingsfeeCents: row.vasteBemiddelingsfeeCents,
    proMaandCents: row.proMaandCents,
    btwPercentage: row.btwPercentage,
  };
}

export async function getPricing(): Promise<PricingConfig> {
  return toConfig(
    await db.pricingSetting.findUnique({ where: { id: "default" } }),
  );
}

export interface PricingInput {
  feeModel: "PER_UUR" | "VAST";
  succesfeePerUurCents: number;
  vasteBemiddelingsfeeCents: number;
  proMaandCents: number;
  btwPercentage: number;
}

export async function updatePricing(data: PricingInput): Promise<void> {
  await db.pricingSetting.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
}
