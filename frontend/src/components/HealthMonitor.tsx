import React, { useState, useEffect, useCallback } from 'react';
import { checkHealth, checkLiveness, checkReadiness } from '../services/api';
import { HealthCheckResult } from '../types';
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Cpu,
  Clock,
  ChevronDown,
  ChevronUp,
  Radio,
  ServerCrash,
} from 'lucide-react';

export const HealthMonitor: React.FC = () => {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [liveStatus, setLiveStatus] = useState<{ alive: boolean; latencyMs: number } | null>(null);
  const [readyStatus, setReadyStatus] = useState<{ ready: boolean; latencyMs: number; error: string | null } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showJson, setShowJson] = useState<boolean>(false);

  const fetchAllProbes = useCallback(async () => {
    setLoading(true);
    const [healthRes, liveRes, readyRes] = await Promise.all([
      checkHealth(),
      checkLiveness(),
      checkReadiness(),
    ]);

    setResult(healthRes);
    setLiveStatus({ alive: liveRes.alive, latencyMs: liveRes.latencyMs });
    setReadyStatus({ ready: readyRes.ready, latencyMs: readyRes.latencyMs, error: readyRes.error });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllProbes();
  }, [fetchAllProbes]);

  const data = result?.data;
  const isOnline = Boolean(data && !result?.error);
  const isHealthy = data?.status === 'healthy';
  const isDegraded = data?.status === 'degraded';
  const dbInfo = data?.database;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">System Health & Probes Monitor</h3>
                {isHealthy ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Fully Healthy
                  </span>
                ) : isDegraded ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Degraded (Standby)
                  </span>
                ) : isOnline ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    Unhealthy
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Offline
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-probe telemetry for <code className="text-indigo-300 font-mono">/api/health</code>,{' '}
                <code className="text-indigo-300 font-mono">/live</code>, and{' '}
                <code className="text-indigo-300 font-mono">/ready</code>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {result && (
            <span className="text-xs text-slate-400">
              Sampled: <span className="text-slate-200">{result.timestamp}</span>
            </span>
          )}
          <button
            onClick={fetchAllProbes}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Probing...' : 'Refresh Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Orchestrator Probes Banner */}
      <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Liveness Probe Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center space-x-3">
            <Radio className={`w-4 h-4 ${liveStatus?.alive ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
            <div>
              <div className="text-xs font-semibold text-white">Liveness Probe (/api/health/live)</div>
              <div className="text-[11px] text-slate-400">Process alive & responding to HTTP events</div>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-mono font-medium ${
              liveStatus?.alive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {liveStatus?.alive ? 'ALIVE (200 OK)' : 'DOWN'}
          </span>
        </div>

        {/* Readiness Probe Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center space-x-3">
            <CheckCircle2
              className={`w-4 h-4 ${readyStatus?.ready ? 'text-emerald-400' : 'text-amber-400'}`}
            />
            <div>
              <div className="text-xs font-semibold text-white">Readiness Probe (/api/health/ready)</div>
              <div className="text-[11px] text-slate-400">
                {readyStatus?.ready ? 'Ready to accept user traffic' : 'Not Ready: MongoDB Atlas pending'}
              </div>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-mono font-medium ${
              readyStatus?.ready
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {readyStatus?.ready ? 'READY (200 OK)' : 'NOT READY (503)'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Backend API General Status */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Backend API</span>
            {isHealthy ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : isDegraded ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-base font-bold text-white capitalize">
            {loading ? 'Checking...' : isHealthy ? 'Operational' : isDegraded ? 'Degraded Mode' : 'Unreachable'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Latency: <span className="text-slate-300 font-mono">{result?.latencyMs ?? 0} ms</span>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">MongoDB Atlas</span>
            <Database
              className={`w-4 h-4 ${dbInfo?.isReady ? 'text-emerald-400' : 'text-amber-400'}`}
            />
          </div>
          <div className="text-base font-bold text-white capitalize">
            {loading
              ? 'Checking...'
              : dbInfo?.status === 'connected'
              ? 'Connected (Ready)'
              : dbInfo?.status === 'unconfigured'
              ? 'Unconfigured (Standby)'
              : dbInfo?.status || 'Offline'}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            Ready: <span className="text-slate-300 font-mono">{dbInfo?.isReady ? 'true' : 'false'}</span> (State:{' '}
            <span className="text-slate-300 font-mono">{dbInfo?.readyState ?? 0}</span>)
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Process Uptime</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white">
            {loading ? '...' : `${data?.uptime ?? 0}s`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Env: <span className="text-slate-300 font-mono">{data?.environment ?? 'development'}</span>
          </div>
        </div>

        {/* System Memory */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Heap Memory</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-white">
            {loading ? '...' : `${data?.system.memory.heapUsedMB ?? 0} MB`}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Node: <span className="text-slate-300 font-mono">{data?.system.nodeVersion ?? 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Informative Degraded Notice */}
      {isDegraded && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-200">Notice: MongoDB Atlas Unconfigured</div>
            <div className="mt-0.5 text-slate-300">
              The HTTP server and liveness probe are fully functional, but database readiness reports{' '}
              <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">not_ready (503)</code>. To
              transition to fully ready, supply a valid <code className="text-indigo-300 font-mono">MONGODB_URI</code> in{' '}
              <code className="text-indigo-300 font-mono">backend/.env</code>.
            </div>
          </div>
        </div>
      )}

      {/* Error state alert if any */}
      {result?.error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
          <ServerCrash className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-200">Backend Connection Error</div>
            <div className="mt-0.5 text-slate-300">
              {result.error}. Ensure backend is running on port 5000.
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON inspection toggle */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          onClick={() => setShowJson(!showJson)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
        >
          <span className="font-mono">Inspect Diagnostic Telemetry Payload</span>
          {showJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showJson && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{JSON.stringify({ health: result, liveness: liveStatus, readiness: readyStatus }, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
