-- AlterTable: factuurgegevens op het bedrijfsprofiel
ALTER TABLE "Company"
    ADD COLUMN "btwId" TEXT,
    ADD COLUMN "iban" TEXT,
    ADD COLUMN "adres" TEXT,
    ADD COLUMN "postcode" TEXT,
    ADD COLUMN "plaats" TEXT;
