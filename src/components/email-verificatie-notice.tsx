import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { stuurVerificatieOpnieuw } from "@/app/(app)/verificatie-actions";

/** Herinnering + knop om de bevestigingsmail opnieuw te sturen. */
export function EmailVerificatieNotice({ bevestigd }: { bevestigd: boolean }) {
  if (bevestigd) return null;
  return (
    <Card className="mt-6 border-amber-300 bg-amber-50">
      <CardTitle>Bevestig je e-mailadres</CardTitle>
      <CardDescription className="mt-1">
        We hebben je een bevestigingsmail gestuurd. Niets ontvangen? Controleer
        je spammap of vraag een nieuwe aan.
      </CardDescription>
      <form action={stuurVerificatieOpnieuw} className="mt-3">
        <Button type="submit" variant="outline" size="sm">
          Bevestigingsmail opnieuw sturen
        </Button>
      </form>
    </Card>
  );
}
