import "server-only";
import sharp from "sharp";
import { MAX_FOTO_BYTES, TOEGESTANE_FOTO_MIMES } from "@/lib/storage";

/**
 * Fotoverwerking bij upload: EXIF-rotatie toepassen, verkleinen, metadata
 * (locatie e.d.) strippen en als WebP opslaan. Zo blijven bestanden klein en
 * lekken er geen privégegevens uit foto's.
 */

export class OngeldigeAfbeeldingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OngeldigeAfbeeldingError";
  }
}

/** Leest en valideert een geüpload afbeeldingsbestand uit FormData. */
export async function leesUploadAfbeelding(
  waarde: FormDataEntryValue | null,
): Promise<Buffer | null> {
  if (!(waarde instanceof File) || waarde.size === 0) return null;
  if (!(TOEGESTANE_FOTO_MIMES as readonly string[]).includes(waarde.type)) {
    throw new OngeldigeAfbeeldingError("Kies een JPG-, PNG- of WebP-afbeelding.");
  }
  if (waarde.size > MAX_FOTO_BYTES) {
    throw new OngeldigeAfbeeldingError("De afbeelding mag maximaal 8 MB zijn.");
  }
  return Buffer.from(await waarde.arrayBuffer());
}

async function verwerk(
  input: Buffer,
  resize: { width: number; height?: number; fit: "cover" | "inside" },
  kwaliteit: number,
): Promise<Buffer> {
  try {
    return await sharp(input, { failOn: "error", limitInputPixels: 50_000_000 })
      .rotate()
      .resize({
        width: resize.width,
        height: resize.height,
        fit: resize.fit,
        position: resize.fit === "cover" ? "attention" : undefined,
        withoutEnlargement: true,
      })
      .webp({ quality: kwaliteit })
      .toBuffer();
  } catch {
    throw new OngeldigeAfbeeldingError(
      "De afbeelding kon niet worden verwerkt. Probeer een ander bestand.",
    );
  }
}

/** Profielfoto: vierkant 512×512, gezicht/onderwerp gecentreerd. */
export function verwerkProfielFoto(input: Buffer): Promise<Buffer> {
  return verwerk(input, { width: 512, height: 512, fit: "cover" }, 82);
}

/** Portfoliofoto: max. 1600 px breed/hoog, verhouding behouden. */
export function verwerkPortfolioFoto(input: Buffer): Promise<Buffer> {
  return verwerk(input, { width: 1600, height: 1600, fit: "inside" }, 80);
}
