-- Gesprekken kunnen nu direct contact zijn (zonder opdracht).
DROP INDEX IF EXISTS "Conversation_jobId_companyId_zzpProfileId_key";
ALTER TABLE "Conversation" ALTER COLUMN "jobId" DROP NOT NULL;
CREATE INDEX IF NOT EXISTS "Conversation_companyId_zzpProfileId_idx" ON "Conversation"("companyId", "zzpProfileId");
