import "server-only";

/**
 * PaymentProvider-interface. In de MVP is er nog geen provider gekoppeld;
 * facturen worden aangemaakt maar niet automatisch geïnd. Later pluggen we
 * hier Mollie/Stripe in zonder de aanroepende code te wijzigen.
 * Zie docs/ARCHITECTURE.md §7.
 */
export interface ChargeInput {
  bedragCents: number;
  omschrijving: string;
  referentie: string;
}

export interface ChargeResult {
  providerRef: string;
  checkoutUrl?: string;
}

export interface PaymentProvider {
  charge(input: ChargeInput): Promise<ChargeResult>;
  refund(providerRef: string, bedragCents: number): Promise<void>;
  verifyWebhook(payload: unknown, signature: string | null): Promise<boolean>;
}

export class PaymentNotConfiguredError extends Error {
  constructor() {
    super("Er is nog geen betaalprovider geconfigureerd.");
    this.name = "PaymentNotConfiguredError";
  }
}

let provider: PaymentProvider | null = null;

export function setPaymentProvider(p: PaymentProvider): void {
  provider = p;
}

export function getPaymentProvider(): PaymentProvider {
  if (!provider) throw new PaymentNotConfiguredError();
  return provider;
}

export function isPaymentConfigured(): boolean {
  return provider !== null;
}
