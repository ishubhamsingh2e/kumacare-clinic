-- Create PrintSettings table
CREATE TABLE "PrintSettings" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "marginTop" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "marginBottom" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "marginLeft" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "marginRight" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "templateType" TEXT NOT NULL DEFAULT 'classic',
    "useCustomHeader" BOOLEAN NOT NULL DEFAULT false,
    "useCustomFooter" BOOLEAN NOT NULL DEFAULT false,
    "headerImageUrl" TEXT,
    "footerImageUrl" TEXT,
    "headerFirstPageOnly" BOOLEAN NOT NULL DEFAULT false,
    "enableWatermark" BOOLEAN NOT NULL DEFAULT false,
    "watermarkImageUrl" TEXT,
    "watermarkText" TEXT,
    "watermarkOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "doctorSignatureUrl" TEXT,
    "patientInfoFields" JSONB NOT NULL DEFAULT '[]',
    "doctorInfoFields" JSONB NOT NULL DEFAULT '[]',
    "useGenericName" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintSettings_pkey" PRIMARY KEY ("id")
);

-- Create unique index for doctorId + clinicId combination
CREATE UNIQUE INDEX "PrintSettings_doctorId_clinicId_key" ON "PrintSettings"("doctorId", "clinicId");

-- Create indexes for performance
CREATE INDEX "PrintSettings_doctorId_idx" ON "PrintSettings"("doctorId");
CREATE INDEX "PrintSettings_clinicId_idx" ON "PrintSettings"("clinicId");

-- Add foreign key constraints
ALTER TABLE "PrintSettings" ADD CONSTRAINT "PrintSettings_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PrintSettings" ADD CONSTRAINT "PrintSettings_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
