import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Transaction, amountToCents, centsToAmount, STANDARD_CATEGORIES } from '../models/transaction.model.js';
import { isDatabaseReady } from '../config/database.js';
import { AppError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import {
  PaginationMetadata,
  TransactionResponse,
  CategoryExpenseBreakdown,
  MonthlyFlowPoint,
  TransactionSummaryData,
} from '../types/index.js';

const requireDatabaseReady = () => {
  if (!isDatabaseReady()) {
    throw AppError.serviceUnavailable(
      'Database is unconfigured. Please configure MONGODB_URI in backend/.env to access transaction persistence.'
    );
  }
};

const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.user || !req.user.id) {
    throw AppError.unauthorized('Authentication required');
  }
  return req.user.id;
};

/**
 * Helper to build Date range filters from common filter names
 */
const getDateRangeFromFilter = (
  filter?: string,
  customStart?: string,
  customEnd?: string
): { startDate?: Date; endDate?: Date } => {
  if (customStart || customEnd) {
    const range: { startDate?: Date; endDate?: Date } = {};
    if (customStart) range.startDate = new Date(customStart);
    if (customEnd) range.endDate = new Date(customEnd);
    return range;
  }

  const now = new Date();
  switch (filter) {
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }
    case 'last_30_days': {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: start, endDate: now };
    }
    case 'quarter_to_date': {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), quarterMonth, 1, 0, 0, 0, 0);
      return { startDate: start, endDate: now };
    }
    case 'year_to_date': {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      return { startDate: start, endDate: now };
    }
    default:
      return {};
  }
};

/**
 * POST /api/transactions
 * Create a new financial transaction
 */
export const createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const {
    title,
    description,
    amount,
    type,
    category,
    merchant,
    paymentMethod,
    transactionDate,
    notes,
    account,
    status,
  } = req.body;

  // Validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw AppError.badRequest('Transaction title is required');
  }

  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    throw AppError.badRequest('Valid transaction amount is required');
  }

  const numericAmount = Number(amount);
  if (numericAmount <= 0) {
    throw AppError.badRequest('Transaction amount must be strictly greater than zero');
  }

  if (!type || (type !== 'income' && type !== 'expense')) {
    throw AppError.badRequest("Transaction type must be either 'income' or 'expense'");
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    throw AppError.badRequest('Transaction category is required');
  }

  // Integer precision conversion
  const amountInCents = amountToCents(numericAmount);

  // Parse transactionDate safely
  let parsedDate = new Date();
  if (transactionDate) {
    const d = new Date(transactionDate);
    if (!isNaN(d.getTime())) {
      parsedDate = d;
    }
  }

  const newTx = await Transaction.create({
    userId: new mongoose.Types.ObjectId(userId),
    title: title.trim(),
    description: description ? String(description).trim() : undefined,
    amountInCents,
    type,
    category: category.trim(),
    merchant: merchant ? String(merchant).trim() : undefined,
    paymentMethod: paymentMethod || 'bank_transfer',
    transactionDate: parsedDate,
    notes: notes ? String(notes).trim() : undefined,
    account: account ? String(account).trim() : 'Primary Checking',
    status: status || 'completed',
  });

  const formatted = newTx.toJSON() as unknown as TransactionResponse;
  ApiResponse.created(res, 'Transaction created successfully', formatted);
};

/**
 * GET /api/transactions
 * List paginated transactions with search, date & category filtering
 */
