import type { Metadata } from "next";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { activiteit } from "@/server/analytics/queries";
import { LiveFeed } from "@/components/admin/live-feed";
import { PaginaKop, Paneel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Live activiteit", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminActiviteitPage() {
  await requireCurrentAdmin("SUPPORT");
  const feed = await activiteit(undefined, 60);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <PaginaKop
        titel="Live activiteit"
        intro="Registraties, zoekopdrachten, profielweergaven en contact, zoals ze binnenkomen. Pseudoniem: geen namen of e-mailadressen."
        bijgewerkt={new Date().toISOString()}
        statusLabel="Elke 10 seconden bijgewerkt"
      />
      <Paneel className="mt-6">
        <LiveFeed initieel={feed} />
      </Paneel>
    </div>
  );
}
