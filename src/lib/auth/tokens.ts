import { createHash, randomBytes } from "node:crypto";

/**
 * Genereert een cryptografisch sterk, URL-veilig token en de bijbehorende hash.
 * We slaan alleen de hash op in de database; het ruwe token gaat naar de cookie
 * (sessie) of de e-mail (magic link / reset). Zo is een gelekte DB niet genoeg
 * om sessies over te nemen. Zie docs/SECURITY.md §1.
 */
export function generateToken(bytes = 32): {
  token: string;
  tokenHash: string;
} {
  const token = randomBytes(bytes).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
