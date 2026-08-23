-- CreateEnum
CREATE TYPE "FeeModel" AS ENUM ('PER_UUR', 'VAST');
CREATE TYPE "InvoiceStatus" AS ENUM ('CONCEPT', 'OPEN', 'BETAALD', 'MISLUKT', 'GECREDITEERD');
CREATE TYPE "PaymentStatus" AS ENUM ('IN_AFWACHTING', 'GESLAAGD', 'MISLUKT', 'GEREFUND');

-- CreateTable
CREATE TABLE "PricingSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "feeModel" "FeeModel" NOT NULL DEFAULT 'PER_UUR',
    "succesfeePerUurCents" INTEGER NOT NULL DEFAULT 750,
    "vasteBemiddelingsfeeCents" INTEGER NOT NULL DEFAULT 0,
    "proMaandCents" INTEGER NOT NULL DEFAULT 19900,
    "btwPercentage" INTEGER NOT NULL DEFAULT 21,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PricingSetting_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "omschrijving" TEXT NOT NULL,
    "subtotaalCents" INTEGER NOT NULL,
    "btwCents" INTEGER NOT NULL,
    "bedragCents" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'OPEN',
    "uitgegevenOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT,
    "bedragCents" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'IN_AFWACHTING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_assignmentId_key" ON "Invoice"("assignmentId");
CREATE INDEX "Invoice_companyId_idx" ON "Invoice"("companyId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
