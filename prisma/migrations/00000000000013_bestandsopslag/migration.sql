-- Bestandsopslag in de database + profielfoto.
CREATE TABLE "StoredFile" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "grootte" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "publiek" BOOLEAN NOT NULL DEFAULT false,
    "ownerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StoredFile_key_key" ON "StoredFile"("key");
CREATE INDEX "StoredFile_ownerUserId_idx" ON "StoredFile"("ownerUserId");

ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_ownerUserId_fkey"
  FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Zelfde beveiliging als de andere tabellen: alleen de app (service role)
-- benadert de database rechtstreeks.
ALTER TABLE "StoredFile" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "ZZPProfile" ADD COLUMN "fotoKey" TEXT;
