/*
  Warnings:

  - You are about to drop the column `guidelineUrl` on the `patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `patient` DROP COLUMN `guidelineUrl`,
    ADD COLUMN `attachmentPath` VARCHAR(191) NULL;
