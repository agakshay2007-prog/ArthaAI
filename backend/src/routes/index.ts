import { Router, Request, Response } from 'express';
import healthRouter from './health.route.js';

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
    },
  });
});

// Mount health routes
router.use('/health', healthRouter);

export default router;
