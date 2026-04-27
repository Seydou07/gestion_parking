import { PrismaClient, UserRole, VehicleStatus, DriverStatus, FuelType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * ROOT_ADMIN Seeding (System Level)
 * Strictly idempotent: Never overwrites password if user exists.
 */
async function seedRootAdmin() {
    console.log('🔐 [Setup] Initializing Root Admin...');

    const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@admin.com';
    const username = process.env.INITIAL_ADMIN_USERNAME || 'admin_fleet';
    const passwordRaw = process.env.INITIAL_ADMIN_PASSWORD || 'admin_123';

    // Identify user by either Email or Username
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }]
        }
    });

    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    if (existingUser) {
        console.log(`ℹ️  [Sync] Admin "${username}" exists. Updating metadata and password.`);
        
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                password: hashedPassword,
                role: UserRole.ROOT_ADMIN,
                actif: true,
                email,
                username,
            }
        });
        console.log('✅ [Sync] Root Admin synchronized.');
    } else {
        const hashedPassword = await bcrypt.hash(passwordRaw, 10);
        const rootAdmin = await prisma.user.create({
            data: {
                email,
                username,
                nom: 'SYSTEM',
                prenom: 'ROOT',
                password: hashedPassword,
                role: UserRole.ROOT_ADMIN,
                actif: true,
                mustChangePassword: true, // Forced reset for first login
            }
        });
        console.log(`✨ [Success] Root Admin created: ${rootAdmin.username} (${rootAdmin.email})`);
    }
}

/**
 * Demo Data Seeding (Optional/Development)
 */
