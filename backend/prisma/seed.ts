import { PrismaClient, UserRole, VehicleStatus, DriverStatus, FuelType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * ROOT_ADMIN Seeding (System Level)
 * Strictly idempotent: Never overwrites password if user exists.
 */
async function seedRootAdmin() {
    console.log('🔐 [Setup] Initializing Root Admin...');

    const email = process.env.INITIAL_ADMIN_EMAIL;
    const username = process.env.INITIAL_ADMIN_USERNAME;
    const passwordRaw = process.env.INITIAL_ADMIN_PASSWORD;

    if (!email || !username || !passwordRaw) {
        console.warn('⚠️  [Warning] INITIAL_ADMIN credentials missing in .env. Skipping Root Admin creation.');
        return;
    }

    // Identify user by either Email or Username
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }]
        }
    });

    if (existingUser) {
        console.log(`ℹ️  [Skip] Admin "${username}" already exists. Ensuring correct role and status.`);
        
        // Update only non-sensitive metadata to respect production password state
        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                role: UserRole.ROOT_ADMIN,
                actif: true,
                // We keep existing email/username if it matched one of them
                email: existingUser.email, 
                username: existingUser.username,
            }
        });
        console.log('✅ [Sync] Root Admin metadata synchronized.');
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
    const gestEmail = 'gestionnaire@ccva.bf';
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
    console.log('🚗 [Demo] Seeding vehicles...');
    const vehiclesData = [
        {
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
        {
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
        }
    ];

    for (const v of vehiclesData) {
        await prisma.vehicle.upsert({
            where: { immatriculation: v.immatriculation },
            update: {},
            create: v,
        });
    }

    // Demo Drivers
    console.log('👨‍✈️ [Demo] Seeding drivers...');
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

    // Demo Fuel Card
    console.log('💳 [Demo] Seeding fuel cards...');
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
