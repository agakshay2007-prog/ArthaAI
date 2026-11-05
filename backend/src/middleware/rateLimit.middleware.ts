import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 1000 : 30, // 30 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
    timestamp: new Date().toISOString(),
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.NODE_ENV === 'test' ? 1000 : 20, // 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please slow down and try again shortly.',
    timestamp: new Date().toISOString(),
  },
});


