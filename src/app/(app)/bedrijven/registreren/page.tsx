import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getOrCreateCompanyForUser } from "@/server/company/service";
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
  const onboarding = company.naam.trim() === "";

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">
        {onboarding ? "Nog één stap: je bedrijfsnaam" : "Bedrijfsprofiel"}
      </h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Alleen de bedrijfsnaam is verplicht. De rest kun je later aanvullen.
      </p>
      <Card className="mt-6">
        <CompanyForm company={company} onboarding={onboarding} next={next ?? null} />
      </Card>
    </Container>
  );
}
