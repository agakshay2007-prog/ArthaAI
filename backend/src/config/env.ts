import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export type Environment = 'development' | 'production' | 'test';

export interface AppConfig {
  NODE_ENV: Environment;
  PORT: number;
  MONGODB_URI: string;
  CLIENT_ORIGIN: string;
  ALLOWED_ORIGINS: string[];
  API_PREFIX: string;
  BODY_LIMIT: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  COOKIE_NAME: string;
  COOKIE_MAX_AGE_MS: number;
  BCRYPT_SALT_ROUNDS: number;
}

const parseEnvironment = (envStr?: string): Environment => {
  if (envStr === 'production' || envStr === 'test') {
    return envStr;
  }
  return 'development';
};

const parsePort = (portStr?: string): number => {
  const parsed = parseInt(portStr || '5000', 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
    console.warn(`[Config] Invalid PORT value "${portStr}". Defaulting to port 5000.`);
    return 5000;
  }
  return parsed;
};

const parseMongoUri = (uri?: string): string => {
  if (!uri || !uri.trim()) {
    return '';
  }
  const trimmed = uri.trim();
  const isValidFormat = trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://');
  if (!isValidFormat) {
    console.warn(
      '[Config] MONGODB_URI does not match standard protocol prefix ("mongodb://" or "mongodb+srv://").'
    );
  }
  return trimmed;
};

const parseJwtSecret = (secret?: string, nodeEnv?: Environment): string => {
  if (secret && secret.trim().length >= 16) {
    return secret.trim();
  }
  if (nodeEnv === 'production') {
    console.error(
      '[Security Alert] JWT_SECRET must be at least 16 characters in production environments.'
    );
  }
  // Development default secret (clearly segregated from production)
  return 'artha-ai-dev-jwt-insecure-secret-key-replace-in-production-32chars';
};

const rawClientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawClientOrigin
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const currentEnv = parseEnvironment(process.env.NODE_ENV);

export const env: AppConfig = {
  NODE_ENV: currentEnv,
  PORT: parsePort(process.env.PORT),
  MONGODB_URI: parseMongoUri(process.env.MONGODB_URI),
  CLIENT_ORIGIN: rawClientOrigin,
  ALLOWED_ORIGINS: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:5173'],
  API_PREFIX: process.env.API_PREFIX || '/api',
  BODY_LIMIT: '1mb',
  JWT_SECRET: parseJwtSecret(process.env.JWT_SECRET, currentEnv),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: 'artha_auth_token',
  COOKIE_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  BCRYPT_SALT_ROUNDS: 10,
};
