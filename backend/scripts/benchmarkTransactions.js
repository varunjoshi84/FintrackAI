/**
 * Benchmark Script: Monthly Summary Query on PostgreSQL
 * Compares execution plan and timing with and without composite index (user_id, date).
 * 
 * Usage:
 *   node scripts/benchmarkTransactions.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { prisma, connectPostgres } = require('../config/postgres');

async function runBenchmark() {
  console.log('====================================================');
  console.log('⚡ FinTrackAI: Transactions Index Benchmark');
  console.log('====================================================\n');

  await connectPostgres();

  // Find a sample user_id with transactions
  const sampleTx = await prisma.transaction.findFirst({
    select: { userId: true, date: true },
  });

  if (!sampleTx) {
    console.log('No transactions found in database to benchmark.');
    process.exit(0);
  }

  const userId = sampleTx.userId;
  const startDate = new Date(sampleTx.date.getFullYear(), 0, 1);
  const endDate = new Date(sampleTx.date.getFullYear(), 11, 31, 23, 59, 59);

  console.log(`Benchmarking queries for user_id: ${userId}`);
  console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);

  // Query function
  const executeQuery = async () => {
    return await prisma.$queryRaw`
      EXPLAIN ANALYZE
      SELECT type, SUM(amount) AS total, COUNT(*) AS count
      FROM transactions
      WHERE user_id = ${userId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      GROUP BY type;
    `;
  };

  // 1. Benchmark WITH composite index
  console.log('--- 1. Testing WITH Index (idx_transactions_user_date) ---');
  const t0 = process.hrtime.bigint();
  const planWithIndex = await executeQuery();
  const t1 = process.hrtime.bigint();
  const durationWithIndexMs = Number(t1 - t0) / 1e6;

  console.log('Execution Plan (With Index):');
  planWithIndex.forEach((row) => console.log('  ' + row['QUERY PLAN']));
  console.log(`⏱️  Roundtrip Time (With Index): ${durationWithIndexMs.toFixed(3)} ms\n`);

  // 2. Temporarily drop index to test WITHOUT index
  console.log('--- 2. Dropping index temporarily to benchmark WITHOUT index ---');
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS idx_transactions_user_date;`);

  const t2 = process.hrtime.bigint();
  const planWithoutIndex = await executeQuery();
  const t3 = process.hrtime.bigint();
  const durationWithoutIndexMs = Number(t3 - t2) / 1e6;

  console.log('Execution Plan (Without Index):');
  planWithoutIndex.forEach((row) => console.log('  ' + row['QUERY PLAN']));
  console.log(`⏱️  Roundtrip Time (Without Index): ${durationWithoutIndexMs.toFixed(3)} ms\n`);

  // 3. Restore index
  console.log('--- 3. Restoring index (idx_transactions_user_date) ---');
  await prisma.$executeRawUnsafe(
    `CREATE INDEX idx_transactions_user_date ON transactions (user_id, date DESC);`
  );
  console.log('✅ Index successfully restored.\n');

  // Summary
  console.log('====================================================');
  console.log('📊 Benchmark Results Summary');
  console.log('====================================================');
  console.log(`With Index:    ${durationWithIndexMs.toFixed(3)} ms`);
  console.log(`Without Index: ${durationWithoutIndexMs.toFixed(3)} ms`);
  console.log('====================================================\n');

  await prisma.$disconnect();
}

runBenchmark().catch((err) => {
  console.error('Benchmark Error:', err);
  process.exit(1);
});
