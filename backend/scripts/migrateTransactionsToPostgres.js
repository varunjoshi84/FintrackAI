/**
 * Data Migration Script: MongoDB -> PostgreSQL (Transactions)
 * 
 * Usage:
 *   node scripts/migrateTransactionsToPostgres.js
 *   node scripts/migrateTransactionsToPostgres.js --dry-run
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { prisma, connectPostgres } = require('../config/postgres');

const BATCH_SIZE = 200;
const isDryRun = process.argv.includes('--dry-run');

async function migrate() {
  console.log('====================================================');
  console.log('🚀 FinTrackAI: Migrating Transactions to PostgreSQL');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (No writes)' : '💾 LIVE MIGRATION'}`);
  console.log('====================================================\n');

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }

  // 1. Connect to PostgreSQL
  await connectPostgres();

  // 2. Connect to MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ MongoDB Connected');

  const mongoDb = mongoose.connection.db;
  const mongoTransactionsCollection = mongoDb.collection('transactions');

  // 3. Count total MongoDB records
  const totalMongoRecords = await mongoTransactionsCollection.countDocuments();
  console.log(`Found ${totalMongoRecords} transactions in MongoDB.\n`);

  if (totalMongoRecords === 0) {
    console.log('No transactions to migrate. Exiting.');
    process.exit(0);
  }

  let processedCount = 0;
  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const cursor = mongoTransactionsCollection.find({}).batchSize(BATCH_SIZE);

  let batch = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    batch.push(doc);

    if (batch.length === BATCH_SIZE) {
      await processBatch(batch);
      batch = [];
    }
  }

  // Process remaining items
  if (batch.length > 0) {
    await processBatch(batch);
  }

  console.log('\n====================================================');
  console.log('🏁 Migration Summary');
  console.log('====================================================');
  console.log(`Total Scanned in MongoDB: ${processedCount}`);
  console.log(`New Insertions in Postgres: ${insertedCount}`);
  console.log(`Updated Existing in Postgres: ${updatedCount}`);
  console.log(`Skipped / Unchanged:        ${skippedCount}`);
  console.log(`Errors:                     ${errorCount}`);
  console.log('====================================================\n');

  await mongoose.disconnect();
  await prisma.$disconnect();
  console.log('Connections closed cleanly.');

  async function processBatch(items) {
    for (const doc of items) {
      processedCount++;

      try {
        const id = doc._id.toString();
        const userId = doc.user ? doc.user.toString() : (doc.userId ? doc.userId.toString() : null);

        if (!userId) {
          console.warn(`[SKIP] Transaction ${id} missing user reference.`);
          skippedCount++;
          continue;
        }

        // Validate transaction type
        let rawType = (doc.type || 'debit').toString().toLowerCase().trim();
        const type = rawType === 'credit' ? 'credit' : 'debit';

        const transactionData = {
          userId,
          date: doc.date ? new Date(doc.date) : new Date(),
          description: doc.description || 'Untitled Transaction',
          amount: Math.abs(parseFloat(doc.amount) || 0),
          type,
          category: doc.category || 'Others',
          balance: doc.balance != null ? parseFloat(doc.balance) : null,
          uploadId: doc.uploadId ? doc.uploadId.toString() : null,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        };

        if (isDryRun) {
          insertedCount++;
          if (processedCount % 50 === 0 || processedCount === totalMongoRecords) {
            console.log(`[DRY RUN] Processed ${processedCount}/${totalMongoRecords} transactions...`);
          }
          continue;
        }

        // Idempotent upsert by primary key (id)
        const existing = await prisma.transaction.findUnique({
          where: { id },
        });

        if (existing) {
          await prisma.transaction.update({
            where: { id },
            data: transactionData,
          });
          updatedCount++;
        } else {
          await prisma.transaction.create({
            data: {
              id,
              ...transactionData,
            },
          });
          insertedCount++;
        }

        if (processedCount % 50 === 0 || processedCount === totalMongoRecords) {
          console.log(`Progress: ${processedCount}/${totalMongoRecords} (Inserted: ${insertedCount}, Updated: ${updatedCount})...`);
        }
      } catch (err) {
        errorCount++;
        console.error(`[ERROR] Failed to migrate transaction ${doc._id}: ${err.message}`);
      }
    }
  }
}

migrate().catch((err) => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
