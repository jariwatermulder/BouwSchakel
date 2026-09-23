import "server-only";

/**
 * Bestandsopslag achter een minimale interface. Standaard wordt de
 * Postgres-provider gebruikt (zie ./postgres.ts): geen extra configuratie
 * nodig. Publieke bestanden (profiel-/portfoliofoto's) staan onder `public/`;
 * privédocumenten worden alleen via kort geldige gesigneerde URL's
 * uitgeserveerd - nooit zonder handtekening. Zie docs/SECURITY.md §4.
 */
export interface StoredObject {
  key: string;
}

export interface StorageProvider {
  put(input: {
    key: string;
    body: Buffer;
    contentType: string;
    ownerUserId?: string | null;
  }): Promise<StoredObject>;
  signedUrl(key: string, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Documentopslag is nog niet geconfigureerd.");
    this.name = "StorageNotConfiguredError";
  }
}

/** Toegestane MIME-types voor document-upload. */
export const TOEGESTANE_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

/** Toegestane MIME-types voor foto-upload (profiel, portfolio). */
export const TOEGESTANE_FOTO_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;

export const MAX_BESTANDSGROOTTE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FOTO_BYTES = 8 * 1024 * 1024; // 8 MB (vóór verkleinen)

let provider: StorageProvider | null = null;

export function setStorageProvider(p: StorageProvider): void {
  provider = p;
}

export async function getStorageProvider(): Promise<StorageProvider> {
  if (!provider) {
    const { PostgresStorageProvider } = await import("./postgres");
    provider = new PostgresStorageProvider();
  }
  return provider;
}

/** Opslag is altijd beschikbaar (Postgres-provider als standaard). */
export function isStorageConfigured(): boolean {
  return true;
}

/** Bestandsnaam opschonen voor opslag/weergave (geen paden, geen rare tekens). */
export function veiligeBestandsnaam(naam: string): string {
  const basis = naam.split(/[\\/]/).pop() ?? "bestand";
  return basis.replace(/[^\w.\-() ]+/g, "_").slice(0, 120) || "bestand";
}
