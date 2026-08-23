import { describe, expect, it } from "vitest";
import { berekenFee, type FeeConfig } from "@/server/payments/fees";

const perUur: FeeConfig = {
  feeModel: "PER_UUR",
  succesfeePerUurCents: 750,
  vasteBemiddelingsfeeCents: 0,
  btwPercentage: 21,
};

describe("fee-berekening", () => {
  it("berekent succesfee per uur inclusief btw", () => {
    const r = berekenFee(perUur, 40);
    expect(r.subtotaalCents).toBe(30000); // 40 × €7,50
    expect(r.btwCents).toBe(6300); // 21%
    expect(r.bedragCents).toBe(36300);
  });

  it("geeft nul zonder gewerkte uren bij per-uur", () => {
    expect(berekenFee(perUur, null).subtotaalCents).toBe(0);
  });

  it("gebruikt de vaste fee bij het vaste model", () => {
    const vast: FeeConfig = {
      feeModel: "VAST",
      succesfeePerUurCents: 750,
      vasteBemiddelingsfeeCents: 15000,
      btwPercentage: 21,
    };
    const r = berekenFee(vast, 40);
    expect(r.subtotaalCents).toBe(15000);
    expect(r.bedragCents).toBe(18150);
  });

  it("rondt de btw correct af", () => {
    const r = berekenFee({ ...perUur, succesfeePerUurCents: 333 }, 1);
    expect(r.subtotaalCents).toBe(333);
    expect(r.btwCents).toBe(70); // 69.93 → 70
  });
});
