import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { exportUserData } from "@/server/account/service";

/** Downloadbare JSON-export van de eigen gegevens (AVG-dataportabiliteit). */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const data = await exportUserData(user.id);
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="zzp-connect-gegevens.json"',
    },
  });
}
