import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Budget } from '../models/budget.model.js';
import { amountToCents } from '../models/transaction.model.js';
import { BudgetService } from '../services/budget.service.js';
import { isDatabaseReady } from '../config/database.js';
import { AppError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { PaginationMetadata } from '../types/index.js';

const requireDatabaseReady = () => {
  if (!isDatabaseReady()) {
    throw AppError.serviceUnavailable(
      'Database is unconfigured. Please configure MONGODB_URI in backend/.env to access budget persistence.'
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
 * POST /api/budgets
 * Create a new spending budget
 */
export const createBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const {
    name,
    description,
    period = 'monthly',
    category,
    limit,
    startDate,
    endDate,
    alertThresholds,
    currency,
    isActive = true,
  } = req.body;

  // Input Validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw AppError.badRequest('Budget name is required');
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    throw AppError.badRequest('Budget category is required');
  }

  if (period !== 'monthly' && period !== 'yearly') {
    throw AppError.badRequest("Budget period must be either 'monthly' or 'yearly'");
  }

  if (limit === undefined || limit === null || isNaN(Number(limit))) {
    throw AppError.badRequest('Valid budget spending limit is required');
  }

  const numericLimit = Number(limit);
  if (numericLimit <= 0) {
    throw AppError.badRequest('Budget limit must be strictly greater than zero');
  }

  if (!startDate) {
    throw AppError.badRequest('Start date is required');
  }

  if (!endDate) {
    throw AppError.badRequest('End date is required');
  }

  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);

  if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    throw AppError.badRequest('Invalid start or end date format');
  }

  if (parsedEnd <= parsedStart) {
    throw AppError.badRequest('End date must be strictly after start date');
  }

  if (alertThresholds !== undefined) {
    if (
      !Array.isArray(alertThresholds) ||
      !alertThresholds.every((t) => typeof t === 'number' && t > 0 && t <= 200)
    ) {
      throw AppError.badRequest('Alert thresholds must be an array of percentages between 1 and 200');
    }
  }

  const limitInCents = amountToCents(numericLimit);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Check for duplicate active budget overlapping the same period and category
  const existingDuplicate = await Budget.findOne({
    userId: userObjectId,
    category: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
    period,
    isActive: true,
    $or: [{ startDate: { $lte: parsedEnd }, endDate: { $gte: parsedStart } }],
  });

  if (existingDuplicate) {
    throw AppError.badRequest(
      `An active ${period} budget already exists for category "${category.trim()}" in this date window.`
    );
  }

  const newBudget = await Budget.create({
    userId: userObjectId,
    name: name.trim(),
    description: description ? String(description).trim() : undefined,
    period,
    category: category.trim(),
    limitInCents,
    currency: currency ? String(currency).trim() : 'USD',
    startDate: parsedStart,
    endDate: parsedEnd,
    alertThresholds: alertThresholds || [50, 75, 90, 100],
    isActive,
  });

  const enriched = await BudgetService.enrichBudget(newBudget);
  ApiResponse.created(res, 'Budget created successfully', enriched);
};

/**
 * GET /api/budgets
 * Retrieve paginated user-owned budgets with calculated spending and utilization
 */
export const getBudgets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const period = req.query.period as string | undefined;
  const category = req.query.category as string | undefined;
  const isActive = req.query.isActive as string | undefined;
  const search = (req.query.search || req.query.q) as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const sort = (req.query.sort as string) || '-startDate -createdAt';

  const query: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (period === 'monthly' || period === 'yearly') {
    query.period = period;
  }

  if (category && category !== 'all') {
    query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    if (startDate) query.endDate = { $gte: new Date(startDate) };
    if (endDate) query.startDate = { $lte: new Date(endDate) };
  }

  const total = await Budget.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;

  const budgetDocs = await Budget.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const enrichedBudgets = await Promise.all(
    budgetDocs.map((doc) => BudgetService.enrichBudget(doc))
  );

  const pagination: PaginationMetadata = {
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };

  ApiResponse.success(
    res,
    'Budgets retrieved successfully',
    {
      budgets: enrichedBudgets,
      pagination,
    }
  );
};

/**
 * GET /api/budgets/overview
 * Comprehensive overview of limits, spending, utilization and threshold alerts
 */
export const getBudgetOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);
  const period = req.query.period as 'monthly' | 'yearly' | undefined;

  const overview = await BudgetService.computeOverview(userId, period);
  ApiResponse.success(res, 'Budget overview computed successfully', overview);
};

/**
 * GET /api/budgets/history
 * Historical and expired budgets with performance metrics
 */
