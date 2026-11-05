import { Response } from 'express';
import mongoose from 'mongoose';
import { isDatabaseReady } from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
  SavingsGoal,
  amountToCents,
} from '../models/savings-goal.model.js';
import { GoalContribution } from '../models/goal-contribution.model.js';
import { SavingsService } from '../services/savings.service.js';
import { AppError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const requireDatabaseReady = () => {
  if (!isDatabaseReady()) {
    throw AppError.serviceUnavailable(
      'Database is unconfigured. Please configure MONGODB_URI in backend/.env to access savings persistence.'
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
 * POST /api/savings-goals
 * Creates a new savings goal with integer minor units
 */
export const createGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const {
    name,
    description,
    category,
    targetAmount,
    currentAmount,
    currency = 'USD',
    startDate,
    deadline,
    priority = 'medium',
    color = '#8b5cf6',
    iconName = 'Target',
  } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw AppError.badRequest('Goal name is required');
  }

  const parsedTarget = Number(targetAmount);
  if (isNaN(parsedTarget) || parsedTarget <= 0) {
    throw AppError.badRequest('Target amount must be a valid positive number greater than zero');
  }

  if (!deadline) {
    throw AppError.badRequest('Target deadline is required');
  }

  const parsedDeadline = new Date(deadline);
  if (isNaN(parsedDeadline.getTime())) {
    throw AppError.badRequest('Invalid deadline format');
  }

  const parsedStartDate = startDate ? new Date(startDate) : new Date();
  if (parsedDeadline.getTime() < parsedStartDate.getTime()) {
    throw AppError.badRequest('Deadline cannot be before start date');
  }

  const targetAmountInCents = amountToCents(parsedTarget);
  const parsedCurrent = Number(currentAmount) || 0;
  const currentAmountInCents = parsedCurrent > 0 ? amountToCents(parsedCurrent) : 0;

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Check initial milestones if initial amount provided
  const milestones = [];
  const initialProgress = (currentAmountInCents / targetAmountInCents) * 100;
  for (const step of [25, 50, 75, 100]) {
    if (initialProgress >= step) {
      milestones.push({ percentage: step, achievedAt: new Date() });
    }
  }

  const goal = await SavingsGoal.create({
    userId: userObjectId,
    name: name.trim(),
    description: description ? String(description).trim() : '',
    category: category || 'Emergency Fund',
    targetAmountInCents,
    currentAmountInCents,
    currency,
    startDate: parsedStartDate,
    deadline: parsedDeadline,
    status: currentAmountInCents >= targetAmountInCents ? 'completed' : 'in_progress',
    priority,
    color,
    iconName,
    milestones,
    completedAt: currentAmountInCents >= targetAmountInCents ? new Date() : undefined,
  });

  // If initial funds were provided, record an initial deposit contribution
  if (currentAmountInCents > 0) {
    await GoalContribution.create({
      userId: userObjectId,
      goalId: goal._id,
      amountInCents: currentAmountInCents,
      type: 'deposit',
      notes: 'Initial starting funds',
      contributionDate: parsedStartDate,
    });
  }

  const contributions = await GoalContribution.find({ goalId: goal._id }).sort({ contributionDate: -1 });
  const enriched = SavingsService.enrichGoal(goal, contributions);

  ApiResponse.created(res, 'Savings goal created successfully', enriched);
};

/**
 * GET /api/savings-goals
 * Lists user savings goals with status, category & pagination filters
 */
export const getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const { status, category, priority, search, page = '1', limit = '20' } = req.query;

  const query: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (status && typeof status === 'string' && status !== 'all') {
    query.status = status;
  }

  if (category && typeof category === 'string' && category !== 'all') {
    query.category = category;
  }

  if (priority && typeof priority === 'string' && priority !== 'all') {
    query.priority = priority;
  }

  if (search && typeof search === 'string' && search.trim()) {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [goals, total] = await Promise.all([
    SavingsGoal.find(query).sort({ deadline: 1 }).skip(skip).limit(limitNum),
    SavingsGoal.countDocuments(query),
  ]);

  const enrichedGoals = await Promise.all(
    goals.map(async (goal) => {
      const contributions = await GoalContribution.find({ goalId: goal._id })
        .sort({ contributionDate: -1 })
        .limit(5);
      return SavingsService.enrichGoal(goal, contributions);
    })
  );

  ApiResponse.success(res, 'Savings goals retrieved successfully', {
    goals: enrichedGoals,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * GET /api/savings-goals/overview
 * Returns aggregate portfolio progress, net savings pace, and recommendations
 */
export const getSavingsOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const overview = await SavingsService.computeOverview(userId);
  ApiResponse.success(res, 'Savings overview retrieved successfully', overview);
};

/**
 * GET /api/savings-goals/:id
 * Retrieves single goal details with recent contributions
 */
export const getGoalById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const id = req.params.id as string;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid savings goal ID format');
  }

  const goal = await SavingsGoal.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!goal) {
    throw AppError.notFound('Savings goal not found');
  }

  const contributions = await GoalContribution.find({ goalId: goal._id }).sort({ contributionDate: -1 });
  const enriched = SavingsService.enrichGoal(goal, contributions);

  ApiResponse.success(res, 'Savings goal retrieved successfully', enriched);
};

/**
 * PATCH /api/savings-goals/:id
 * Updates savings goal parameters
 */
export const updateGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const id = req.params.id as string;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid savings goal ID format');
  }

  const goal = await SavingsGoal.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!goal) {
    throw AppError.notFound('Savings goal not found');
  }

  const {
    name,
    description,
    category,
    targetAmount,
    deadline,
    status,
    priority,
    color,
    iconName,
  } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      throw AppError.badRequest('Goal name cannot be empty');
    }
    goal.name = name.trim();
  }

  if (description !== undefined) {
    goal.description = String(description).trim();
  }

  if (category !== undefined) {
    goal.category = category;
  }

  if (targetAmount !== undefined) {
    const parsedTarget = Number(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      throw AppError.badRequest('Target amount must be a positive number greater than zero');
    }
    goal.targetAmountInCents = amountToCents(parsedTarget);
  }

  if (deadline !== undefined) {
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      throw AppError.badRequest('Invalid deadline date format');
    }
    if (parsedDeadline.getTime() < new Date(goal.startDate).getTime()) {
      throw AppError.badRequest('Deadline cannot be before start date');
    }
    goal.deadline = parsedDeadline;
  }

  if (status !== undefined) {
    const validStatuses = ['in_progress', 'completed', 'paused', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw AppError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    goal.status = status;
    if (status === 'completed' && !goal.completedAt) {
      goal.completedAt = new Date();
    } else if (status !== 'completed') {
      goal.completedAt = undefined;
    }
  }

  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      throw AppError.badRequest(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }
    goal.priority = priority;
  }

  if (color !== undefined) goal.color = color;
  if (iconName !== undefined) goal.iconName = iconName;

  // Recalculate completion based on updated target
  if (goal.currentAmountInCents >= goal.targetAmountInCents) {
    goal.status = 'completed';
    if (!goal.completedAt) goal.completedAt = new Date();
  } else if (goal.status === 'completed' && goal.currentAmountInCents < goal.targetAmountInCents) {
    goal.status = 'in_progress';
    goal.completedAt = undefined;
  }

  await goal.save();

  const contributions = await GoalContribution.find({ goalId: goal._id }).sort({ contributionDate: -1 });
  const enriched = SavingsService.enrichGoal(goal, contributions);

  ApiResponse.success(res, 'Savings goal updated successfully', enriched);
};

