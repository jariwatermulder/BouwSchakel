import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { isStorageConfigured } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Documenten",
  robots: { index: false },
};

const typeLabel: Record<string, string> = {
  IDENTITEIT: "Identiteitsbewijs",
  VCA: "VCA",
  CERTIFICAAT: "Certificaat",
  VERZEKERING: "Verzekering",
  KVK: "KvK-uittreksel",
  OVERIG: "Overig",
};

export default async function DocumentenPage() {
  const user = await requireCurrentUser();
  const documenten = await db.document.findMany({
    where: { ownerUserId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Documenten</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Upload je certificaten en verzekeringsbewijzen voor verificatie. Je
        documenten zijn alleen zichtbaar voor jou en het verificatieteam.
      </p>

      {!isStorageConfigured() ? (
        <Card className="mt-6 border-amber-300 bg-amber-50">
          <CardTitle>Uploaden binnenkort beschikbaar</CardTitle>
          <CardDescription>
            Documentopslag wordt geactiveerd zodra de opslagprovider is
            geconfigureerd. De rest van je profiel kun je nu al invullen.
          </CardDescription>
        </Card>
      ) : null}

      <Card className="mt-6">
        <CardTitle>Mijn documenten</CardTitle>
        {documenten.length === 0 ? (
          <CardDescription className="mt-2">
            Je hebt nog geen documenten geüpload.
          </CardDescription>
        ) : (
          <ul className="mt-3 space-y-2">
            {documenten.map((d) => (
              <li
                key={d.id}
                className="border-border flex items-center justify-between gap-4 border-b py-2 text-sm last:border-0"
              >
                <span>
                  {typeLabel[d.type]} — {d.bestandsnaam}
                </span>
                <Badge
                  variant={
                    d.status === "GEVERIFIEERD"
                      ? "verified"
                      : d.status === "AFGEKEURD"
                        ? "rejected"
                        : "pending"
                  }
                >
                  {d.status.toLowerCase().replace("_", " ")}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
}
