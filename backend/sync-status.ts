import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sync() {
    console.log("Syncing vehicle legacy statuses...");
    const activeMaintenances = await prisma.maintenance.findMany({
        where: {
            statut: { in: ['EN_ATTENTE', 'EN_COURS'] }
        }
    });

    for (const m of activeMaintenances) {
        await prisma.vehicle.update({
            where: { id: m.vehiculeId },
            data: { statut: 'EN_MAINTENANCE' }
        });
        console.log(`Updated vehicle ${m.vehiculeId} to EN_MAINTENANCE`);
    }
    console.log("Done.");
}

sync().finally(() => prisma.$disconnect());
