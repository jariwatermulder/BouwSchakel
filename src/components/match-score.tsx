import type { MatchResult } from "@/server/matching/engine";

/** Toont het matchpercentage met uitleg — nooit een black box (docs/MATCHING.md). */
export function MatchScore({
  result,
  compact = false,
}: {
  result: MatchResult;
  compact?: boolean;
}) {
  const kleur =
    result.score >= 80
      ? "text-emerald-600"
      : result.score >= 60
        ? "text-navy-700"
        : "text-foreground-muted";

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-extrabold ${kleur}`}>
          {result.score}%
        </span>
        <span className="text-foreground-muted text-xs">match</span>
        {!result.geschikt ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Aandacht: vereiste ontbreekt
          </span>
        ) : null}
      </div>
      {!compact ? (
        <ul className="mt-2 space-y-1 text-sm">
          {result.redenen.map((r) => (
            <li
              key={r}
              className="text-foreground-muted flex items-center gap-2"
            >
              <span aria-hidden className="text-emerald-600">
                ✓
              </span>
              {r}
            </li>
          ))}
          {result.aandachtspunten.map((r) => (
            <li
              key={r}
              className="text-foreground-muted flex items-center gap-2"
            >
              <span aria-hidden className="text-amber-600">
                !
              </span>
              {r}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
