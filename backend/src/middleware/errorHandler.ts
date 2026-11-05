import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/apiError.js';
import { env } from '../config/env.js';

interface BodyParserError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
}

interface MongoDuplicateKeyError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError | BodyParserError | MongoDuplicateKeyError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'An unexpected internal server error occurred';
  let details: unknown = undefined;
  let isOperational = false;

  // 1. Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    isOperational = err.isOperational;
  }
  // 2. Body Parser: Payload Too Large (413)
  else if ('type' in err && err.type === 'entity.too.large') {
    statusCode = 413;
    message = `Request payload exceeds size limit of ${env.BODY_LIMIT}`;
    isOperational = true;
  }
  // 3. Body Parser: Malformed JSON syntax (400)
  else if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    statusCode = 400;
    message = 'Malformed JSON body syntax';
    isOperational = true;
  }
  // 4. Mongoose: Validation Error (400)
  else if ('name' in err && err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation constraint failed';
    details = err;
    isOperational = true;
  }
  // 5. Mongoose: CastError (400)
  else if ('name' in err && err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format';
    isOperational = true;
  }
  // 6. MongoDB: Duplicate Key Error (409)
  else if ('code' in err && err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value violates unique constraint';
    details = (err as MongoDuplicateKeyError).keyValue;
    isOperational = true;
  }
  // 7. Generic HTTP status errors
  else if ('statusCode' in err && typeof (err as BodyParserError).statusCode === 'number') {
    statusCode = (err as BodyParserError).statusCode!;
    message = err.message || message;
    isOperational = true;
  } else if ('status' in err && typeof (err as BodyParserError).status === 'number') {
    statusCode = (err as BodyParserError).status!;
    message = err.message || message;
    isOperational = true;
  } else if (err.message) {
    message = err.message;
  }

  // Log non-operational internal errors
  if (!isOperational && env.NODE_ENV !== 'test') {
    console.error('[Unhandled Server Exception]', err);
  }

  // In production, do not leak internal non-operational error details or messages
  const safeMessage =
    !isOperational && env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : message;

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(details ? { details } : {}),
    ...(env.NODE_ENV === 'development'
      ? {
        stack: err.stack,
        isOperational,
      }
      : {}),
    timestamp: new Date().toISOString(),
  });
};
