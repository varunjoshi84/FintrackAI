// PostgreSQL connection setup using Prisma Client
const { PrismaClient } = require('@prisma/client');

// Singleton Prisma instance to avoid exhausting connection pools
let prisma;

if (!global.__prisma) {
  global.__prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}
prisma = global.__prisma;

const connectPostgres = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Connected via Prisma Client');
    return prisma;
  } catch (error) {
    console.error(`❌ Error connecting to PostgreSQL: ${error.message}`);
    // Do not terminate application if postgres connection fails momentarily; log error
    throw error;
  }
};

module.exports = {
  prisma,
  connectPostgres,
};