async function seedDemographics() {
    console.log('📦 [Demo] Seeding organizational data...');

    // Demo Gestionnaire
    const gestEmail = 'gestionnaire@fleetguardian.com';
    const existingGest = await prisma.user.findUnique({ where: { email: gestEmail } });
    
    if (!existingGest) {
        const gestPassword = await bcrypt.hash('gest123', 10);
        await prisma.user.create({
            data: {
                email: gestEmail,
                username: 'gestionnaire',
                nom: 'Sylla',
                prenom: 'Amadou',
                password: gestPassword,
                role: UserRole.GESTIONNAIRE,
                actif: true,
                mustChangePassword: true,
            },
        });
        console.log('✅ [Demo] Gestionnaire user created.');
    }

    // Demo Vehicles
    console.log('--- 🛡️ FLEET GUARDIAN SEEDING INITIALIZED ---');
    // --- Véhicules ---
    const vehiclesData = [
        { immatriculation: '5283D4 03', marque: 'TOYOTA', modele: 'HILUX', annee: 2022, typeCarburant: FuelType.DIESEL, couleur: 'Blanc', transmission: 'MANUELLE' },
        { immatriculation: '1459F2 03', marque: 'MITSUBISHI', modele: 'L200', annee: 2021, typeCarburant: FuelType.DIESEL, couleur: 'Gris', transmission: 'MANUELLE' },
        { immatriculation: '8921G5 03', marque: 'FORD', modele: 'RANGER', annee: 2023, typeCarburant: FuelType.DIESEL, couleur: 'Noir', transmission: 'AUTOMATIQUE' },
        { immatriculation: '3372K1 03', marque: 'ISUZU', modele: 'D-MAX', annee: 2020, typeCarburant: FuelType.DIESEL, couleur: 'Bleu', transmission: 'MANUELLE' },
        { immatriculation: '6610H8 03', marque: 'TOYOTA', modele: 'PRADO', annee: 2022, typeCarburant: FuelType.DIESEL, couleur: 'Blanc', transmission: 'AUTOMATIQUE' },
        { immatriculation: '7723M4 03', marque: 'HYUNDAI', modele: 'TUCSON', annee: 2021, typeCarburant: FuelType.ESSENCE, couleur: 'Rouge', transmission: 'AUTOMATIQUE' },
        { immatriculation: '2288L9 03', marque: 'KIA', modele: 'SPORTAGE', annee: 2022, typeCarburant: FuelType.ESSENCE, couleur: 'Argent', transmission: 'AUTOMATIQUE' },
        { immatriculation: '1144J2 03', marque: 'SUZUKI', modele: 'GRAND VITARA', annee: 2019, typeCarburant: FuelType.ESSENCE, couleur: 'Marron', transmission: 'MANUELLE' },
        { immatriculation: '9955P7 03', marque: 'NISSAN', modele: 'PATROL', annee: 2023, typeCarburant: FuelType.DIESEL, couleur: 'Blanc', transmission: 'AUTOMATIQUE' },
        { immatriculation: '4433E1 03', marque: 'RENAULT', modele: 'DUSTER', annee: 2021, typeCarburant: FuelType.ESSENCE, couleur: 'Orange', transmission: 'MANUELLE' },
        { immatriculation: '5566T8 03', marque: 'TOYOTA', modele: 'LAND CRUISER', annee: 2024, typeCarburant: FuelType.DIESEL, couleur: 'Noir', transmission: 'AUTOMATIQUE' },
        { immatriculation: '8899W3 03', marque: 'MERCEDES', modele: 'G-CLASS', annee: 2022, typeCarburant: FuelType.DIESEL, couleur: 'Vert Mat', transmission: 'AUTOMATIQUE' },
        { immatriculation: '1234X5 03', marque: 'VOLVO', modele: 'XC90', annee: 2023, typeCarburant: FuelType.HYBRIDE, couleur: 'Bleu Marine', transmission: 'AUTOMATIQUE' },
        { immatriculation: '6789Y2 03', marque: 'TESLA', modele: 'MODEL X', annee: 2023, typeCarburant: FuelType.ELECTRIQUE, couleur: 'Blanc Perle', transmission: 'AUTOMATIQUE' },
        { immatriculation: '1010Z0 03', marque: 'PEUGEOT', modele: '3008', annee: 2021, typeCarburant: FuelType.ESSENCE, couleur: 'Gris Platinium', transmission: 'AUTOMATIQUE' },
    ];

    for (const vData of vehiclesData) {
        const enrichedData = {
            ...vData,
            kilometrage: Math.floor(Math.random() * 100000),
            capaciteReservoir: vData.typeCarburant === 'DIESEL' ? 80 : 60,
            numeroChassis: `CHAS${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
            dateAcquisition: new Date(vData.annee, 0, 1),
            prixAcquisition: 12000000 + Math.floor(Math.random() * 20000000),
            notes: 'Véhicule de service actif - État général bon',
            assuranceNumero: `POL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            assuranceCompagnie: 'SONAR',
            assuranceExpiration: new Date('2025-12-31'),
            prochainControle: new Date('2025-08-15'),
            budgetAlloue: 1000000,
            budgetConsomme: 0,
            derniereVidangeKilometrage: 0,
            frequenceVidange: 5000,
        };

        await prisma.vehicle.upsert({
            where: { immatriculation: vData.immatriculation },
            update: enrichedData,
            create: enrichedData,
        });
    }

    // Demo Drivers
    console.log('👨‍✈️ [Demo] Seeding drivers...');
    await prisma.driver.upsert({
        where: { permisNumero: 'P1234567' },
        update: {},
        create: {
            nom: 'Ouédraogo',
            prenom: 'Salif',
            telephone: '+226 70 12 34 56',
            permisNumero: 'P1234567',
            permisExpiration: new Date('2028-01-01'),
            statut: DriverStatus.DISPONIBLE,
        },
    });

    // Demo Fuel Card
    console.log('💳 [Demo] Seeding fuel cards...');
    await prisma.fuelCard.upsert({
        where: { numero: 'CARD-FLEET-001' },
        update: {},
        create: {
            numero: 'CARD-FLEET-001',
            soldeInitial: 1000000,
            solde: 850000,
            dateExpiration: new Date('2027-01-01'),
            fournisseur: 'TOTAL',
            prixDiesel: 675,
            prixSuper: 750,
        },
    });
}

async function main() {
    console.log('🚀 [Start] Initializing database seeding...');
    
    await seedRootAdmin();
    
    // In production, you might want to skip demographics seeding
    if (process.env.NODE_ENV !== 'production') {
        await seedDemographics();
    }

    console.log('🏁 [Done] Seeding process completed! 🌱');
}

main()
    .catch((e) => {
        console.error('❌ [Error] Seeding failed:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
