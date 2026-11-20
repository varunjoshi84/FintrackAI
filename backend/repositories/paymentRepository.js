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
    failureReason: p.failureReason,
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
      razorpayPaymentId: data.razorpayPaymentId || null,
      razorpayOrderId: data.razorpayOrderId,
      amount: parseFloat(data.amount),
      currency: data.currency || 'INR',
      plan: data.plan,
      billing: data.billing,
      status: data.status || 'pending',
      failureReason: data.failureReason || null,
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
 * Finds a payment record by razorpayPaymentId.
 */
const findByPaymentId = async (razorpayPaymentId) => {
  if (!razorpayPaymentId) return null;
  const payment = await prisma.payment.findUnique({
    where: {
      razorpayPaymentId,
    },
  });
  return mapPayment(payment);
};

/**
 * Finds the latest payment record by razorpayOrderId.
 */
const findByOrderId = async (razorpayOrderId) => {
  if (!razorpayOrderId) return null;
  const payment = await prisma.payment.findFirst({
    where: {
      razorpayOrderId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return mapPayment(payment);
};

/**
 * Updates a payment record by its internal UUID id or razorpayOrderId.
 */
const update = async (id, data) => {
  const updated = await prisma.payment.update({
    where: { id },
    data: {
      ...(data.razorpayPaymentId !== undefined && { razorpayPaymentId: data.razorpayPaymentId }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.failureReason !== undefined && { failureReason: data.failureReason }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
      ...(data.nextPaymentDate !== undefined && { nextPaymentDate: new Date(data.nextPaymentDate) }),
    },
  });
  return mapPayment(updated);
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
  findByPaymentId,
  findByOrderId,
  update,
  findByUser,
  findRecent,
  getTotalRevenue,
  deleteByUserId,
  mapPayment,
};
