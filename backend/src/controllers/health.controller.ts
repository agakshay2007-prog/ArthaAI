import { Request, Response } from 'express';
import { env } from '../config/env.js';
import { getDatabaseStatus, isDatabaseReady } from '../config/database.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { HealthStatus, DetailedHealthData, LivenessData, ReadinessData } from '../types/index.js';

/**
 * Liveness probe: verifies process is alive and receiving HTTP traffic.
 * Standard HTTP 200 response when alive.
 */
export const getLiveness = (_req: Request, res: Response): void => {
  const livenessPayload: LivenessData = {
    service: 'ArthaAI Backend API',
    status: 'alive',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  ApiResponse.success(res, 'Service is alive', livenessPayload, 200);
};

/**
 * Readiness probe: verifies system and critical dependencies are ready to accept traffic.
 * Returns HTTP 200 if database is connected; HTTP 503 if unconfigured or not ready.
 */
export const getReadiness = (_req: Request, res: Response): void => {
  const dbStatus = getDatabaseStatus();
  const ready = isDatabaseReady();

  const readinessPayload: ReadinessData = {
    service: 'ArthaAI Backend API',
    status: ready ? 'ready' : 'not_ready',
    ready,
    database: {
      status: dbStatus.status,
      readyState: dbStatus.readyState,
      host: dbStatus.host,
    },
    timestamp: new Date().toISOString(),
  };

  if (!ready) {
    res.status(503).json({
      success: false,
      message:
        dbStatus.status === 'unconfigured'
          ? 'Service is not ready: MongoDB Atlas is unconfigured'
          : `Service is not ready: MongoDB status is ${dbStatus.status}`,
      data: readinessPayload,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  ApiResponse.success(res, 'Service is ready to handle traffic', readinessPayload, 200);
};

/**
 * Comprehensive health inspection endpoint:
 * Reports system diagnostics, memory usage, uptime, and database lifecycle state.
 */
export const getHealth = (_req: Request, res: Response): void => {
  const dbStatus = getDatabaseStatus();
  const ready = isDatabaseReady();
  const memoryUsage = process.memoryUsage();

  let overallStatus: HealthStatus = 'healthy';
  if (!ready) {
    if (dbStatus.status === 'unconfigured') {
      overallStatus = 'degraded';
    } else if (dbStatus.status === 'connecting') {
      overallStatus = 'starting';
    } else {
      overallStatus = 'unhealthy';
    }
  }

  const healthData: DetailedHealthData = {
    service: 'ArthaAI Backend API',
    status: overallStatus,
    ready,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: dbStatus,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
      },
    },
  };

  const message = ready
    ? 'ArthaAI service health verified (operational)'
    : dbStatus.status === 'unconfigured'
    ? 'ArthaAI service running in degraded mode (MongoDB unconfigured)'
    : `ArthaAI service running with degraded database status: ${dbStatus.status}`;

  ApiResponse.success(res, message, healthData, 200);
};
