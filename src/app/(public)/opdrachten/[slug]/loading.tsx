import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";

/** Skeleton-weergave terwijl de opdracht wordt opgehaald. */
export default function LoadingOpdracht() {
  return (
    <Container className="max-w-3xl py-12 md:py-16" aria-hidden>
      <div className="flex gap-2">
        <div className="bg-surface-muted h-6 w-24 animate-pulse rounded-full motion-reduce:animate-none" />
        <div className="bg-surface-muted h-6 w-28 animate-pulse rounded-full motion-reduce:animate-none" />
      </div>
      <div className="bg-surface-muted mt-4 h-9 w-2/3 animate-pulse rounded motion-reduce:animate-none" />
      <div className="bg-surface-muted mt-2 h-4 w-1/3 animate-pulse rounded motion-reduce:animate-none" />

      <Card className="mt-8">
        <div className="bg-surface-muted h-5 w-40 animate-pulse rounded motion-reduce:animate-none" />
        <div className="bg-surface-muted mt-3 h-4 w-full animate-pulse rounded motion-reduce:animate-none" />
        <div className="bg-surface-muted mt-2 h-4 w-11/12 animate-pulse rounded motion-reduce:animate-none" />
        <div className="bg-surface-muted mt-2 h-4 w-3/4 animate-pulse rounded motion-reduce:animate-none" />
      </Card>
      <Card className="mt-6">
        <div className="bg-surface-muted h-5 w-24 animate-pulse rounded motion-reduce:animate-none" />
        <div className="bg-surface-muted mt-3 h-4 w-full animate-pulse rounded motion-reduce:animate-none" />
        <div className="bg-surface-muted mt-2 h-4 w-2/3 animate-pulse rounded motion-reduce:animate-none" />
      </Card>
      <span className="sr-only">Opdracht wordt geladen…</span>
    </Container>
  );
}
