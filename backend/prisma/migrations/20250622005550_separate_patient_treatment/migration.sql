-- AlterTable
ALTER TABLE `patient` ADD COLUMN `address` VARCHAR(191) NULL,
    MODIFY `diagnosis` VARCHAR(191) NULL,
    MODIFY `diagnosisDate` DATETIME(3) NULL,
    MODIFY `stage` VARCHAR(191) NULL;
