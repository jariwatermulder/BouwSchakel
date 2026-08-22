import bcrypt from "bcryptjs";

/**
 * Wachtwoord-hashing met bcrypt. Cost factor 12 is een redelijke balans tussen
 * veiligheid en snelheid voor de MVP; verhoog bij zwaardere hardware.
 * Zie docs/SECURITY.md §1.
 */
const COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