export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const search = req.query.search || req.query.q;
  const type = req.query.type;
  const category = req.query.category;
  const dateFilter = req.query.dateFilter as string | undefined;
  const startDateParam = req.query.startDate as string | undefined;
  const endDateParam = req.query.endDate as string | undefined;
  const sortParam = (req.query.sort as string) || '-transactionDate -createdAt';

  // Base query strictly scoped to current user
  const query: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  // Type filter
  if (type === 'income' || type === 'expense') {
    query.type = type;
  }

  // Category filter
  if (category && category !== 'all') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  // Search filter (title, merchant, notes)
  if (search && typeof search === 'string' && search.trim()) {
    const s = search.trim();
    query.$or = [
      { title: { $regex: s, $options: 'i' } },
      { merchant: { $regex: s, $options: 'i' } },
      { notes: { $regex: s, $options: 'i' } },
    ];
  }

  // Date range filter
  const { startDate, endDate } = getDateRangeFromFilter(dateFilter, startDateParam, endDateParam);
  if (startDate || endDate) {
    const dateQuery: Record<string, Date> = {};
    if (startDate) dateQuery.$gte = startDate;
    if (endDate) dateQuery.$lte = endDate;
    query.transactionDate = dateQuery;
  }

  const total = await Transaction.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;

  const records = await Transaction.find(query)
    .sort(sortParam)
    .skip((page - 1) * limit)
    .limit(limit);

  const pagination: PaginationMetadata = {
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };

  ApiResponse.success(
    res,
    'Transactions retrieved successfully',
    {
      transactions: records.map((r) => r.toJSON() as unknown as TransactionResponse),
      pagination,
    }
  );
};

/**
 * GET /api/transactions/:id
 * Retrieve a specific transaction with ownership verification
 */
export const getTransactionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid transaction ID format');
  }

  const tx = await Transaction.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!tx) {
    throw AppError.notFound('Transaction not found or access denied');
  }

  ApiResponse.success(res, 'Transaction retrieved successfully', tx.toJSON() as unknown as TransactionResponse);
};

/**
 * PATCH /api/transactions/:id
 * Update an existing transaction with ownership verification
 */
export const updateTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid transaction ID format');
  }

  const tx = await Transaction.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!tx) {
    throw AppError.notFound('Transaction not found or access denied');
  }

  const {
    title,
    description,
    amount,
    type,
    category,
    merchant,
    paymentMethod,
    transactionDate,
    notes,
    account,
    status,
  } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      throw AppError.badRequest('Transaction title cannot be empty');
    }
    tx.title = title.trim();
  }

  if (amount !== undefined) {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      throw AppError.badRequest('Transaction amount must be strictly greater than zero');
    }
    tx.amountInCents = amountToCents(num);
  }

  if (type !== undefined) {
    if (type !== 'income' && type !== 'expense') {
      throw AppError.badRequest("Transaction type must be 'income' or 'expense'");
    }
    tx.type = type;
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || !category.trim()) {
      throw AppError.badRequest('Transaction category cannot be empty');
    }
    tx.category = category.trim();
  }

  if (description !== undefined) tx.description = description ? String(description).trim() : undefined;
  if (merchant !== undefined) tx.merchant = merchant ? String(merchant).trim() : undefined;
  if (paymentMethod !== undefined) tx.paymentMethod = paymentMethod;
  if (notes !== undefined) tx.notes = notes ? String(notes).trim() : undefined;
  if (account !== undefined) tx.account = String(account).trim();
  if (status !== undefined) tx.status = status;

  if (transactionDate !== undefined) {
    const d = new Date(transactionDate);
    if (!isNaN(d.getTime())) {
      tx.transactionDate = d;
    }
  }

  await tx.save();

  ApiResponse.success(res, 'Transaction updated successfully', tx.toJSON() as unknown as TransactionResponse);
};

/**
 * DELETE /api/transactions/:id
 * Delete a transaction with ownership verification
 */
export const deleteTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid transaction ID format');
  }

  const tx = await Transaction.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!tx) {
    throw AppError.notFound('Transaction not found or access denied');
  }

  ApiResponse.success(res, 'Transaction deleted successfully', null);
};

/**
 * GET /api/transactions/summary
 * Compute financial summary with integer arithmetic
 */
