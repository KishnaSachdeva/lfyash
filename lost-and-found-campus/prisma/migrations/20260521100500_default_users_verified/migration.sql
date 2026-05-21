-- AlterTable
ALTER TABLE "users" ALTER COLUMN "isVerified" SET DEFAULT true;

-- Existing accounts no longer require verification.
UPDATE "users" SET "isVerified" = true WHERE "isVerified" = false;
