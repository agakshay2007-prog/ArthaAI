import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env.js';

export interface TokenPayload {
  id: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const setAuthCookie = (res: Response, token: string): void => {
  const isProduction = env.NODE_ENV === 'production';

  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: env.COOKIE_MAX_AGE_MS,
    path: '/',
  });
};

export const clearAuthCookie = (res: Response): void => {
  const isProduction = env.NODE_ENV === 'production';

  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
};
