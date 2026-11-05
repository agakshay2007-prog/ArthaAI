import React from 'react';
import { Target, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { BudgetPerformanceReportItem } from '../../types/reports';

interface BudgetPerformanceChartProps {
  budgets: BudgetPerformanceReportItem[];
}

export const BudgetPerformanceChart: React.FC<BudgetPerformanceChartProps> = ({ budgets }) => {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Target className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Budget Variance & Adherence
          </h3>
        </div>
        <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
          <p>No active budgets configured for this reporting period.</p>
        </div>
      </div>
    );
  }

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallUtilization = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const exceededCount = budgets.filter((b) => b.spent > b.limit).length;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Budget Variance & Adherence
            </h3>
            <p className="text-xs text-slate-400">
              Actual spending benchmarked against set allowances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400 mr-2">Utilization:</span>
            <span
              className={`font-bold ${
                overallUtilization > 100
                  ? 'text-rose-400'
                  : overallUtilization > 85
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {overallUtilization}%
            </span>
          </div>
          {exceededCount > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-xl text-xs font-mono text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{exceededCount} Over Budget</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {budgets.map((b) => {
          const isOver = b.spent > b.limit;
          const statusConfig = {
            healthy: {
              bar: 'bg-emerald-500',
              badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              label: 'Healthy',
              icon: CheckCircle2,
            },
            warning: {
              bar: 'bg-amber-500',
              badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              label: 'Warning',
              icon: AlertTriangle,
            },
            critical: {
              bar: 'bg-orange-500',
              badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
              label: 'Critical',
              icon: AlertTriangle,
            },
            exceeded: {
              bar: 'bg-rose-500',
              badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
              label: 'Exceeded',
              icon: AlertOctagon,
            },
          }[b.status] || {
            bar: 'bg-violet-500',
            badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
            label: 'Normal',
            icon: CheckCircle2,
          };

          const StatusIcon = statusConfig.icon;
          const progressWidth = Math.min(b.utilizationPercentage, 100);

          return (
            <div
              key={`${b.category}-${b.name}`}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-xs">{b.name}</span>
                    <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {b.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.badge}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label} ({b.utilizationPercentage}%)
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${statusConfig.bar}`}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  Spent: <strong className="text-white">${b.spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> of ${b.limit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={isOver ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {isOver
                    ? `Over by $${Math.abs(b.remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `Remaining: $${b.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