/**
 * DELETE /api/savings-goals/:id
 * Deletes savings goal and associated contribution history.
 * Bank transactions are preserved intact.
 */
export const deleteGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const id = req.params.id as string;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid savings goal ID format');
  }

  await SavingsService.deleteGoal(userId, id);

  ApiResponse.success(res, 'Savings goal deleted', {
    id,
    message: 'Savings goal and contribution history deleted successfully',
  });
};

/**
 * POST /api/savings-goals/:id/contributions
 * Records a deposit or withdrawal contribution
 */
export const addContribution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const id = req.params.id as string;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid savings goal ID format');
  }

  const { amount, type = 'deposit', notes, contributionDate, transactionId } = req.body;

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw AppError.badRequest('Contribution amount must be a positive number greater than zero');
  }

  if (type !== 'deposit' && type !== 'withdrawal') {
    throw AppError.badRequest('Contribution type must be either "deposit" or "withdrawal"');
  }

  const result = await SavingsService.recordContribution(userId, id, {
    amount: parsedAmount,
    type,
    notes,
    contributionDate: contributionDate ? new Date(contributionDate) : new Date(),
    transactionId,
  });

  ApiResponse.created(res, 'Contribution recorded successfully', result);
};

/**
 * GET /api/savings-goals/:id/contributions
 * Retrieves paginated contribution history for a goal
 */
export const getGoalContributions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const id = req.params.id as string;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid savings goal ID format');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const goalObjectId = new mongoose.Types.ObjectId(id);

  const goal = await SavingsGoal.findOne({ _id: goalObjectId, userId: userObjectId });
  if (!goal) {
    throw AppError.notFound('Savings goal not found');
  }

  const { page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [contributions, total] = await Promise.all([
    GoalContribution.find({ goalId: goalObjectId, userId: userObjectId })
      .sort({ contributionDate: -1 })
      .skip(skip)
      .limit(limitNum),
    GoalContribution.countDocuments({ goalId: goalObjectId, userId: userObjectId }),
  ]);

  const formatted = contributions.map((c) => ({
    id: c._id.toString(),
    userId: c.userId.toString(),
    goalId: c.goalId.toString(),
    amountInCents: c.amountInCents,
    amount: c.amount,
    type: c.type,
    contributionDate: new Date(c.contributionDate).toISOString(),
    notes: c.notes,
    transactionId: c.transactionId ? c.transactionId.toString() : undefined,
    createdAt: new Date(c.createdAt).toISOString(),
    updatedAt: new Date(c.updatedAt).toISOString(),
  }));

  ApiResponse.success(res, 'Contribution history retrieved successfully', {
    contributions: formatted,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * DELETE /api/savings-goals/:id/contributions/:contributionId
 * Deletes a contribution and reverts balance
 */
export const deleteContribution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const id = req.params.id as string;
  const contributionId = req.params.contributionId as string;
  if (
    !id ||
    !contributionId ||
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(contributionId)
  ) {
    throw AppError.badRequest('Invalid ID format');
  }

  const updatedGoal = await SavingsService.deleteContribution(userId, id, contributionId);

  ApiResponse.success(res, 'Contribution deleted and balance reverted successfully', updatedGoal);
};

/**
 * GET /api/savings-goals/:id/analytics
 * Returns predictive velocity modeling and milestone progression
 */
export const getGoalAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  requireDatabaseReady();
  const userId = getUserId(req);

  const id = req.params.id as string;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid savings goal ID format');
  }

  const analytics = await SavingsService.computeGoalAnalytics(userId, id);
  ApiResponse.success(res, 'Goal analytics retrieved successfully', analytics);
};
