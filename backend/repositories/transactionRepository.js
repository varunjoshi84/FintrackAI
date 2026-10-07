// Repositories / Transaction Repository
// Parameterized PostgreSQL data access for transactions via Prisma

const { prisma } = require('../config/postgres');

/**
 * Maps a Prisma Transaction record to a client-compatible object
 * returning both _id and id to preserve complete backward compatibility.
 */
const mapTransaction = (tx) => {
  if (!tx) return null;
  return {
    _id: tx.id,
    id: tx.id,
    user: tx.userId,
    userId: tx.userId,
    date: tx.date,
    description: tx.description,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    balance: tx.balance,
    uploadId: tx.uploadId,
    createdAt: tx.createdAt,
  };
};

/**
 * Creates a single transaction.
 */
const create = async (data) => {
  const created = await prisma.transaction.create({
    data: {
      id: data.id || undefined, // Allow providing id during migration/imports
      userId: String(data.user || data.userId),
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type.toLowerCase(),
      category: data.category || 'Others',
      balance: data.balance != null ? parseFloat(data.balance) : null,
      uploadId: data.uploadId || null,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    },
  });
  return mapTransaction(created);
};

/**
 * Batch inserts transactions (for statement parsing / CSV / PDF).
 */
const bulkCreate = async (transactionsArray) => {
  if (!transactionsArray || transactionsArray.length === 0) {
    return [];
  }

  const formatted = transactionsArray.map((t) => ({
    id: t.id || undefined,
    userId: String(t.user || t.userId),
    date: t.date ? new Date(t.date) : new Date(),
    description: t.description,
    amount: parseFloat(t.amount),
    type: t.type.toLowerCase(),
    category: t.category || 'Others',
    balance: t.balance != null ? parseFloat(t.balance) : null,
    uploadId: t.uploadId || null,
    createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
  }));

  // Prisma createMany is supported on PostgreSQL
  await prisma.transaction.createMany({
    data: formatted,
    skipDuplicates: true,
  });

  return formatted.map(mapTransaction);
};

/**
 * Finds paginated transactions for a user with category, type, and search filters.
 */
const findByUser = async ({
  userId,
  page = 1,
  limit = 10,
  category,
  type,
  search,
}) => {
  const where = {
    userId: String(userId),
  };

  if (category && category !== 'All Categories') {
    where.category = category;
  }

  if (type && type !== 'all') {
    where.type = type.toLowerCase();
  }

  if (search && search.trim()) {
    where.description = {
      contains: search.trim(),
      mode: 'insensitive',
    };
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    transactions: transactions.map(mapTransaction),
    total,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Finds a single transaction by ID and userId.
 */
const findById = async (id, userId) => {
  const tx = await prisma.transaction.findFirst({
    where: {
      id: String(id),
      userId: String(userId),
    },
  });
  return mapTransaction(tx);
};

/**
 * Updates a transaction by ID and userId.
 */
const update = async (id, userId, data) => {
  // First check if transaction exists and belongs to user
  const existing = await prisma.transaction.findFirst({
    where: {
      id: String(id),
      userId: String(userId),
    },
  });

  if (!existing) {
    return null;
  }

  const updateData = {};
  if (data.type !== undefined) updateData.type = data.type.toLowerCase();
  if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.balance !== undefined) updateData.balance = data.balance != null ? parseFloat(data.balance) : null;

  const updated = await prisma.transaction.update({
    where: { id: String(id) },
    data: updateData,
  });

  return mapTransaction(updated);
};

/**
 * Deletes a single transaction by ID and userId.
 */
const deleteById = async (id, userId) => {
  const existing = await prisma.transaction.findFirst({
    where: {
      id: String(id),
      userId: String(userId),
    },
  });

  if (!existing) {
    return null;
  }

  await prisma.transaction.delete({
    where: { id: String(id) },
  });

  return mapTransaction(existing);
};

/**
 * Deletes all transactions belonging to a user (used for user cleanup across databases).
 */
const deleteByUserId = async (userId) => {
  const result = await prisma.transaction.deleteMany({
    where: { userId: String(userId) },
  });
  return result.count;
};

/**
 * Counts distinct uploads this month for rate limiting.
 */
const countDistinctUploadsThisMonth = async (userId, startOfMonth) => {
  const distinctUploads = await prisma.transaction.groupBy({
    by: ['uploadId'],
    where: {
      userId: String(userId),
      uploadId: { not: null },
      createdAt: { gte: startOfMonth },
    },
  });
  return distinctUploads.length;
};

/**
 * Finds all transactions for a user and optional uploadId (for reports).
 */
const findByUserAndUploadId = async (userId, uploadId) => {
  const where = {
    userId: String(userId),
  };

  if (uploadId) {
    where.uploadId = uploadId;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'asc' },
  });

  return transactions.map(mapTransaction);
};

/**
 * Checks whether a user has any transactions.
 */
const hasTransactions = async (userId) => {
  const count = await prisma.transaction.count({
    where: { userId: String(userId) },
  });
  return count > 0;
};

/**
 * Computes monthly financial summary: total income, expenses, and net.
 */
const getMonthlySummary = async (userId, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const results = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      userId: String(userId),
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  let totalCredit = 0;
  let totalDebit = 0;
  let transactionCount = 0;

  for (const row of results) {
    if (row.type === 'credit') {
      totalCredit = row._sum.amount || 0;
    } else if (row.type === 'debit') {
      totalDebit = row._sum.amount || 0;
    }
    transactionCount += row._count.id;
  }

  return {
    year,
    month,
    income: totalCredit,
    expenses: totalDebit,
    netSavings: totalCredit - totalDebit,
    transactionCount,
  };
};

/**
 * Computes category-wise spend breakdown for debits within a date range.
 */
const getCategoryWiseSpend = async (userId, startDate, endDate) => {
  const where = {
    userId: String(userId),
    type: 'debit',
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const results = await prisma.transaction.groupBy({
    by: ['category'],
    where,
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        amount: 'desc',
      },
    },
  });

  return results.map((row) => ({
    category: row.category,
    total: row._sum.amount || 0,
    count: row._count.id,
  }));
};

module.exports = {
  create,
  bulkCreate,
  findByUser,
  findById,
  update,
  delete: deleteById,
  deleteByUserId,
  countDistinctUploadsThisMonth,
  findByUserAndUploadId,
  hasTransactions,
  getMonthlySummary,
  getCategoryWiseSpend,
  mapTransaction,
};
