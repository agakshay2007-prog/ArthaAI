import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Public Authentication endpoints with rate limiting
router.post('/register', authRateLimiter, asyncHandler(register));
router.post('/login', authRateLimiter, asyncHandler(login));
router.post('/logout', logout);

// Protected User Management endpoints
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, asyncHandler(updateProfile));
router.patch('/change-password', authRateLimiter, authenticate, asyncHandler(changePassword));

export default router;

