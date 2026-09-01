import { Container } from "@/components/ui/container";

/** Consistente, kleurrijke kop voor binnenpagina's. */
export function PageIntro({
  title,
  lead,
  eyebrow,
}: {
  title: string;
  lead?: string;
  eyebrow?: string;
}) {
  return (
    <section className="border-border bg-surface-muted relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(30rem 22rem at 92% -35%, rgba(245,158,11,0.16), transparent 60%), radial-gradient(26rem 22rem at -6% 135%, rgba(47,93,166,0.14), transparent 60%)",
        }}
      />
      <Container className="relative py-14 md:py-20">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1
          className="bs-load text-3xl font-extrabold tracking-tight md:text-5xl"
          style={{ marginTop: eyebrow ? "0.75rem" : undefined }}
        >
          {title}
        </h1>
        <span
          aria-hidden
          className="from-accent-500 to-navy-500 mt-4 block h-1 w-16 rounded-full bg-gradient-to-r"
        />
        {lead ? (
          <p
            className="text-foreground-muted bs-load mt-5 max-w-2xl text-lg"
            style={{ animationDelay: "90ms" }}
          >
            {lead}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
