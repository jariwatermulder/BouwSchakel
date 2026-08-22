-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NIEUW', 'BEKEKEN', 'UITGENODIGD', 'AFGEWEZEN', 'GEACCEPTEERD', 'INGETROKKEN');
CREATE TYPE "ApplicationRichting" AS ENUM ('SOLLICITATIE', 'UITNODIGING');
CREATE TYPE "AssignmentStatus" AS ENUM ('GEPLAND', 'ACTIEF', 'AFGEROND', 'GEANNULEERD', 'GESCHIL');
CREATE TYPE "NotificationType" AS ENUM ('NIEUWE_MATCH', 'NIEUWE_REACTIE', 'UITNODIGING', 'GESELECTEERD', 'AFGEWEZEN', 'NIEUW_BERICHT', 'OPDRACHT_GEWIJZIGD', 'REVIEW_ONTVANGEN', 'VERIFICATIE_AFGEROND');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "zzpProfileId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NIEUW',
    "richting" "ApplicationRichting" NOT NULL,
    "bericht" TEXT,
    "uurtariefVoorstelCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "zzpProfileId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'GEPLAND',
    "startdatum" TIMESTAMP(3) NOT NULL,
    "einddatum" TIMESTAMP(3),
    "gewerkteUren" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "zzpProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "laatsteBericht" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "gelezenOp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "titel" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "link" TEXT,
    "gelezenOp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "NotificationPreference" (
    "userId" TEXT NOT NULL,
    "emailReacties" BOOLEAN NOT NULL DEFAULT true,
    "emailBerichten" BOOLEAN NOT NULL DEFAULT true,
    "emailMatches" BOOLEAN NOT NULL DEFAULT true,
    "emailReviews" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_zzpProfileId_key" ON "Application"("jobId", "zzpProfileId");
CREATE INDEX "Application_jobId_status_idx" ON "Application"("jobId", "status");
CREATE INDEX "Application_zzpProfileId_idx" ON "Application"("zzpProfileId");
CREATE INDEX "Assignment_companyId_idx" ON "Assignment"("companyId");
CREATE INDEX "Assignment_zzpProfileId_idx" ON "Assignment"("zzpProfileId");
CREATE INDEX "Assignment_jobId_idx" ON "Assignment"("jobId");
CREATE UNIQUE INDEX "Conversation_jobId_companyId_zzpProfileId_key" ON "Conversation"("jobId", "companyId", "zzpProfileId");
CREATE INDEX "Conversation_companyId_idx" ON "Conversation"("companyId");
CREATE INDEX "Conversation_zzpProfileId_idx" ON "Conversation"("zzpProfileId");
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "Notification_userId_gelezenOp_idx" ON "Notification"("userId", "gelezenOp");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
