/** Toont een sterrenscore (0–5) met optioneel het aantal reviews. */
export function StarRating({
  waarde,
  aantal,
}: {
  waarde: number | null;
  aantal?: number;
}) {
  if (waarde == null) {
    return (
      <span className="text-foreground-muted text-sm">Nog geen reviews</span>
    );
  }
  const afgerond = Math.round(waarde);
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span aria-hidden className="text-accent-500">
        {"★".repeat(afgerond)}
        <span className="text-border">{"★".repeat(5 - afgerond)}</span>
      </span>
      <span className="font-semibold">{waarde.toFixed(1)}</span>
      {aantal != null ? (
        <span className="text-foreground-muted">
          ({aantal} {aantal === 1 ? "review" : "reviews"})
        </span>
      ) : null}
    </span>
  );
}
