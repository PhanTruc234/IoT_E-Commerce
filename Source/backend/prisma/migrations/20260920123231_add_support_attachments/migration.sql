-- AlterTable
ALTER TABLE "support_messages" ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
