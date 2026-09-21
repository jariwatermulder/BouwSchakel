"use server";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { rateLimit } from "@/lib/ratelimit";
import { trackEvent } from "@/lib/analytics/track";
import type { KvkControle } from "@/lib/kvk";
import { controleerKvk } from "@/server/kvk/service";

/**
 * Live KvK-controle vanuit een formulier ("Controleer"-knop naast het
 * KvK-veld). Alleen voor ingelogde gebruikers en beperkt per gebruiker, zodat
 * ons KvK-tegoed niet kan worden leeggetrokken.
 */
export async function controleerKvkAction(input: string): Promise<KvkControle> {
  const user = await requireCurrentUser();
  const limiet = rateLimit(`kvk:${user.id}`, 30, 10 * 60 * 1000);
  if (!limiet.success) {
    return { status: "niet_beschikbaar", kvkNummer: "" };
  }
  const resultaat = await controleerKvk(input);
  if (resultaat.status !== "ongeldig") {
    await trackEvent("kvk_checked", {
      userId: user.id,
      userRole: user.role,
      metadata: { status: resultaat.status, bron: "formulier", test: resultaat.test ?? false },
    });
  }
  return resultaat;
}
