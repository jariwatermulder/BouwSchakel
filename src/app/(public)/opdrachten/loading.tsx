import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";

/** Skeleton-weergave terwijl de opdrachten worden opgehaald (geen layout shift). */
export default function LoadingOpdrachten() {
  return (
    <>
      <PageIntro
        title="Openstaande opdrachten"
        lead="Actuele opdrachten in elke sector. Reageer als zzp’er of plaats zelf een opdracht."
      />
      <Container className="py-12 md:py-16">
        <ul className="grid gap-4 sm:grid-cols-2" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <Card className="h-full">
                <div className="flex gap-2">
                  <div className="bg-surface-muted h-6 w-24 animate-pulse rounded-full motion-reduce:animate-none" />
                  <div className="bg-surface-muted h-6 w-20 animate-pulse rounded-full motion-reduce:animate-none" />
                </div>
                <div className="bg-surface-muted mt-4 h-5 w-3/4 animate-pulse rounded motion-reduce:animate-none" />
                <div className="bg-surface-muted mt-3 h-4 w-full animate-pulse rounded motion-reduce:animate-none" />
                <div className="bg-surface-muted mt-2 h-4 w-1/2 animate-pulse rounded motion-reduce:animate-none" />
                <div className="bg-surface-muted mt-5 h-4 w-28 animate-pulse rounded motion-reduce:animate-none" />
              </Card>
            </li>
          ))}
        </ul>
        <span className="sr-only">Opdrachten worden geladen…</span>
      </Container>
    </>
  );
}
