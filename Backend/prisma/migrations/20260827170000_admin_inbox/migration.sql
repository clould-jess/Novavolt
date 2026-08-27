CREATE TYPE "AdminNotificationType" AS ENUM ('FLEET_REQUEST', 'RESERVATION_REQUEST', 'CONTACT_MESSAGE');
CREATE TABLE "AdminNotification" ("id" TEXT NOT NULL, "type" "AdminNotificationType" NOT NULL, "entityId" TEXT NOT NULL, "title" TEXT NOT NULL, "preview" TEXT NOT NULL, "metadata" JSONB, "readAt" TIMESTAMP(3), "archivedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id"));
CREATE INDEX "AdminNotification_readAt_createdAt_idx" ON "AdminNotification"("readAt", "createdAt");
CREATE INDEX "AdminNotification_type_entityId_idx" ON "AdminNotification"("type", "entityId");
CREATE TABLE "ContactMessage" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT, "subject" TEXT NOT NULL, "message" TEXT NOT NULL, "emailSentAt" TIMESTAMP(3), "emailError" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");
CREATE INDEX "ContactMessage_email_createdAt_idx" ON "ContactMessage"("email", "createdAt");
