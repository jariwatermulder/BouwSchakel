-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'IN_BEHANDELING', 'AFGEHANDELD', 'AFGEWEZEN');
CREATE TYPE "ReportSubjectType" AS ENUM ('USER', 'COMPANY', 'ZZP_PROFIEL', 'JOB', 'REVIEW', 'MESSAGE');
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_BEHANDELING', 'AFGEHANDELD');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "melderUserId" TEXT,
    "subjectType" "ReportSubjectType" NOT NULL,
    "subjectId" TEXT NOT NULL,
    "reden" TEXT NOT NULL,
    "toelichting" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "afgehandeldOp" TIMESTAMP(3),
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "onderwerp" TEXT NOT NULL,
    "bericht" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actie" TEXT NOT NULL,
    "subjectType" TEXT,
    "subjectId" TEXT,
    "meta" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_melderUserId_fkey" FOREIGN KEY ("melderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
