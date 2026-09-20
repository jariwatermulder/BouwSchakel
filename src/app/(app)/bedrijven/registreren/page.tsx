import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { bedrijfCompleet, getOrCreateCompanyForUser } from "@/server/company/service";
import { CompanyForm } from "./company-form";

export const metadata: Metadata = {
  title: "Bedrijfsprofiel",
  robots: { index: false },
};

export default async function BedrijfRegistrerenPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await requireCurrentUser();
  const company = await getOrCreateCompanyForUser(user.id);
  const onboarding = !bedrijfCompleet(company);

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">
        {onboarding ? "Nog één stap: je bedrijfsnaam en KvK-nummer" : "Bedrijfsprofiel"}
      </h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Bedrijfsnaam en KvK-nummer zijn verplicht om verder te gaan. De rest
        kun je later aanvullen.
      </p>
      <Card className="mt-6">
        <CompanyForm company={company} onboarding={onboarding} next={next ?? null} />
      </Card>
    </Container>
  );
}
