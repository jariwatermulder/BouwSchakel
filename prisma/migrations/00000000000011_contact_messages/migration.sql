-- Contactformulier: berichten van bezoekers (naam, e-mail, onderwerp, bericht).
CREATE TYPE "ContactStatus" AS ENUM ('NIEUW', 'BEANTWOORD', 'GESLOTEN');

CREATE TABLE "ContactMessage" (
  "id"        TEXT NOT NULL,
  "naam"      TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "onderwerp" TEXT NOT NULL,
  "bericht"   TEXT NOT NULL,
  "status"    "ContactStatus" NOT NULL DEFAULT 'NIEUW',
  "ip"        TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");
