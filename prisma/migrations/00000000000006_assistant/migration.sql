-- CreateTable
CREATE TABLE "AssistantLog" (
    "id" TEXT NOT NULL,
    "vraag" TEXT NOT NULL,
    "antwoord" TEXT NOT NULL,
    "aantalBerichten" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssistantLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssistantLog_createdAt_idx" ON "AssistantLog"("createdAt");

-- Zet RLS aan (geen policies): alleen bereikbaar via de owner-rol/Prisma,
-- niet via de publieke Supabase anon-API. Zie docs/SECURITY.md.
ALTER TABLE "AssistantLog" ENABLE ROW LEVEL SECURITY;
