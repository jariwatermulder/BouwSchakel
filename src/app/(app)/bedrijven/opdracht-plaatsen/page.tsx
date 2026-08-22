import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import {
  listCertifications,
  listSkills,
  listSpecializations,
} from "@/server/catalog";
import { JobForm } from "./job-form";

export const metadata: Metadata = {
  title: "Opdracht plaatsen",
  robots: { index: false },
};

export default async function OpdrachtPlaatsenPage() {
  const [skills, specializations, certifications] = await Promise.all([
    listSkills(),
    listSpecializations(),
    listCertifications(),
  ]);

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Opdracht plaatsen</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        In een paar minuten geregeld. Alleen vakgebied, locatie, startdatum en
        werkzaamheden zijn verplicht.
      </p>
      <Card className="mt-6">
        <JobForm
          skills={skills}
          specializations={specializations}
          certifications={certifications}
        />
      </Card>
    </Container>
  );
}
