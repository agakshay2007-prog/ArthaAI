import { Router, Request, Response } from 'express';
import healthRouter from './health.route.js';
import authRouter from './auth.route.js';
import transactionRouter from './transaction.route.js';
import budgetRouter from './budget.route.js';
import savingsRouter from './savings.route.js';
import billRouter from './bill.route.js';

const router = Router();

// Base API information endpoint
router.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'ArthaAI API Gateway',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      liveness: '/api/health/live',
      readiness: '/api/health/ready',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        profile: 'PATCH /api/auth/profile',
        changePassword: 'PATCH /api/auth/change-password',
      },
      transactions: {
        list: 'GET /api/transactions',
        create: 'POST /api/transactions',
        getById: 'GET /api/transactions/:id',
        update: 'PATCH /api/transactions/:id',
        delete: 'DELETE /api/transactions/:id',
        summary: 'GET /api/transactions/summary',
        categories: 'GET /api/transactions/categories',
      },
      budgets: {
        list: 'GET /api/budgets',
        create: 'POST /api/budgets',
        getById: 'GET /api/budgets/:id',
        update: 'PATCH /api/budgets/:id',
        delete: 'DELETE /api/budgets/:id',
        overview: 'GET /api/budgets/overview',
        analytics: 'GET /api/budgets/:id/analytics',
        history: 'GET /api/budgets/history',
      },
      savingsGoals: {
        list: 'GET /api/savings-goals',
        create: 'POST /api/savings-goals',
        getById: 'GET /api/savings-goals/:id',
        update: 'PATCH /api/savings-goals/:id',
        delete: 'DELETE /api/savings-goals/:id',
        overview: 'GET /api/savings-goals/overview',
        analytics: 'GET /api/savings-goals/:id/analytics',
        addContribution: 'POST /api/savings-goals/:id/contributions',
        getContributions: 'GET /api/savings-goals/:id/contributions',
        deleteContribution: 'DELETE /api/savings-goals/:id/contributions/:contributionId',
      },
      bills: {
        list: 'GET /api/bills',
        create: 'POST /api/bills',
        getById: 'GET /api/bills/:id',
        update: 'PATCH /api/bills/:id',
        delete: 'DELETE /api/bills/:id',
        overview: 'GET /api/bills/overview',
        upcoming: 'GET /api/bills/upcoming',
        recordPayment: 'POST /api/bills/:id/payments',
        getPayments: 'GET /api/bills/:id/payments',
        revertPayment: 'DELETE /api/bills/:id/payments/:paymentId',
        analytics: 'GET /api/bills/:id/analytics',
      },
    },
  });
});

// Mount routes
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/transactions', transactionRouter);
router.use('/budgets', budgetRouter);
router.use('/savings-goals', savingsRouter);
router.use('/bills', billRouter);

export default router;
