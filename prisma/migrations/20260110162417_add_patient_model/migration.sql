-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "is_dob_estimate" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "address" TEXT,
    "pin_code" TEXT,
    "marital_status" "MaritalStatus",
    "when_field" TEXT,
    "blood_group" "BloodGroup",
    "spouse_blood_group" "BloodGroup",
    "spouse_name" TEXT,
    "referred_by" TEXT,
    "email" TEXT,
    "how_did_you_hear_about_us" TEXT,
    "care_of" TEXT,
    "occupation" TEXT,
    "tag" TEXT,
    "alternative_phone" TEXT,
    "aadhar_number" TEXT,
    "image_url" TEXT,
    "documents" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_aadhar_number_key" ON "Patient"("aadhar_number");
