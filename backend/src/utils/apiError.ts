export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', details?: unknown): AppError {
    return new AppError(message, 400, details);
  }

  static unauthorized(message = 'Unauthorized access', details?: unknown): AppError {
    return new AppError(message, 401, details);
  }

  static forbidden(message = 'Forbidden resource', details?: unknown): AppError {
    return new AppError(message, 403, details);
  }

  static notFound(message = 'Resource not found', details?: unknown): AppError {
    return new AppError(message, 404, details);
  }

  static serviceUnavailable(message = 'Service unavailable', details?: unknown): AppError {
    return new AppError(message, 503, details);
  }

  static internal(message = 'Internal server error', details?: unknown): AppError {
    return new AppError(message, 500, details, false);
  }
}
