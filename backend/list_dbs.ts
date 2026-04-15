import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const result: any[] = await prisma.$queryRaw`SHOW DATABASES`;
        console.log('Databases:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error listing databases:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
