import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getTransactionCategories,
} from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Require authentication for all transaction routes
router.use(authenticate);

// Aggregated & meta routes (defined before :id parameter routes)
router.get('/summary', asyncHandler(getTransactionSummary));
router.get('/categories', asyncHandler(getTransactionCategories));

// Core CRUD endpoints
router.post('/', asyncHandler(createTransaction));
router.get('/', asyncHandler(getTransactions));
router.get('/:id', asyncHandler(getTransactionById));
router.patch('/:id', asyncHandler(updateTransaction));
router.delete('/:id', asyncHandler(deleteTransaction));

export default router;
