import { NextResponse } from "next/server";
import { isPaymentConfigured } from "@/server/payments/provider";

/**
 * Webhook-endpoint voor de betaalprovider (bijv. Mollie/Stripe). Stub: er is
 * nog geen provider gekoppeld. Wanneer een provider wordt ingeplugd, verifieer
 * hier de signature en werk de Payment/Invoice-status bij.
 * Zie docs/ARCHITECTURE.md §7.
 */
export async function POST(): Promise<NextResponse> {
  if (!isPaymentConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "payment_provider_not_configured" },
      { status: 501 },
    );
  }
  // TODO (bij provider-integratie): signature verifiëren en status bijwerken.
  return NextResponse.json({ ok: true });
}
