/**
 * Veilige "next"-bestemming: alleen interne paden toestaan (open-redirect
 * voorkomen). Geeft het pad terug of null als het niet vertrouwd is.
 */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  // Moet een intern pad zijn: begint met één "/", niet met "//" of "/\".
  if (!v.startsWith("/")) return null;
  if (v.startsWith("//") || v.startsWith("/\\")) return null;
  return v;
}

/** Voeg een next-parameter toe aan een intern doelpad. */
export function withNext(path: string, next: string | null): string {
  if (!next) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}next=${encodeURIComponent(next)}`;
}
