import React from 'react';
import { BarChart3 } from 'lucide-react';
import { DEMO_MONTHLY_CASH_FLOW } from '../../data/mockFinanceData';

export const ReportsAnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Reports & Performance Analytics</h2>
          <p className="text-xs text-slate-400">Historical cash-flow audit & monthly variance statistics</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            2026 Monthly Cash Flow Statement
          </span>
          <span className="text-xs text-brand-400 font-mono">Currency: USD ($)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Inflow (Income)</th>
                <th className="py-3 px-4 text-right">Outflow (Spend)</th>
                <th className="py-3 px-4 text-right">Net Savings</th>
                <th className="py-3 px-4 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {DEMO_MONTHLY_CASH_FLOW.map((pt) => {
                const rate = Math.round((pt.netSavings / pt.income) * 100);
                return (
                  <tr key={pt.month} className="hover:bg-slate-800/20 transition">
                    <td className="py-3 px-4 font-sans font-semibold text-white">{pt.month} 2026</td>
                    <td className="py-3 px-4 text-right text-emerald-400">+${pt.income.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-200">-${pt.expenses.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-brand-400 font-bold">+${pt.netSavings.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-white">
                      <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-[10px]">
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
