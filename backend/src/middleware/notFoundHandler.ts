import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/apiError.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const normalizedUrl = (req.originalUrl || req.url || '').replace(/\/{2,}/g, '/');

  if (env.NODE_ENV !== 'test') {
    console.warn(
      `[Route 404] Method: ${req.method} | Path: ${req.path} | OriginalUrl: ${req.originalUrl} | ActiveUrl: ${req.url} | ConfiguredPrefix: ${env.API_PREFIX}`
    );
  }

  next(AppError.notFound(`Route not found: ${req.method} ${normalizedUrl}`));
};


