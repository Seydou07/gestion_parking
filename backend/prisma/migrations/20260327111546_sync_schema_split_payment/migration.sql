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
DROP INDEX `maintenance_items_maintenanceId_fkey` ON `maintenance_items`;

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
ALTER TABLE `maintenance_items` ADD COLUMN `sourcePaiement` ENUM('VEHICLE_BUDGET', 'FUEL_CARD', 'FUEL_VOUCHER', 'CASH') NOT NULL DEFAULT 'VEHICLE_BUDGET';

-- AlterTable
ALTER TABLE `maintenances` ADD COLUMN `sourceMainDoeuvre` ENUM('VEHICLE_BUDGET', 'FUEL_CARD', 'FUEL_VOUCHER', 'CASH') NOT NULL DEFAULT 'VEHICLE_BUDGET';

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
ALTER TABLE `maintenance_items` ADD CONSTRAINT `maintenance_items_maintenanceId_fkey` FOREIGN KEY (`maintenanceId`) REFERENCES `maintenances`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_logs` ADD CONSTRAINT `history_logs_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
