import { Router } from 'express';
import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetOverview,
  getBudgetAnalytics,
  getBudgetHistory,
} from '../controllers/budget.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Enforce authentication across all budget routes
router.use(authenticate);

// Aggregated & overview routes (defined before :id parameters)
router.get('/overview', asyncHandler(getBudgetOverview));
router.get('/history', asyncHandler(getBudgetHistory));

// Core CRUD and detail routes
router.post('/', asyncHandler(createBudget));
router.get('/', asyncHandler(getBudgets));
router.get('/:id', asyncHandler(getBudgetById));
router.get('/:id/analytics', asyncHandler(getBudgetAnalytics));
router.patch('/:id', asyncHandler(updateBudget));
router.delete('/:id', asyncHandler(deleteBudget));

export default router;
