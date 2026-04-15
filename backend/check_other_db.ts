import { PrismaClient } from '@prisma/client';

async function main() {
    // Manually override the database URL for checking another DB
    const DATABASE_URL = 'mysql://root:@localhost:3306/gestion_materiel';
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: DATABASE_URL,
            },
        },
    });
    
    try {
        const tables: any[] = await prisma.$queryRaw`SHOW TABLES`;
        console.log('Tables in gestion_materiel:', JSON.stringify(tables, null, 2));
    } catch (error) {
        console.error('Error checking gestion_materiel:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
