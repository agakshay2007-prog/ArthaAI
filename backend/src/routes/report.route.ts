import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All reporting endpoints require authentication
router.use(authenticate);

// 1. Overview & Core Period Reports
router.get('/overview', asyncHandler(ReportController.getOverview));
router.get('/monthly', asyncHandler(ReportController.getMonthlyReport));
router.get('/quarterly', asyncHandler(ReportController.getQuarterlyReport));
router.get('/annual', asyncHandler(ReportController.getAnnualReport));
router.get('/custom', asyncHandler(ReportController.getCustomReport));

// 2. Specific Analytical Modules
router.get('/categories', asyncHandler(ReportController.getCategoryAnalysis));
router.get('/cash-flow', asyncHandler(ReportController.getCashFlowAnalysis));
router.get('/budgets', asyncHandler(ReportController.getBudgetPerformance));
router.get('/savings', asyncHandler(ReportController.getSavingsPerformance));
router.get('/bills', asyncHandler(ReportController.getBillsAnalysis));

// 3. AI Insights for Selected Report
router.post('/ai-insights', asyncHandler(ReportController.getAIReportInsights));

// 4. File Exports
router.get('/export/pdf', asyncHandler(ReportController.exportPdf));
router.get('/export/excel', asyncHandler(ReportController.exportExcel));
router.get('/export/csv', asyncHandler(ReportController.exportCsv));

export default router;

