-- CreateEnum
CREATE TYPE "FleetPartnerLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "FleetPartnerLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "vehicleCount" TEXT NOT NULL,
    "message" TEXT,
    "status" "FleetPartnerLeadStatus" NOT NULL DEFAULT 'NEW',
    "emailSentAt" TIMESTAMP(3),
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FleetPartnerLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FleetPartnerLead_status_createdAt_idx" ON "FleetPartnerLead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "FleetPartnerLead_email_createdAt_idx" ON "FleetPartnerLead"("email", "createdAt");
