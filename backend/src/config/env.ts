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

const rawClientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawClientOrigin
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export const env: AppConfig = {
  NODE_ENV: parseEnvironment(process.env.NODE_ENV),
  PORT: parsePort(process.env.PORT),
  MONGODB_URI: parseMongoUri(process.env.MONGODB_URI),
  CLIENT_ORIGIN: rawClientOrigin,
  ALLOWED_ORIGINS: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:5173'],
  API_PREFIX: process.env.API_PREFIX || '/api',
  BODY_LIMIT: '1mb',
};
