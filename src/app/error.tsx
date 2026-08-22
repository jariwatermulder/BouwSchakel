"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Technische details alleen server-side/console; nooit aan de gebruiker tonen.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl font-bold">Er ging iets mis</h1>
      <p className="text-foreground-muted mt-3 max-w-md">
        Er trad een onverwachte fout op. Je gegevens zijn niet verloren. Probeer
        het opnieuw; blijft het misgaan, neem dan contact met ons op.
      </p>
      <Button onClick={reset} className="mt-6">
        Opnieuw proberen
      </Button>
    </Container>
  );
}
