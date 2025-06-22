/*
  Warnings:

  - You are about to drop the column `attachmentPath` on the `patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `patient` DROP COLUMN `attachmentPath`,
    ADD COLUMN `attachments` JSON NULL;
