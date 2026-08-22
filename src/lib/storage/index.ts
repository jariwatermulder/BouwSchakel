import "server-only";

/**
 * Object storage achter een minimale interface. In de MVP is er nog geen
 * provider geconfigureerd; document-upload wordt geactiveerd zodra een provider
 * (bijv. Supabase Storage of S3) is gekozen. Privédocumenten worden via signed
 * URLs uitgeserveerd — nooit publieke buckets. Zie docs/SECURITY.md §4.
 */
export interface StoredObject {
  key: string;
}

export interface StorageProvider {
  put(input: {
    key: string;
    body: Buffer;
    contentType: string;
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

export const MAX_BESTANDSGROOTTE_BYTES = 10 * 1024 * 1024; // 10 MB

let provider: StorageProvider | null = null;

export function setStorageProvider(p: StorageProvider): void {
  provider = p;
}

export function getStorageProvider(): StorageProvider {
  if (!provider) throw new StorageNotConfiguredError();
  return provider;
}

export function isStorageConfigured(): boolean {
  return provider !== null;
}
