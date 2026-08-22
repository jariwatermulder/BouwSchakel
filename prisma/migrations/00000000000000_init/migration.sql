-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ZZP', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIEF', 'GEBLOKKEERD', 'VERWIJDERD');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATIE', 'MAGIC_LINK', 'WACHTWOORD_RESET');

-- CreateEnum
CREATE TYPE "VerificatieStatus" AS ENUM ('NIET_GEVERIFIEERD', 'IN_BEHANDELING', 'GEVERIFIEERD', 'AFGEKEURD');

-- CreateEnum
CREATE TYPE "BeschikbaarheidType" AS ENUM ('FULLTIME', 'PARTTIME', 'INCIDENTEEL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IDENTITEIT', 'VCA', 'CERTIFICAAT', 'VERZEKERING', 'KVK', 'OVERIG');

-- CreateEnum
CREATE TYPE "CompanyMemberRole" AS ENUM ('OWNER', 'LID');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('CONCEPT', 'GEPUBLICEERD', 'GESLOTEN', 'VERVULD', 'VERLOPEN', 'GEANNULEERD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL,
    "adminRole" "AdminRole",
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIEF',
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZZPProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voornaam" TEXT,
    "achternaam" TEXT,
    "telefoon" TEXT,
    "bedrijfsnaam" TEXT,
    "kvkNummer" TEXT,
    "over" TEXT,
    "jarenErvaring" INTEGER,
    "uurtariefCents" INTEGER,
    "werkgebiedPlaats" TEXT,
    "werkgebiedLat" DOUBLE PRECISION,
    "werkgebiedLng" DOUBLE PRECISION,
    "maxReisafstandKm" INTEGER,
    "eigenBus" BOOLEAN NOT NULL DEFAULT false,
    "eigenGereedschap" BOOLEAN NOT NULL DEFAULT false,
    "vca" BOOLEAN NOT NULL DEFAULT false,
    "startdatum" TIMESTAMP(3),
    "profielCompleetheidPct" INTEGER NOT NULL DEFAULT 0,
    "verificatieStatus" "VerificatieStatus" NOT NULL DEFAULT 'NIET_GEVERIFIEERD',
    "zichtbaar" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ZZPProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "actief" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialization" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "actief" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "actief" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZZPSkill" (
    "zzpProfileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "ZZPSkill_pkey" PRIMARY KEY ("zzpProfileId","skillId")
);

-- CreateTable
CREATE TABLE "ZZPSpecialization" (
    "zzpProfileId" TEXT NOT NULL,
    "specializationId" TEXT NOT NULL,

    CONSTRAINT "ZZPSpecialization_pkey" PRIMARY KEY ("zzpProfileId","specializationId")
);

-- CreateTable
CREATE TABLE "ZZPCertification" (
    "id" TEXT NOT NULL,
    "zzpProfileId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "geldigTot" TIMESTAMP(3),
    "documentId" TEXT,
    "status" "VerificatieStatus" NOT NULL DEFAULT 'NIET_GEVERIFIEERD',

    CONSTRAINT "ZZPCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "zzpProfileId" TEXT NOT NULL,
    "van" TIMESTAMP(3) NOT NULL,
    "tot" TIMESTAMP(3),
    "type" "BeschikbaarheidType" NOT NULL DEFAULT 'FULLTIME',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "bestandsnaam" TEXT NOT NULL,
    "opslagKey" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "grootte" INTEGER NOT NULL,
    "status" "VerificatieStatus" NOT NULL DEFAULT 'NIET_GEVERIFIEERD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL,
    "zzpProfileId" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "omschrijving" TEXT,
    "afbeeldingKey" TEXT,
    "volgorde" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "kvkNummer" TEXT,
    "omschrijving" TEXT,
    "website" TEXT,
    "telefoon" TEXT,
    "contactpersoon" TEXT,
    "regio" TEXT,
    "typeWerkzaamheden" TEXT,
    "verificatieStatus" "VerificatieStatus" NOT NULL DEFAULT 'NIET_GEVERIFIEERD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CompanyMemberRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "specializationId" TEXT,
    "titel" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "locatiePlaats" TEXT NOT NULL,
    "locatieAdres" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "startdatum" TIMESTAMP(3) NOT NULL,
    "einddatum" TIMESTAMP(3),
    "duurDagen" INTEGER,
    "aantalPersonen" INTEGER NOT NULL DEFAULT 1,
    "gewenstUurtariefCents" INTEGER,
    "eigenGereedschapGewenst" BOOLEAN NOT NULL DEFAULT false,
    "contactpersoon" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'CONCEPT',
    "publiekIndexeerbaar" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequirement" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "certificationId" TEXT,
    "vrijeTekst" TEXT,
    "hard" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "zzpProfileId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "subscores" JSONB NOT NULL,
    "geschikt" BOOLEAN NOT NULL DEFAULT true,
    "berekendOp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "gewichtVakgebied" INTEGER NOT NULL DEFAULT 25,
    "gewichtBeschikbaarheid" INTEGER NOT NULL DEFAULT 20,
    "gewichtSpecialisatie" INTEGER NOT NULL DEFAULT 15,
    "gewichtLocatie" INTEGER NOT NULL DEFAULT 15,
    "gewichtTarief" INTEGER NOT NULL DEFAULT 10,
    "gewichtErvaring" INTEGER NOT NULL DEFAULT 5,
    "gewichtCertificaten" INTEGER NOT NULL DEFAULT 5,
    "gewichtBetrouwbaarheid" INTEGER NOT NULL DEFAULT 5,
    "minMatchScore" INTEGER NOT NULL DEFAULT 50,
    "maxAfstandKm" INTEGER NOT NULL DEFAULT 150,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchingSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_tokenHash_key" ON "VerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "VerificationToken_userId_type_idx" ON "VerificationToken"("userId", "type");

-- CreateIndex
CREATE INDEX "VerificationToken_expiresAt_idx" ON "VerificationToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ZZPProfile_userId_key" ON "ZZPProfile"("userId");

-- CreateIndex
CREATE INDEX "ZZPProfile_verificatieStatus_idx" ON "ZZPProfile"("verificatieStatus");

-- CreateIndex
CREATE INDEX "ZZPProfile_zichtbaar_idx" ON "ZZPProfile"("zichtbaar");

-- CreateIndex
CREATE INDEX "ZZPProfile_werkgebiedLat_werkgebiedLng_idx" ON "ZZPProfile"("werkgebiedLat", "werkgebiedLng");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_naam_key" ON "Skill"("naam");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_skillId_slug_key" ON "Specialization"("skillId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_naam_key" ON "Certification"("naam");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_slug_key" ON "Certification"("slug");

-- CreateIndex
CREATE INDEX "ZZPSkill_skillId_idx" ON "ZZPSkill"("skillId");

-- CreateIndex
CREATE INDEX "ZZPSpecialization_specializationId_idx" ON "ZZPSpecialization"("specializationId");

-- CreateIndex
CREATE UNIQUE INDEX "ZZPCertification_zzpProfileId_certificationId_key" ON "ZZPCertification"("zzpProfileId", "certificationId");

-- CreateIndex
CREATE INDEX "Availability_zzpProfileId_van_idx" ON "Availability"("zzpProfileId", "van");

-- CreateIndex
CREATE INDEX "Document_ownerUserId_idx" ON "Document"("ownerUserId");

-- CreateIndex
CREATE INDEX "PortfolioItem_zzpProfileId_idx" ON "PortfolioItem"("zzpProfileId");

-- CreateIndex
CREATE INDEX "Company_verificatieStatus_idx" ON "Company"("verificatieStatus");

-- CreateIndex
CREATE INDEX "CompanyMember_userId_idx" ON "CompanyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_companyId_userId_key" ON "CompanyMember"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_skillId_status_idx" ON "Job"("skillId", "status");

-- CreateIndex
CREATE INDEX "Job_status_startdatum_idx" ON "Job"("status", "startdatum");

-- CreateIndex
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");

-- CreateIndex
CREATE INDEX "Job_lat_lng_idx" ON "Job"("lat", "lng");

-- CreateIndex
CREATE INDEX "JobRequirement_jobId_idx" ON "JobRequirement"("jobId");

-- CreateIndex
CREATE INDEX "Match_jobId_score_idx" ON "Match"("jobId", "score");

-- CreateIndex
CREATE INDEX "Match_zzpProfileId_idx" ON "Match"("zzpProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_jobId_zzpProfileId_key" ON "Match"("jobId", "zzpProfileId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZZPProfile" ADD CONSTRAINT "ZZPProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialization" ADD CONSTRAINT "Specialization_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZZPSkill" ADD CONSTRAINT "ZZPSkill_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZZPSkill" ADD CONSTRAINT "ZZPSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZZPSpecialization" ADD CONSTRAINT "ZZPSpecialization_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZZPSpecialization" ADD CONSTRAINT "ZZPSpecialization_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZZPCertification" ADD CONSTRAINT "ZZPCertification_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZZPCertification" ADD CONSTRAINT "ZZPCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_zzpProfileId_fkey" FOREIGN KEY ("zzpProfileId") REFERENCES "ZZPProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

