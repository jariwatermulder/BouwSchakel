-- CreateEnum
CREATE TYPE "ZzpInvoiceStatus" AS ENUM ('CONCEPT', 'VERSTUURD', 'BETAALD');

-- AlterTable: factuurgegevens op het zzp-profiel
ALTER TABLE "ZZPProfile"
    ADD COLUMN "btwId" TEXT,
    ADD COLUMN "iban" TEXT,
    ADD COLUMN "adres" TEXT,
    ADD COLUMN "postcode" TEXT,
    ADD COLUMN "plaats" TEXT;

-- CreateTable
CREATE TABLE "ZzpInvoice" (
    "id" TEXT NOT NULL,
    "zzpProfileId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "factuurnummer" TEXT NOT NULL,
    "status" "ZzpInvoiceStatus" NOT NULL DEFAULT 'CONCEPT',
    "factuurdatum" TIMESTAMP(3) NOT NULL,
    "vervaldatum" TIMESTAMP(3),
    "afzenderNaam" TEXT NOT NULL,
    "afzenderAdres" TEXT,
    "afzenderPostcode" TEXT,
    "afzenderPlaats" TEXT,
    "afzenderKvk" TEXT,
    "afzenderBtwId" TEXT,
    "afzenderIban" TEXT,
    "afzenderEmail" TEXT,
    "klantNaam" TEXT NOT NULL,
    "klantAdres" TEXT,
    "klantPostcode" TEXT,
    "klantPlaats" TEXT,
    "klantEmail" TEXT,
    "klantKvk" TEXT,
    "btwPercentage" INTEGER NOT NULL DEFAULT 21,
    "subtotaalCents" INTEGER NOT NULL DEFAULT 0,
    "btwCents" INTEGER NOT NULL DEFAULT 0,
    "totaalCents" INTEGER NOT NULL DEFAULT 0,
    "opmerking" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ZzpInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZzpInvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "aantal" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "tariefCents" INTEGER NOT NULL DEFAULT 0,
    "bedragCents" INTEGER NOT NULL DEFAULT 0,
    "volgorde" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ZzpInvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZzpInvoice_zzpProfileId_factuurnummer_key" ON "ZzpInvoice"("zzpProfileId", "factuurnummer");
CREATE INDEX "ZzpInvoice_zzpProfileId_idx" ON "ZzpInvoice"("zzpProfileId");
CREATE INDEX "ZzpInvoice_createdAt_idx" ON "ZzpInvoice"("createdAt");
CREATE INDEX "ZzpInvoiceLine_invoiceId_idx" ON "ZzpInvoiceLine"("invoiceId");

-- AddForeignKey
ALTER TABLE "ZzpInvoice" ADD CONSTRAINT "ZzpInvoice_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ZzpInvoice" ADD CONSTRAINT "ZzpInvoice_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ZzpInvoiceLine" ADD CONSTRAINT "ZzpInvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "ZzpInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS aan (geen policies): alleen via de owner-rol/Prisma bereikbaar.
ALTER TABLE "ZzpInvoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ZzpInvoiceLine" ENABLE ROW LEVEL SECURITY;
