import { randomBytes } from "node:crypto";

/** Maakt een URL-veilige slug van een tekst. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/(^-|-$)/gu, "");
}

/** Slug met korte willekeurige suffix, voor praktisch unieke opdracht-URL's. */
export function slugWithSuffix(...parts: string[]): string {
  const base = slugify(parts.filter(Boolean).join("-")) || "opdracht";
  const suffix = randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
}
