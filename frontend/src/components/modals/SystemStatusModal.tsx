import React from 'react';
import { X, Activity } from 'lucide-react';
import { HealthMonitor } from '../HealthMonitor';
import { ArchitectureOverview } from '../ArchitectureOverview';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-navy-900 border border-slate-700 rounded-2xl shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-navy-900 z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">System Infrastructure & Telemetry</h3>
              <p className="text-xs text-slate-400">Phase 1 verified architecture and live container probes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Phase 1 Live Health Monitor */}
          <HealthMonitor />

          {/* Phase 1 Architecture Stack Overview */}
          <ArchitectureOverview />
        </div>
      </div>
    </div>
  );
};

