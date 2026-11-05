export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'starting';

export interface DatabaseHealthInfo {
  status: 'connected' | 'connecting' | 'disconnected' | 'disconnecting' | 'unconfigured';
  readyState: number;
  isReady: boolean;
  host?: string;
  name?: string;
}

export interface HealthData {
  service: string;
  status: HealthStatus;
  ready: boolean;
  uptime: number;
  timestamp: string;
  environment: string;
  database: DatabaseHealthInfo;
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      rssMB: string;
      heapUsedMB: string;
      heapTotalMB: string;
    };
  };
}

export interface LivenessData {
  service: string;
  status: 'alive';
  uptime: number;
  timestamp: string;
}

export interface ReadinessData {
  service: string;
  status: 'ready' | 'not_ready';
  ready: boolean;
  database: {
    status: DatabaseHealthInfo['status'];
    readyState: number;
    host?: string;
  };
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface HealthCheckResult {
  data: HealthData | null;
  latencyMs: number;
  error: string | null;
  timestamp: string;
}
