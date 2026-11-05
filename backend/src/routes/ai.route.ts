import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { aiRateLimiter } from '../middleware/rateLimit.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All AI assistant endpoints require authentication
router.use(authenticate);

// AI Chat interaction (rate limited)
router.post('/chat', aiRateLimiter, asyncHandler(AIController.chat));

// Financial intelligence & context endpoints
router.get('/insights', asyncHandler(AIController.getInsights));
router.get('/context', asyncHandler(AIController.getContextStatus));

// Conversation management
router.get('/conversations', asyncHandler(AIController.getConversations));
router.delete('/conversations', asyncHandler(AIController.clearAllConversations));
router.get('/conversations/:id', asyncHandler(AIController.getConversationById));
router.delete('/conversations/:id', asyncHandler(AIController.deleteConversation));

export default router;
