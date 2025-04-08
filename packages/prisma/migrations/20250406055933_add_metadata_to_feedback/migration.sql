/*
  Warnings:

  - You are about to drop the column `userEmail` on the `Feedback` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "userEmail",
ADD COLUMN     "metadata" JSONB;
