-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'GESTIONNAIRE', 'CHAUFFEUR') NOT NULL DEFAULT 'GESTIONNAIRE',
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `immatriculation` VARCHAR(191) NOT NULL,
    `marque` VARCHAR(191) NOT NULL,
    `modele` VARCHAR(191) NOT NULL,
    `annee` INTEGER NOT NULL,
    `kilometrage` INTEGER NOT NULL DEFAULT 0,
    `statut` ENUM('DISPONIBLE', 'EN_MISSION', 'EN_MAINTENANCE', 'HORS_SERVICE') NOT NULL DEFAULT 'DISPONIBLE',
    `typeCarburant` ENUM('ESSENCE', 'DIESEL', 'ELECTRIQUE', 'HYBRIDE') NOT NULL DEFAULT 'DIESEL',
    `capaciteReservoir` INTEGER NULL,
    `numeroChassis` VARCHAR(191) NULL,
    `couleur` VARCHAR(191) NULL,
    `dateAcquisition` DATETIME(3) NULL,
    `prixAcquisition` DOUBLE NULL,
    `notes` TEXT NULL,
    `assuranceNumero` VARCHAR(191) NULL,
    `assuranceCompagnie` VARCHAR(191) NULL,
    `assuranceExpiration` DATETIME(3) NULL,
    `prochainControle` DATETIME(3) NULL,
    `budgetAlloue` DOUBLE NULL DEFAULT 0,
    `budgetConsomme` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicles_immatriculation_key`(`immatriculation`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `drivers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `permisNumero` VARCHAR(191) NOT NULL,
    `permisExpiration` DATETIME(3) NOT NULL,
    `permisCategories` VARCHAR(191) NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `statut` ENUM('DISPONIBLE', 'EN_MISSION', 'INACTIF') NOT NULL DEFAULT 'DISPONIBLE',
    `dateNaissance` DATETIME(3) NULL,
    `adresse` VARCHAR(191) NULL,
    `dateEmbauche` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `drivers_permisNumero_key`(`permisNumero`),
    UNIQUE INDEX `drivers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `missions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehiculeId` INTEGER NOT NULL,
    `chauffeurId` INTEGER NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `objectif` TEXT NULL,
    `dateDepart` DATETIME(3) NOT NULL,
    `dateRetour` DATETIME(3) NULL,
    `kmDepart` INTEGER NOT NULL,
    `kmRetour` INTEGER NULL,
    `statut` ENUM('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE') NOT NULL DEFAULT 'PLANIFIEE',
    `observations` TEXT NULL,
    `lettreMission` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fuel_cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NOT NULL,
    `solde` DOUBLE NOT NULL DEFAULT 0,
    `soldeInitial` DOUBLE NOT NULL,
    `plafond` DOUBLE NULL,
    `dateExpiration` DATETIME(3) NOT NULL,
    `statut` ENUM('ACTIVE', 'INACTIVE', 'EXPIREE') NOT NULL DEFAULT 'ACTIVE',
    `fournisseur` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fuel_cards_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fuel_vouchers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NOT NULL,
    `valeur` DOUBLE NOT NULL,
    `dateEmission` DATETIME(3) NOT NULL,
    `dateExpiration` DATETIME(3) NULL,
    `statut` ENUM('DISPONIBLE', 'UTILISE', 'EXPIRE') NOT NULL DEFAULT 'DISPONIBLE',
    `vehiculeId` INTEGER NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fuel_vouchers_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fuel_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehiculeId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `quantite` DOUBLE NOT NULL,
    `montant` DOUBLE NOT NULL,
    `kilometrage` INTEGER NOT NULL,
    `typeCarburant` ENUM('ESSENCE', 'DIESEL', 'ELECTRIQUE', 'HYBRIDE') NOT NULL,
    `station` VARCHAR(191) NULL,
    `modePaiement` ENUM('CARTE_CARBURANT', 'BON_ESSENCE', 'ESPECES', 'CARTE_BANCAIRE') NOT NULL,
    `carteCarburantId` INTEGER NULL,
    `bonEssenceId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehiculeId` INTEGER NOT NULL,
    `type` ENUM('PANNE', 'REPARATION', 'VIDANGE', 'ASSURANCE', 'VISITE_TECHNIQUE', 'AUTRE') NOT NULL,
    `description` TEXT NOT NULL,
    `dateDebut` DATETIME(3) NOT NULL,
    `dateFin` DATETIME(3) NULL,
    `montant` DOUBLE NULL,
    `statut` ENUM('EN_ATTENTE', 'EN_COURS', 'TERMINEE', 'ANNULEE') NOT NULL DEFAULT 'EN_ATTENTE',
    `garage` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alerts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `module` ENUM('VEHICULE', 'CHAUFFEUR', 'MISSION', 'CARBURANT', 'MAINTENANCE', 'BUDGET') NOT NULL,
    `severity` ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL DEFAULT 'WARNING',
    `lue` BOOLEAN NOT NULL DEFAULT false,
    `vehiculeId` INTEGER NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `history_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `utilisateurId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_logs` ADD CONSTRAINT `history_logs_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
