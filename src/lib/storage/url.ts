/** Publieke URL van een opgeslagen bestand (client-veilig, geen server-imports). */
export function publiekeUrl(key: string): string {
  return `/api/bestanden/${key.split("/").map(encodeURIComponent).join("/")}`;
}
