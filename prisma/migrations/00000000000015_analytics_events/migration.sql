-- First-party analytics: één platte eventtabel met vrije metadata.
CREATE TABLE "analytics_events" (
  "id"          TEXT NOT NULL,
  "eventName"   TEXT NOT NULL,
  "userId"      TEXT,
  "userRole"    "UserRole",
  "anonymousId" TEXT,
  "sessionId"   TEXT,
  "page"        TEXT,
  "referrer"    TEXT,
  "utmSource"   TEXT,
  "utmMedium"   TEXT,
  "utmCampaign" TEXT,
  "deviceType"  TEXT,
  "browser"     TEXT,
  "os"          TEXT,
  "metadata"    JSONB,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");
CREATE INDEX "analytics_events_eventName_createdAt_idx" ON "analytics_events"("eventName", "createdAt");
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");
CREATE INDEX "analytics_events_anonymousId_idx" ON "analytics_events"("anonymousId");
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- Zoals alle tabellen: RLS aan, zodat de publieke Supabase-API niets kan lezen.
ALTER TABLE "analytics_events" ENABLE ROW LEVEL SECURITY;
