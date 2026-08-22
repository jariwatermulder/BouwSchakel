-- CreateEnum
CREATE TYPE "ReviewDirection" AS ENUM ('ZZP_NAAR_BEDRIJF', 'BEDRIJF_NAAR_ZZP');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "richting" "ReviewDirection" NOT NULL,
    "auteurUserId" TEXT NOT NULL,
    "overZzpProfileId" TEXT,
    "overCompanyId" TEXT,
    "scoreKwaliteit" INTEGER NOT NULL,
    "scoreCommunicatie" INTEGER NOT NULL,
    "scoreBetrouwbaarheid" INTEGER NOT NULL,
    "scoreAfspraken" INTEGER NOT NULL,
    "toelichting" TEXT,
    "gepubliceerdOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_assignmentId_richting_key" ON "Review"("assignmentId", "richting");
CREATE INDEX "Review_overZzpProfileId_idx" ON "Review"("overZzpProfileId");
CREATE INDEX "Review_overCompanyId_idx" ON "Review"("overCompanyId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_auteurUserId_fkey" FOREIGN KEY ("auteurUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
