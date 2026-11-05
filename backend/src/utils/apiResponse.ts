import { Response } from 'express';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message = 'Success',
    data?: T,
    statusCode = 200
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, message = 'Resource created successfully', data?: T): Response {
    return this.success(res, message, data, 201);
  }
}

