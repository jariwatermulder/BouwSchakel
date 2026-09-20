import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hasAdminAtLeast } from "@/lib/auth/rbac";
import { activiteit } from "@/server/analytics/queries";

export const dynamic = "force-dynamic";

/** Nieuwe activiteit sinds een tijdstip, voor de live feed (alleen admins). */
export async function GET(req: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user || !hasAdminAtLeast(user, "SUPPORT")) {
    return NextResponse.json({ error: "Geen toegang" }, { status: user ? 403 : 401 });
  }
  const sindsRaw = new URL(req.url).searchParams.get("sinds");
  const sinds = sindsRaw ? new Date(sindsRaw) : undefined;
  const items = await activiteit(sinds && !Number.isNaN(sinds.getTime()) ? sinds : undefined, 40);
  return NextResponse.json(items, { headers: { "Cache-Control": "no-store" } });
}
