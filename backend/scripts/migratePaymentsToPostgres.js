/**
 * Data Migration Script: MongoDB -> PostgreSQL (Payments/Subscriptions)
 * 
 * Usage:
 *   node scripts/migratePaymentsToPostgres.js
 *   node scripts/migratePaymentsToPostgres.js --dry-run
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { prisma, connectPostgres } = require('../config/postgres');

const isDryRun = process.argv.includes('--dry-run');

async function migratePayments() {
  console.log('====================================================');
  console.log('🚀 FinTrackAI: Migrating Payments/Subscriptions to PostgreSQL');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (No writes)' : '💾 LIVE MIGRATION'}`);
  console.log('====================================================\n');

  await connectPostgres();

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ MongoDB Connected');

  const mongoPayments = await mongoose.connection.db.collection('payments').find().toArray();
  console.log(`Found ${mongoPayments.length} payment records in MongoDB.\n`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const doc of mongoPayments) {
    const id = doc._id.toString();
    const userId = doc.user ? doc.user.toString() : (doc.userId ? doc.userId.toString() : null);

    if (!userId) {
      console.warn(`[SKIP] Payment ${id} missing user reference.`);
      skippedCount++;
      continue;
    }

    const paymentData = {
      userId,
      razorpayPaymentId: doc.razorpayPaymentId || `payment_${id}`,
      razorpayOrderId: doc.razorpayOrderId || `order_${id}`,
      amount: parseFloat(doc.amount) || 0,
      currency: doc.currency || 'INR',
      plan: doc.plan || 'Pro',
      billing: doc.billing || 'monthly',
      status: doc.status || 'completed',
      startDate: doc.startDate ? new Date(doc.startDate) : new Date(),
      endDate: doc.endDate ? new Date(doc.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      nextPaymentDate: doc.nextPaymentDate ? new Date(doc.nextPaymentDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
    };

    if (isDryRun) {
      insertedCount++;
      continue;
    }

    const existing = await prisma.payment.findUnique({
      where: { id },
    });

    if (existing) {
      await prisma.payment.update({
        where: { id },
        data: paymentData,
      });
      updatedCount++;
    } else {
      await prisma.payment.create({
        data: {
          id,
          ...paymentData,
        },
      });
      insertedCount++;
    }
  }

  console.log('\n====================================================');
  console.log('🏁 Payments Migration Summary');
  console.log('====================================================');
  console.log(`Total in MongoDB:     ${mongoPayments.length}`);
  console.log(`Inserted in Postgres: ${insertedCount}`);
  console.log(`Updated in Postgres:  ${updatedCount}`);
  console.log(`Skipped:              ${skippedCount}`);
  console.log('====================================================\n');

  await mongoose.disconnect();
  await prisma.$disconnect();
}

migratePayments().catch((err) => {
  console.error('Fatal Payment Migration Error:', err);
  process.exit(1);
});
