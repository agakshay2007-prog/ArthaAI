import { Router } from 'express';
import { getHealth, getLiveness, getReadiness } from '../controllers/health.controller.js';

const router = Router();

// Full health inspection
router.get('/', getHealth);

// Kubernetes / Orchestrator standard probes
router.get('/live', getLiveness);
router.get('/ready', getReadiness);

export default router;
