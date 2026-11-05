import React, { useState } from 'react';
import { SlidersHorizontal, User, DollarSign, Bell, Activity } from 'lucide-react';
import { DEMO_FINANCIAL_SUMMARY } from '../../data/mockFinanceData';

interface SettingsViewProps {
  onOpenSystemStatus: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenSystemStatus }) => {
  const [currency, setCurrency] = useState('USD');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [biweeklyReport, setBiweeklyReport] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Preferences & Settings</h2>
          <p className="text-xs text-slate-400">Configure profile, currency display, alerts, and telemetry</p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-400" />
          <span>User Identity</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={DEMO_FINANCIAL_SUMMARY.userProfile.name}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={DEMO_FINANCIAL_SUMMARY.userProfile.email}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Currency & Financial Preferences */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Currency & Regional Formats</span>
        </h3>
        <div className="max-w-xs text-xs">
          <label className="text-slate-400 block mb-1">Base Portfolio Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="USD">USD ($) — United States Dollar</option>
            <option value="EUR">EUR (€) — Euro</option>
            <option value="GBP">GBP (£) — British Pound</option>
            <option value="INR">INR (₹) — Indian Rupee</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Proactive Financial Alerts</span>
        </h3>
        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
            <span className="text-slate-200">Bill auto-debit reminders (3 days prior)</span>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
            <span className="text-slate-200">Bi-weekly financial velocity summary</span>
            <input
              type="checkbox"
              checked={biweeklyReport}
              onChange={(e) => setBiweeklyReport(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
          </label>
        </div>
      </div>

      {/* System Telemetry & Architecture Modal */}
      <div className="glass-card rounded-2xl p-6 border border-emerald-500/20">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>System Infrastructure Telemetry</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          View full-stack Node.js + Express backend metrics, MongoDB Atlas readiness, and container liveness probes.
        </p>
        <button
          onClick={onOpenSystemStatus}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
        >
          Open System Telemetry Dashboard
        </button>
      </div>
    </div>
  );
};
