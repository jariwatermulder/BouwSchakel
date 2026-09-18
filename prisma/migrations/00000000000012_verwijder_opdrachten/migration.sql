-- Opdrachten fase 2: de opdrachten-, matching-, reactie-, review- en
-- bemiddelingsfactuurfunctionaliteit verdwijnt volledig uit de database.
-- ZZP Schakel is een communicatieplatform: bedrijven en zzp'ers vinden elkaar
-- en spreken rechtstreeks af. Alles wat overblijft: profielen, bedrijven,
-- directe berichten, notificaties, eigen facturen, beheer en contact.

-- ── Gesprekken: koppeling aan een opdracht vervalt ─────────────────────────
ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_jobId_fkey";
DROP INDEX IF EXISTS "Conversation_jobId_companyId_zzpProfileId_key";
DROP INDEX IF EXISTS "Conversation_companyId_zzpProfileId_idx";

-- Hooguit één gesprek per bedrijf/zzp'er-paar: dubbele gesprekken (per
-- opdracht) samenvoegen in het oudste gesprek, daarna de rest verwijderen.
UPDATE "Message" m
SET "conversationId" = k.keep
FROM (
  SELECT c.id AS dup,
         (SELECT c2.id FROM "Conversation" c2
           WHERE c2."companyId" = c."companyId" AND c2."zzpProfileId" = c."zzpProfileId"
           ORDER BY c2."createdAt" ASC, c2.id ASC LIMIT 1) AS keep
  FROM "Conversation" c
) k
WHERE m."conversationId" = k.dup AND k.dup <> k.keep;

DELETE FROM "Conversation" c
WHERE c.id <> (SELECT c2.id FROM "Conversation" c2
                WHERE c2."companyId" = c."companyId" AND c2."zzpProfileId" = c."zzpProfileId"
                ORDER BY c2."createdAt" ASC, c2.id ASC LIMIT 1);

ALTER TABLE "Conversation" DROP COLUMN IF EXISTS "jobId";
CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_companyId_zzpProfileId_key"
  ON "Conversation"("companyId", "zzpProfileId");

-- ── Eigen facturen: koppeling aan een opdracht vervalt ─────────────────────
ALTER TABLE "ZzpInvoice" DROP CONSTRAINT IF EXISTS "ZzpInvoice_assignmentId_fkey";
ALTER TABLE "ZzpInvoice" DROP COLUMN IF EXISTS "assignmentId";

-- ── Tabellen ───────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS "Payment";
DROP TABLE IF EXISTS "Invoice";
DROP TABLE IF EXISTS "PricingSetting";
DROP TABLE IF EXISTS "Review";
DROP TABLE IF EXISTS "Assignment";
DROP TABLE IF EXISTS "Application";
DROP TABLE IF EXISTS "Match";
DROP TABLE IF EXISTS "MatchingSetting";
DROP TABLE IF EXISTS "JobRequirement";
DROP TABLE IF EXISTS "Job";

-- ── Enums ──────────────────────────────────────────────────────────────────
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "InvoiceStatus";
DROP TYPE IF EXISTS "FeeModel";
DROP TYPE IF EXISTS "ReviewDirection";
DROP TYPE IF EXISTS "AssignmentStatus";
DROP TYPE IF EXISTS "ApplicationRichting";
DROP TYPE IF EXISTS "ApplicationStatus";
DROP TYPE IF EXISTS "JobStatus";

-- Notificatietypes: alleen berichten en verificaties blijven over.
DELETE FROM "Notification"
WHERE "type"::text NOT IN ('NIEUW_BERICHT', 'VERIFICATIE_AFGEROND');
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
CREATE TYPE "NotificationType" AS ENUM ('NIEUW_BERICHT', 'VERIFICATIE_AFGEROND');
ALTER TABLE "Notification"
  ALTER COLUMN "type" TYPE "NotificationType" USING ("type"::text::"NotificationType");
DROP TYPE "NotificationType_old";

-- Meldingen over opdrachten of reviews kunnen niet meer bestaan.
DELETE FROM "Report" WHERE "subjectType"::text IN ('JOB', 'REVIEW');
ALTER TYPE "ReportSubjectType" RENAME TO "ReportSubjectType_old";
CREATE TYPE "ReportSubjectType" AS ENUM ('USER', 'COMPANY', 'ZZP_PROFIEL', 'MESSAGE');
ALTER TABLE "Report"
  ALTER COLUMN "subjectType" TYPE "ReportSubjectType" USING ("subjectType"::text::"ReportSubjectType");
DROP TYPE "ReportSubjectType_old";

-- E-mailvoorkeuren voor reacties, matches en reviews vervallen.
ALTER TABLE "NotificationPreference" DROP COLUMN IF EXISTS "emailReacties";
ALTER TABLE "NotificationPreference" DROP COLUMN IF EXISTS "emailMatches";
ALTER TABLE "NotificationPreference" DROP COLUMN IF EXISTS "emailReviews";
