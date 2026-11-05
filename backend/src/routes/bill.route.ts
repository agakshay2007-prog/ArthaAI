import { Router } from 'express';
import { BillController } from '../controllers/bill.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All bill endpoints require authentication
router.use(authenticate);

// Collection & aggregate routes (must precede /:id)
router.post('/', asyncHandler(BillController.createBill));
router.get('/', asyncHandler(BillController.getBills));
router.get('/overview', asyncHandler(BillController.getBillOverview));
router.get('/upcoming', asyncHandler(BillController.getUpcomingBills));

// Individual bill routes
router.get('/:id', asyncHandler(BillController.getBillById));
router.patch('/:id', asyncHandler(BillController.updateBill));
router.delete('/:id', asyncHandler(BillController.deleteBill));

// Bill payment routes
router.post('/:id/payments', asyncHandler(BillController.recordPayment));
router.get('/:id/payments', asyncHandler(BillController.getBillPayments));
router.delete('/:id/payments/:paymentId', asyncHandler(BillController.revertPayment));

// Bill analytics route
router.get('/:id/analytics', asyncHandler(BillController.getBillAnalytics));

export default router;
