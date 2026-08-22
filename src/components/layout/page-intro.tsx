import { Container } from "@/components/ui/container";

/** Consistente kop voor binnenpagina's. */
export function PageIntro({ title, lead }: { title: string; lead?: string }) {
  return (
    <section className="border-border bg-surface-muted border-b">
      <Container className="py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        {lead ? (
          <p className="text-foreground-muted mt-3 max-w-2xl">{lead}</p>
        ) : null}
      </Container>
    </section>
  );
}
