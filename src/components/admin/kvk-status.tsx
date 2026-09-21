/**
 * Regel voor beheerders: is het KvK-nummer bij het Handelsregister
 * gecontroleerd, en onder welke naam staat het daar?
 */
export function KvkStatus({
  nummer,
  naam,
  op,
}: {
  nummer: string | null;
  naam: string | null;
  op: Date | null;
}) {
  if (!nummer) return null;
  if (!naam || !op) {
    return (
      <p className="text-foreground-muted mt-1 text-xs">
        KvK niet gecontroleerd in het Handelsregister (geen KvK-API ingesteld of nummer nog niet opnieuw opgeslagen).
      </p>
    );
  }
  return (
    <p className="mt-1 text-xs text-emerald-700">
      Handelsregister: {naam} · gecontroleerd op{" "}
      {op.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam" })}
    </p>
  );
}
