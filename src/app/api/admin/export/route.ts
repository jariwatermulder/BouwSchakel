import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hasAdminAtLeast } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { parsePeriode } from "@/server/analytics/periode";
import { exportRows, naarCsv, type ExportDataset } from "@/server/analytics/queries";

export const dynamic = "force-dynamic";

const DATASETS: ExportDataset[] = ["zzp-registraties", "bedrijfsregistraties", "events", "contactaanvragen"];

/** CSV-export van een dataset voor de gekozen periode (alleen admins; wordt gelogd in de auditlog). */
export async function GET(req: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user || !hasAdminAtLeast(user, "ADMIN")) {
    return NextResponse.json({ error: "Geen toegang" }, { status: user ? 403 : 401 });
  }
  const sp = new URL(req.url).searchParams;
  const dataset = sp.get("dataset") as ExportDataset | null;
  if (!dataset || !DATASETS.includes(dataset)) {
    return NextResponse.json({ error: "Onbekende dataset" }, { status: 400 });
  }
  const periode = parsePeriode({ p: sp.get("p") ?? undefined, van: sp.get("van") ?? undefined, tot: sp.get("tot") ?? undefined });
  const rows = await exportRows(dataset, periode);

  await db.auditLog.create({
    data: { actorUserId: user.id, actie: "analytics_export", subjectType: "AnalyticsExport", meta: { dataset, periode: periode.query, rijen: rows.length } },
  });

  const bestandsnaam = `zzp-schakel-${dataset}-${periode.query.replace(/[^a-z0-9-]/gi, "_")}.csv`;
  return new Response(`﻿${naarCsv(rows)}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${bestandsnaam}"`,
      "Cache-Control": "no-store",
    },
  });
}
