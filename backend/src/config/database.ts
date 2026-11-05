import mongoose from 'mongoose';
import { env } from './env.js';

export interface DatabaseStatus {
  status: 'connected' | 'connecting' | 'disconnected' | 'disconnecting' | 'unconfigured';
  readyState: number;
  isReady: boolean;
  host?: string;
  name?: string;
}

const readyStateMap: Record<number, DatabaseStatus['status']> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

let listenersInitialized = false;

const setupConnectionListeners = (): void => {
  if (listenersInitialized) return;

  mongoose.connection.on('connected', () => {
    console.log(`[Database] MongoDB connection established successfully (host: ${mongoose.connection.host})`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', (err as Error).message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB connection disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB connection re-established.');
  });

  listenersInitialized = true;
};

export const isDatabaseReady = (): boolean => {
  return Boolean(env.MONGODB_URI) && mongoose.connection.readyState === 1;
};

export const getDatabaseStatus = (): DatabaseStatus => {
  if (!env.MONGODB_URI) {
    return {
      status: 'unconfigured',
      readyState: 0,
      isReady: false,
    };
  }

  const readyState = mongoose.connection.readyState;
  const status = readyStateMap[readyState] || 'disconnected';

  return {
    status,
    readyState,
    isReady: readyState === 1,
    host: mongoose.connection.host || undefined,
    name: mongoose.connection.name || undefined,
  };
};

export const connectDB = async (): Promise<boolean> => {
  if (!env.MONGODB_URI) {
    console.warn(
      '[Database] MONGODB_URI is not configured in environment. Operating in unconfigured database standby mode.'
    );
    return false;
  }

  setupConnectionListeners();

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    return true;
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB Atlas:', (error as Error).message);
    return false;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[Database] MongoDB connection closed gracefully.');
    }
  } catch (error) {
    console.error('[Database] Error while disconnecting MongoDB:', error);
  }
};
