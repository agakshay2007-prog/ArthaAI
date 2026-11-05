import { Router } from 'express';
import {
  createGoal,
  getGoals,
  getSavingsOverview,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
  getGoalContributions,
  deleteContribution,
  getGoalAnalytics,
} from '../controllers/savings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Protect all savings goals endpoints with JWT / session authentication
router.use(authenticate);

// Portfolio overview
router.get('/overview', asyncHandler(getSavingsOverview));

// Goals CRUD
router.post('/', asyncHandler(createGoal));
router.get('/', asyncHandler(getGoals));
router.get('/:id', asyncHandler(getGoalById));
router.patch('/:id', asyncHandler(updateGoal));
router.delete('/:id', asyncHandler(deleteGoal));

// Analytics
router.get('/:id/analytics', asyncHandler(getGoalAnalytics));

// Contribution Sub-Ledger
router.post('/:id/contributions', asyncHandler(addContribution));
router.get('/:id/contributions', asyncHandler(getGoalContributions));
router.delete('/:id/contributions/:contributionId', asyncHandler(deleteContribution));

export default router;
