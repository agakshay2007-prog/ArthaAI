import { Router, Request, Response } from 'express';
import healthRouter from './health.route.js';
import authRouter from './auth.route.js';
import transactionRouter from './transaction.route.js';

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
    },
  });
});

// Mount routes
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/transactions', transactionRouter);

export default router;
