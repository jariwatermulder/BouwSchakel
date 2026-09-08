-- Nieuwe statussen
ALTER TYPE "ZzpInvoiceStatus" ADD VALUE IF NOT EXISTS 'GEOPEND';
ALTER TYPE "ZzpInvoiceStatus" ADD VALUE IF NOT EXISTS 'TE_LAAT';
ALTER TYPE "ZzpInvoiceStatus" ADD VALUE IF NOT EXISTS 'GEANNULEERD';

-- Extra factuurvelden
ALTER TABLE "ZzpInvoice"
    ADD COLUMN "betaaltermijnDagen" INTEGER,
    ADD COLUMN "betaalreferentie" TEXT,
    ADD COLUMN "btwVerlegd" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ZzpInvoice"
    ADD COLUMN "afzenderTelefoon" TEXT,
    ADD COLUMN "afzenderWebsite" TEXT,
    ADD COLUMN "klantContactpersoon" TEXT,
    ADD COLUMN "klantBtwId" TEXT;

-- Per regel: eenheid en btw-tarief
ALTER TABLE "ZzpInvoiceLine"
    ADD COLUMN "eenheid" TEXT,
    ADD COLUMN "btwPercentage" INTEGER NOT NULL DEFAULT 21;
