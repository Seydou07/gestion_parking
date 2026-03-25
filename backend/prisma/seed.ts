import { PrismaClient, UserRole, VehicleStatus, DriverStatus, FuelType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@ccva.bf' },
        update: {},
        create: {
            email: 'admin@ccva.bf',
            nom: 'CCVA',
            prenom: 'Administrateur',
            password: adminPassword,
            role: UserRole.ADMIN,
        },
    });
    console.log('Admin user created/updated');

    // 2. Create Gestionnaire User
    const gestPassword = await bcrypt.hash('gest123', 10);
    await prisma.user.upsert({
        where: { email: 'gestionnaire@ccva.bf' },
        update: {},
        create: {
            email: 'gestionnaire@ccva.bf',
            nom: 'Sylla',
            prenom: 'Amadou',
            password: gestPassword,
            role: UserRole.GESTIONNAIRE,
        },
    });

    // 3. Create some Vehicles
    const v1 = await prisma.vehicle.upsert({
        where: { immatriculation: '11 HJ 4567' },
        update: {},
        create: {
            immatriculation: '11 HJ 4567',
            marque: 'Toyota',
            modele: 'Land Cruiser',
            annee: 2021,
            kilometrage: 12500,
            statut: VehicleStatus.DISPONIBLE,
            typeCarburant: FuelType.DIESEL,
            assuranceExpiration: new Date('2026-12-31'),
            prochainControle: new Date('2026-06-30'),
            budgetAlloue: 5000000,
        },
    });

    const v2 = await prisma.vehicle.upsert({
        where: { immatriculation: '22 KK 7890' },
        update: {},
        create: {
            immatriculation: '22 KK 7890',
            marque: 'Mitsubishi',
            modele: 'L200',
            annee: 2022,
            kilometrage: 8400,
            statut: VehicleStatus.DISPONIBLE,
            typeCarburant: FuelType.DIESEL,
            assuranceExpiration: new Date('2026-10-15'),
            prochainControle: new Date('2026-04-15'),
            budgetAlloue: 3000000,
        },
    });

    // 4. Create some Drivers
    await prisma.driver.upsert({
        where: { email: 'chauffeur1@ccva.bf' },
        update: {},
        create: {
            nom: 'Ouédraogo',
            prenom: 'Salif',
            email: 'chauffeur1@ccva.bf',
            telephone: '+226 70 12 34 56',
            permisNumero: 'P1234567',
            permisExpiration: new Date('2028-01-01'),
            statut: DriverStatus.DISPONIBLE,
        },
    });

    // 5. Create a Fuel Card
    await prisma.fuelCard.upsert({
        where: { numero: 'CARD-CCVA-001' },
        update: {},
        create: {
            numero: 'CARD-CCVA-001',
            soldeInitial: 1000000,
            solde: 850000,
            dateExpiration: new Date('2027-01-01'),
            fournisseur: 'TOTAL',
        },
    });

    console.log('Seeding completed! 🌱');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
