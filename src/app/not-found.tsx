import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-accent-600 text-sm font-semibold">404</p>
      <h1 className="mt-2 text-3xl font-bold">Pagina niet gevonden</h1>
      <p className="text-foreground-muted mt-3 max-w-md">
        Deze pagina bestaat niet (meer). Controleer de link of ga terug naar de
        homepage.
      </p>
      <ButtonLink href="/" className="mt-6">
        Naar de homepage
      </ButtonLink>
      <Link href="/contact" className="text-navy-700 mt-3 text-sm">
        Contact opnemen
      </Link>
    </Container>
  );
}
