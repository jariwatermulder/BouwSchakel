import type { Metadata } from "next";
import { headers } from "next/headers";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/ratelimit";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  OngeldigeVerificatieLinkError,
  verifyEmail,
} from "@/server/auth/service";

export const metadata: Metadata = {
  title: "E-mailadres bevestigen",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

async function bevestig(token: string): Promise<{ ok: boolean; fout?: string }> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "onbekend";
  if (!rateLimit(`verify-token:${ip}`, 20, 15 * 60 * 1000).success) {
    return { ok: false, fout: "Te veel pogingen. Probeer het later opnieuw." };
  }
  try {
    const user = await verifyEmail(token);
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        actie: "EMAIL_BEVESTIGD",
        subjectType: "User",
        subjectId: user.id,
        ip: ip === "onbekend" ? null : ip,
      },
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof OngeldigeVerificatieLinkError) {
      return { ok: false, fout: err.message };
    }
    throw err;
  }
}

export default async function VerifieerPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const resultaat = token
    ? await bevestig(token)
    : { ok: false, fout: "Deze bevestigingslink is onvolledig." };
  const user = await getCurrentUser();
  const verder = user
    ? user.role === "COMPANY"
      ? "/bedrijven/dashboard"
      : user.role === "ADMIN"
        ? "/admin"
        : "/zzpers/dashboard"
    : "/inloggen";

  return (
    <Card>
      {resultaat.ok ? (
        <>
          <CardTitle as="h1">E-mailadres bevestigd</CardTitle>
          <CardDescription className="mt-2">
            Bedankt, je e-mailadres is bevestigd. Je kunt nu verder met ZZP
            Schakel.
          </CardDescription>
        </>
      ) : (
        <>
          <CardTitle as="h1">Bevestigen niet gelukt</CardTitle>
          <CardDescription className="mt-2">
            {resultaat.fout} Log in en vraag bij Instellingen een nieuwe
            bevestigingsmail aan.
          </CardDescription>
        </>
      )}
      <div className="mt-6">
        <ButtonLink href={verder} variant="brand">
          {user ? "Naar mijn omgeving" : "Inloggen"}
        </ButtonLink>
      </div>
    </Card>
  );
}
