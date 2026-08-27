-- Add ImageKit delivery metadata for vehicle photos.
ALTER TABLE "VehiclePhoto"
  ADD COLUMN "imagekitFileId" TEXT,
  ADD COLUMN "imagekitFilePath" TEXT,
  ADD COLUMN "imagekitUrl" TEXT,
  ADD COLUMN "imagekitThumbnailUrl" TEXT;

CREATE UNIQUE INDEX "VehiclePhoto_imagekitFileId_key"
  ON "VehiclePhoto"("imagekitFileId");
