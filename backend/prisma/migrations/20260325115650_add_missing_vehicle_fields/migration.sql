-- DropIndex
DROP INDEX `alerts_vehiculeId_fkey` ON `alerts`;

-- DropIndex
DROP INDEX `budget_allocations_vehiculeId_fkey` ON `budget_allocations`;

-- DropIndex
DROP INDEX `fuel_records_bonEssenceId_fkey` ON `fuel_records`;

-- DropIndex
DROP INDEX `fuel_records_carteCarburantId_fkey` ON `fuel_records`;

-- DropIndex
DROP INDEX `fuel_records_vehiculeId_fkey` ON `fuel_records`;

-- DropIndex
DROP INDEX `fuel_vouchers_vehiculeId_fkey` ON `fuel_vouchers`;

-- DropIndex
DROP INDEX `history_logs_utilisateurId_fkey` ON `history_logs`;

-- DropIndex
DROP INDEX `maintenances_bonEssenceId_fkey` ON `maintenances`;

-- DropIndex
DROP INDEX `maintenances_carteCarburantId_fkey` ON `maintenances`;

-- DropIndex
DROP INDEX `maintenances_vehiculeId_fkey` ON `maintenances`;

-- DropIndex
DROP INDEX `missions_chauffeurId_fkey` ON `missions`;

-- DropIndex
DROP INDEX `missions_vehiculeId_fkey` ON `missions`;

-- AlterTable
ALTER TABLE `vehicles` ADD COLUMN `derniereVidangeKilometrage` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `frequenceVidange` INTEGER NOT NULL DEFAULT 5000,
    ADD COLUMN `transmission` VARCHAR(191) NOT NULL DEFAULT 'MANUELLE';

-- AddForeignKey
ALTER TABLE `budget_allocations` ADD CONSTRAINT `budget_allocations_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `missions` ADD CONSTRAINT `missions_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `missions` ADD CONSTRAINT `missions_chauffeurId_fkey` FOREIGN KEY (`chauffeurId`) REFERENCES `drivers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fuel_vouchers` ADD CONSTRAINT `fuel_vouchers_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_logs` ADD CONSTRAINT `history_logs_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
