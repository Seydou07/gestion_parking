import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, immatriculation: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log('--- Vehicles Sorted by createdAt DESC ---');
  vehicles.forEach((v, i) => {
    console.log(`${i + 1}. ID: ${v.id}, Plate: ${v.immatriculation}, Created: ${v.createdAt.toISOString()}`);
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
