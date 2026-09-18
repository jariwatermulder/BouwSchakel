import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { getStorageProvider } from "@/lib/storage";
import { uploadDocument, verwijderDocument } from "./actions";

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

const UPLOAD_MELDING: Record<string, { tekst: string; fout: boolean }> = {
  ok: { tekst: "Document geüpload. Het verificatieteam bekijkt het zo snel mogelijk.", fout: false },
  leeg: { tekst: "Kies eerst een bestand.", fout: true },
  type: { tekst: "Alleen PDF, JPG of PNG is toegestaan.", fout: true },
  groot: { tekst: "Het bestand mag maximaal 10 MB zijn.", fout: true },
  fout: { tekst: "Controleer het type en het bestand en probeer opnieuw.", fout: true },
  limiet: { tekst: "Je hebt veel bestanden geüpload. Probeer het later opnieuw.", fout: true },
  max: { tekst: "Je hebt het maximum aantal documenten bereikt. Verwijder eerst een document.", fout: true },
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

export default async function DocumentenPage({
  searchParams,
}: {
  searchParams: Promise<{ upload?: string }>;
}) {
  const user = await requireCurrentUser();
  const { upload } = await searchParams;
  const melding = upload ? UPLOAD_MELDING[upload] : undefined;
  const storage = await getStorageProvider();
  const documentenRuw = await db.document.findMany({
    where: { ownerUserId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const documenten = await Promise.all(
    documentenRuw.map(async (d) => ({ ...d, url: await storage.signedUrl(d.opslagKey, 10 * 60) })),
  );

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Documenten</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Upload je certificaten en verzekeringsbewijzen voor verificatie. Je
        documenten zijn alleen zichtbaar voor jou en het verificatieteam — nooit
        op je publieke profiel.
      </p>

      {melding ? (
        <p
          role={melding.fout ? "alert" : "status"}
          className={`mt-4 rounded-lg border p-3 text-sm ${
            melding.fout
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-emerald-300 bg-emerald-50 text-emerald-800"
          }`}
        >
          {melding.tekst}
        </p>
      ) : null}

      <Card className="mt-6">
        <CardTitle>Document uploaden</CardTitle>
        <CardDescription className="mt-1">
          PDF, JPG of PNG, maximaal 10 MB.
        </CardDescription>
        <form action={uploadDocument} className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="type">Soort document</Label>
            <select
              id="type"
              name="type"
              required
              defaultValue="CERTIFICAAT"
              className="border-border bg-surface h-11 w-full rounded-lg border px-3 text-sm"
            >
              {Object.entries(typeLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="bestand">Bestand</Label>
            <input
              id="bestand"
              name="bestand"
              type="file"
              required
              accept="application/pdf,image/jpeg,image/png"
              className="border-border bg-surface file:bg-brand-50 file:text-brand-700 block h-11 w-full rounded-lg border p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1 file:font-medium"
            />
          </div>
          <Button type="submit" variant="brand">
            Uploaden
          </Button>
        </form>
      </Card>

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
                className="border-border flex flex-wrap items-center justify-between gap-3 border-b py-2 text-sm last:border-0"
              >
                <span className="min-w-0">
                  <span className="font-medium">{typeLabel[d.type]}</span> —{" "}
                  <a href={d.url} className="text-brand-600 hover:underline" target="_blank" rel="noreferrer">
                    {d.bestandsnaam}
                  </a>
                  <span className="text-foreground-muted"> · {datum(d.createdAt)}</span>
                </span>
                <span className="flex items-center gap-3">
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
                  <form action={verwijderDocument}>
                    <input type="hidden" name="id" value={d.id} />
                    <button type="submit" className="text-sm text-red-600 hover:underline">
                      Verwijderen
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
}
