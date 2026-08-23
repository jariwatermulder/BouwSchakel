import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink, Button } from "@/components/ui/button";
import { verwijderAccount } from "@/app/(app)/account-actions";

/** AVG-acties: gegevens exporteren en account verwijderen. */
export function AccountDangerZone() {
  return (
    <>
      <Card className="mt-6">
        <CardTitle>Mijn gegevens</CardTitle>
        <CardDescription className="mt-2">
          Download een kopie van je gegevens (AVG-dataportabiliteit).
        </CardDescription>
        <ButtonLink
          href="/api/account/export"
          variant="outline"
          className="mt-4"
        >
          Gegevens exporteren
        </ButtonLink>
      </Card>

      <Card className="mt-6 border-red-300">
        <CardTitle>Account verwijderen</CardTitle>
        <CardDescription className="mt-2">
          Dit verwijdert je account en gekoppelde gegevens onherroepelijk. Typ
          <strong> VERWIJDER </strong> ter bevestiging.
        </CardDescription>
        <form action={verwijderAccount} className="mt-4 flex gap-2">
          <input
            name="bevestig"
            placeholder="VERWIJDER"
            className="border-border bg-surface h-11 rounded-lg border px-3 text-sm"
            required
          />
          <Button
            type="submit"
            variant="outline"
            className="border-red-400 text-red-600"
          >
            Verwijder mijn account
          </Button>
        </form>
      </Card>
    </>
  );
}
