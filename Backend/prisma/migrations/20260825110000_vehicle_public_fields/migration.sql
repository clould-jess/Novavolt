-- Add the public vehicle fields used by the admin wizard.
ALTER TABLE "Vehicle"
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "seats" INTEGER,
  ADD COLUMN IF NOT EXISTS "rangeKm" INTEGER,
  ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Keep ImageKit metadata aligned even on databases that missed the earlier migration.
ALTER TABLE "VehiclePhoto"
  ADD COLUMN IF NOT EXISTS "imagekitFileId" TEXT,
  ADD COLUMN IF NOT EXISTS "imagekitFilePath" TEXT,
  ADD COLUMN IF NOT EXISTS "imagekitUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "imagekitThumbnailUrl" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "VehiclePhoto_imagekitFileId_key"
  ON "VehiclePhoto"("imagekitFileId");
