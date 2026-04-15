import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const counts = {
            vehicles: await prisma.vehicle.count(),
            drivers: await prisma.driver.count(),
            missions: await prisma.mission.count(),
            vouchers: await prisma.fuelVoucher.count(),
            cards: await prisma.fuelCard.count(),
        };
        console.log('Database Record Counts:', JSON.stringify(counts, null, 2));
    } catch (error) {
        console.error('Error counting records:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
