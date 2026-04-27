/*
  Warnings:

  - You are about to drop the column `dateEmbauche` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `bonCarburantId` on the `missions` table. All the data in the column will be lost.
  - The values [CHAUFFEUR] on the enum `users_role` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `drivers_email_key` ON `drivers`;

-- AlterTable
ALTER TABLE `drivers` DROP COLUMN `dateEmbauche`,
    DROP COLUMN `email`;

-- AlterTable
ALTER TABLE `fuel_cards` ADD COLUMN `prixDiesel` DOUBLE NULL DEFAULT 675,
    ADD COLUMN `prixSuper` DOUBLE NULL DEFAULT 750,
    ADD COLUMN `station` VARCHAR(191) NULL,
    MODIFY `statut` ENUM('ACTIVE', 'INACTIVE', 'EXPIREE', 'EN_MISSION') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `fuel_vouchers` ADD COLUMN `missionId` INTEGER NULL,
    ADD COLUMN `station` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `missions` DROP COLUMN `bonCarburantId`;

-- AlterTable
ALTER TABLE `system_settings` MODIFY `nomEntreprise` VARCHAR(191) NOT NULL DEFAULT 'Fleet Guardian';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `mustChangePassword` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `username` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('ROOT_ADMIN', 'ADMIN', 'GESTIONNAIRE', 'USER') NOT NULL DEFAULT 'GESTIONNAIRE';

-- CreateIndex
CREATE INDEX `fuel_vouchers_missionId_fkey` ON `fuel_vouchers`(`missionId`);

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

-- AddForeignKey
ALTER TABLE `missions` ADD CONSTRAINT `missions_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `missions` ADD CONSTRAINT `missions_chauffeurId_fkey` FOREIGN KEY (`chauffeurId`) REFERENCES `drivers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_vouchers` ADD CONSTRAINT `fuel_vouchers_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_vouchers` ADD CONSTRAINT `fuel_vouchers_missionId_fkey` FOREIGN KEY (`missionId`) REFERENCES `missions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_records` ADD CONSTRAINT `fuel_records_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_records` ADD CONSTRAINT `fuel_records_carteCarburantId_fkey` FOREIGN KEY (`carteCarburantId`) REFERENCES `fuel_cards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_records` ADD CONSTRAINT `fuel_records_bonEssenceId_fkey` FOREIGN KEY (`bonEssenceId`) REFERENCES `fuel_vouchers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenances` ADD CONSTRAINT `maintenances_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenances` ADD CONSTRAINT `maintenances_carteCarburantId_fkey` FOREIGN KEY (`carteCarburantId`) REFERENCES `fuel_cards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenances` ADD CONSTRAINT `maintenances_bonEssenceId_fkey` FOREIGN KEY (`bonEssenceId`) REFERENCES `fuel_vouchers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maintenance_items` ADD CONSTRAINT `maintenance_items_maintenanceId_fkey` FOREIGN KEY (`maintenanceId`) REFERENCES `maintenances`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_logs` ADD CONSTRAINT `history_logs_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
