import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Attempting to repair table system_settings...');
  try {
    // REPAIR TABLE is specific to some storage engines like MyISAM. 
    // If it's InnoDB, it might require OPTIMIZE TABLE instead, 
    // but the error specifically mentioned REPAIR.
    const result = await prisma.$executeRawUnsafe('REPAIR TABLE system_settings;');
    console.log('Repair command executed result:', result);
  } catch (error) {
    console.error('Failed to repair table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
