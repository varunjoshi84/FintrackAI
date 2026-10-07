// Repositories / Payment Repository
// Parameterized PostgreSQL data access for payments & subscriptions via Prisma

const { prisma } = require('../config/postgres');

/**
 * Maps a Prisma Payment record to a client-compatible object
 * returning both _id and id to preserve complete backward compatibility.
 */
const mapPayment = (p) => {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.id,
    user: p.userId,
    userId: p.userId,
    razorpayPaymentId: p.razorpayPaymentId,
    razorpayOrderId: p.razorpayOrderId,
    amount: p.amount,
    currency: p.currency,
    plan: p.plan,
    billing: p.billing,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
    nextPaymentDate: p.nextPaymentDate,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

/**
 * Creates a payment/subscription record.
 */
const create = async (data) => {
  const created = await prisma.payment.create({
    data: {
      id: data.id || undefined,
      userId: String(data.user || data.userId),
      razorpayPaymentId: data.razorpayPaymentId,
      razorpayOrderId: data.razorpayOrderId,
      amount: parseFloat(data.amount),
      currency: data.currency || 'INR',
      plan: data.plan,
      billing: data.billing,
      status: data.status || 'pending',
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: new Date(data.endDate),
      nextPaymentDate: new Date(data.nextPaymentDate),
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    },
  });
  return mapPayment(created);
};

/**
 * Retrieves payment history for a user.
 */
const findByUser = async (userId, limit = 10) => {
  const payments = await prisma.payment.findMany({
    where: {
      userId: String(userId),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return payments.map(mapPayment);
};

/**
 * Retrieves sample/recent payments.
 */
const findRecent = async (limit = 3) => {
  const payments = await prisma.payment.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return payments.map(mapPayment);
};

/**
 * Calculates total revenue from completed/successful payments excluding demo IDs.
 */
const getTotalRevenue = async () => {
  const aggregate = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: {
        in: ['completed', 'success'],
      },
      NOT: {
        razorpayPaymentId: {
          startsWith: 'demo_',
        },
      },
    },
  });

  return aggregate._sum.amount || 0;
};

/**
 * Deletes all payments belonging to a user (used during user deletion cleanup).
 */
const deleteByUserId = async (userId) => {
  const result = await prisma.payment.deleteMany({
    where: {
      userId: String(userId),
    },
  });
  return result.count;
};

module.exports = {
  create,
  findByUser,
  findRecent,
  getTotalRevenue,
  deleteByUserId,
  mapPayment,
};