export const getBudgetHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const now = new Date();

  const query: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
    $or: [{ endDate: { $lt: now } }, { isActive: false }],
  };

  const total = await Budget.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;

  const budgetDocs = await Budget.find(query)
    .sort({ endDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const enriched = await Promise.all(
    budgetDocs.map((doc) => BudgetService.enrichBudget(doc))
  );

  const pagination: PaginationMetadata = {
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };

  ApiResponse.success(
    res,
    'Budget history retrieved successfully',
    {
      budgets: enriched,
      pagination,
    }
  );
};

/**
 * GET /api/budgets/:id
 * Retrieve a specific budget with calculated metrics and alerts
 */
export const getBudgetById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid budget ID format');
  }

  const budgetDoc = await Budget.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!budgetDoc) {
    throw AppError.notFound('Budget not found or access denied');
  }

  const enriched = await BudgetService.enrichBudget(budgetDoc);
  ApiResponse.success(res, 'Budget retrieved successfully', enriched);
};

/**
 * GET /api/budgets/:id/analytics
 * Retrieve spending trends, daily cadence and forecast for a specific budget
 */
export const getBudgetAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid budget ID format');
  }

  const budgetDoc = await Budget.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!budgetDoc) {
    throw AppError.notFound('Budget not found or access denied');
  }

  const analytics = await BudgetService.computeAnalytics(budgetDoc);
  ApiResponse.success(res, 'Budget analytics computed successfully', analytics);
};

/**
 * PATCH /api/budgets/:id
 * Update an existing budget with ownership verification
 */
export const updateBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid budget ID format');
  }

  const budgetDoc = await Budget.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!budgetDoc) {
    throw AppError.notFound('Budget not found or access denied');
  }

  const {
    name,
    description,
    period,
    category,
    limit,
    startDate,
    endDate,
    alertThresholds,
    currency,
    isActive,
  } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      throw AppError.badRequest('Budget name cannot be empty');
    }
    budgetDoc.name = name.trim();
  }

  if (description !== undefined) {
    budgetDoc.description = description ? String(description).trim() : undefined;
  }

  if (period !== undefined) {
    if (period !== 'monthly' && period !== 'yearly') {
      throw AppError.badRequest("Budget period must be either 'monthly' or 'yearly'");
    }
    budgetDoc.period = period;
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || !category.trim()) {
      throw AppError.badRequest('Budget category cannot be empty');
    }
    budgetDoc.category = category.trim();
  }

  if (limit !== undefined) {
    const num = Number(limit);
    if (isNaN(num) || num <= 0) {
      throw AppError.badRequest('Budget limit must be strictly greater than zero');
    }
    budgetDoc.limitInCents = amountToCents(num);
  }

  if (currency !== undefined) {
    budgetDoc.currency = String(currency).trim() || 'USD';
  }

  if (isActive !== undefined) {
    budgetDoc.isActive = Boolean(isActive);
  }

  let newStart = budgetDoc.startDate;
  let newEnd = budgetDoc.endDate;

  if (startDate !== undefined) {
    const d = new Date(startDate);
    if (isNaN(d.getTime())) {
      throw AppError.badRequest('Invalid start date format');
    }
    newStart = d;
  }

  if (endDate !== undefined) {
    const d = new Date(endDate);
    if (isNaN(d.getTime())) {
      throw AppError.badRequest('Invalid end date format');
    }
    newEnd = d;
  }

  if (newEnd <= newStart) {
    throw AppError.badRequest('End date must be strictly after start date');
  }

  budgetDoc.startDate = newStart;
  budgetDoc.endDate = newEnd;

  if (alertThresholds !== undefined) {
    if (
      !Array.isArray(alertThresholds) ||
      !alertThresholds.every((t) => typeof t === 'number' && t > 0 && t <= 200)
    ) {
      throw AppError.badRequest('Alert thresholds must be an array of percentages between 1 and 200');
    }
    budgetDoc.alertThresholds = alertThresholds;
  }

  await budgetDoc.save();

  const enriched = await BudgetService.enrichBudget(budgetDoc);
  ApiResponse.success(res, 'Budget updated successfully', enriched);
};

/**
 * DELETE /api/budgets/:id
 * Delete a budget with ownership verification (preserves all transactions)
 */
export const deleteBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);
  const id = String(req.params.id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid budget ID format');
  }

  const budgetDoc = await Budget.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!budgetDoc) {
    throw AppError.notFound('Budget not found or access denied');
  }

  ApiResponse.success(res, 'Budget deleted successfully (transactions preserved)', null);
};