export const getTransactionSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const dateFilter = (req.query.dateFilter as string) || 'this_month';
  const customStart = req.query.startDate as string | undefined;
  const customEnd = req.query.endDate as string | undefined;

  const { startDate, endDate } = getDateRangeFromFilter(dateFilter, customStart, customEnd);

  const matchQuery: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (startDate || endDate) {
    const dQuery: Record<string, Date> = {};
    if (startDate) dQuery.$gte = startDate;
    if (endDate) dQuery.$lte = endDate;
    matchQuery.transactionDate = dQuery;
  }

  // Retrieve all user transactions within period
  const transactions = await Transaction.find(matchQuery).sort({ transactionDate: 1 });

  let totalIncomeInCents = 0;
  let totalExpensesInCents = 0;
  const categoryExpensesMap = new Map<string, { count: number; totalInCents: number }>();
  const monthlyFlowMap = new Map<string, { incomeInCents: number; expensesInCents: number }>();

  for (const tx of transactions) {
    const monthKey = tx.transactionDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    if (!monthlyFlowMap.has(monthKey)) {
      monthlyFlowMap.set(monthKey, { incomeInCents: 0, expensesInCents: 0 });
    }
    const monthFlow = monthlyFlowMap.get(monthKey)!;

    if (tx.type === 'income') {
      totalIncomeInCents += tx.amountInCents;
      monthFlow.incomeInCents += tx.amountInCents;
    } else {
      totalExpensesInCents += tx.amountInCents;
      monthFlow.expensesInCents += tx.amountInCents;

      // Category tracking
      const catKey = tx.category || 'Other';
      if (!categoryExpensesMap.has(catKey)) {
        categoryExpensesMap.set(catKey, { count: 0, totalInCents: 0 });
      }
      const catData = categoryExpensesMap.get(catKey)!;
      catData.count += 1;
      catData.totalInCents += tx.amountInCents;
    }
  }

  const netBalanceInCents = totalIncomeInCents - totalExpensesInCents;
  const totalSavingsInCents = Math.max(0, netBalanceInCents);

  const savingsRatePercentage =
    totalIncomeInCents > 0
      ? Math.max(0, Math.min(100, Math.round(((totalIncomeInCents - totalExpensesInCents) / totalIncomeInCents) * 100)))
      : 0;

  // Format category breakdowns
  const categoryBreakdown: CategoryExpenseBreakdown[] = Array.from(categoryExpensesMap.entries())
    .map(([cat, data]) => {
      const percentage =
        totalExpensesInCents > 0 ? Math.round((data.totalInCents / totalExpensesInCents) * 100) : 0;
      return {
        category: cat,
        totalAmountInCents: data.totalInCents,
        totalAmount: centsToAmount(data.totalInCents),
        transactionCount: data.count,
        percentage,
      };
    })
    .sort((a, b) => b.totalAmountInCents - a.totalAmountInCents);

  // Format monthly cash flow
  const monthlyCashFlow: MonthlyFlowPoint[] = Array.from(monthlyFlowMap.entries()).map(([month, flow]) => ({
    month,
    incomeInCents: flow.incomeInCents,
    income: centsToAmount(flow.incomeInCents),
    expensesInCents: flow.expensesInCents,
    expenses: centsToAmount(flow.expensesInCents),
    netSavingsInCents: flow.incomeInCents - flow.expensesInCents,
    netSavings: centsToAmount(flow.incomeInCents - flow.expensesInCents),
  }));

  const summaryData: TransactionSummaryData = {
    period: dateFilter,
    totalIncomeInCents,
    totalIncome: centsToAmount(totalIncomeInCents),
    totalExpensesInCents,
    totalExpenses: centsToAmount(totalExpensesInCents),
    netBalanceInCents,
    netBalance: centsToAmount(netBalanceInCents),
    totalSavingsInCents,
    totalSavings: centsToAmount(totalSavingsInCents),
    savingsRatePercentage,
    transactionCount: transactions.length,
    categoryBreakdown,
    monthlyCashFlow,
  };

  ApiResponse.success(res, 'Transaction summary computed successfully', summaryData);
};

/**
 * GET /api/transactions/categories
 * Returns standard and user-custom transaction categories
 */
export const getTransactionCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  // Distinct categories used by user in addition to standard categories
  const userCategories = await Transaction.distinct('category', {
    userId: new mongoose.Types.ObjectId(userId),
  });

  const combined = Array.from(new Set([...STANDARD_CATEGORIES, ...userCategories])).filter(Boolean);

  ApiResponse.success(res, 'Categories retrieved successfully', { categories: combined });
};
