import { ApiResponse, HealthData, HealthCheckResult, LivenessData, ReadinessData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const checkHealth = async (): Promise<HealthCheckResult> => {
  const startTime = performance.now();
  const url = `${API_BASE_URL}/api/health`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);
    const json: ApiResponse<HealthData> = await response.json();

    return {
      data: json.data,
      latencyMs,
      error: response.ok ? null : json.message || `HTTP ${response.status}`,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      data: null,
      latencyMs,
      error: (err as Error).message || 'Failed to reach API endpoint',
      timestamp: new Date().toLocaleTimeString(),
    };
  }
};

export const checkLiveness = async (): Promise<{ alive: boolean; latencyMs: number; error: string | null }> => {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/api/health/live`);
    const latencyMs = Math.round(performance.now() - start);
    const json: ApiResponse<LivenessData> = await res.json();
    return { alive: res.ok && json.success, latencyMs, error: null };
  } catch (err) {
    return { alive: false, latencyMs: Math.round(performance.now() - start), error: (err as Error).message };
  }
};

export const checkReadiness = async (): Promise<{ ready: boolean; latencyMs: number; error: string | null }> => {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/api/health/ready`);
    const latencyMs = Math.round(performance.now() - start);
    const json: ApiResponse<ReadinessData> = await res.json();
    return { ready: res.ok && json.data?.ready === true, latencyMs, error: res.ok ? null : json.message };
  } catch (err) {
    return { ready: false, latencyMs: Math.round(performance.now() - start), error: (err as Error).message };
  }
};
