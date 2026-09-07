import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getFactuur } from "@/server/facturen/service";
import { FactuurWeergave } from "@/components/facturen/factuur-weergave";

export const metadata: Metadata = {
  title: "Factuur",
  robots: { index: false },
};

export default async function BedrijfsfactuurDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ verstuurd?: string; fout?: string }>;
}) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const { verstuurd, fout } = await searchParams;
  const f = await getFactuur(user.id, id);
  if (!f) notFound();

  return (
    <Container className="max-w-3xl py-8 md:py-12">
      <FactuurWeergave
        factuur={f}
        basisPad="/bedrijven/facturen"
        verstuurd={Boolean(verstuurd)}
        fout={fout}
      />
    </Container>
  );
}
