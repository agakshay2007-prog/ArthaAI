import React from 'react';
import { PiggyBank, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Budget, BudgetOverview } from '../../types/budget';
import { BudgetProgressBar } from '../budgets/BudgetProgressBar';

interface BudgetOverviewCardProps {
  overview: BudgetOverview | null;
  budgets: Budget[];
  onNavigateToBudgets: () => void;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  overview,
  budgets,
  onNavigateToBudgets,
}) => {
  // If overview is not computed from backend, compute from budgets
  const activeBudgets = budgets.filter((b) => b.isActive !== false);
  const totalLimit = overview?.totalLimit ?? activeBudgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = overview?.totalSpent ?? activeBudgets.reduce((acc, b) => acc + b.actualSpent, 0);
  const remaining = totalLimit - totalSpent;
  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const status =
    overallPercentage >= 100
      ? 'exceeded'
      : overallPercentage >= 90
      ? 'critical'
      : overallPercentage >= 75
      ? 'warning'
      : overallPercentage >= 50
      ? 'moderate'
      : 'normal';

  // Top 3 categories by spent
  const topBudgets = [...activeBudgets]
    .sort((a, b) => b.actualSpent - a.actualSpent)
    .slice(0, 3);

  // Any active alerts
  const criticalAlerts = activeBudgets.filter(
    (b) => b.status === 'exceeded' || b.status === 'critical'
  );

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Monthly Budget Discipline</h3>
              <p className="text-xs text-slate-400">
                {activeBudgets.length} active spending caps configured
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToBudgets}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1 group transition"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        {/* Big Utilization Metric */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-slate-400">Total Spent / Limit</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                ${totalSpent.toLocaleString()}{' '}
                <span className="text-slate-500 font-normal">/ ${totalLimit.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Remaining</span>
              <div
                className={`text-lg font-bold font-mono mt-0.5 ${
                  remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {remaining >= 0 ? `+$${remaining.toLocaleString()}` : `-$${Math.abs(remaining).toLocaleString()}`}
              </div>
            </div>
          </div>

          <BudgetProgressBar
            percentage={overallPercentage}
            status={status}
            height="h-2.5"
            showStatusBadge={true}
          />
        </div>

        {/* Alert Banner if any budget exceeded */}
        {criticalAlerts.length > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="truncate">
              <strong>{criticalAlerts.length}</strong> budget category requires attention (limit reached or exceeded).
            </span>
          </div>
        )}

        {/* Top Spending Categories */}
        <div className="mt-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-400">Top Allocated Categories</div>
          {topBudgets.map((b) => (
            <div
              key={b.id}
              className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-200">{b.name}</span>
                <span className="font-mono text-slate-300">
                  ${b.actualSpent.toLocaleString()} / ${b.limit.toLocaleString()}
                </span>
              </div>
              <BudgetProgressBar
                percentage={b.utilizationPercentage}
                status={b.status}
                height="h-1.5"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-3 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center space-x-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Automated expense tracking active</span>
        </span>
        <button
          onClick={onNavigateToBudgets}
          className="text-brand-400 hover:text-brand-300 font-medium transition"
        >
          View All Budgets &rarr;
        </button>
      </div>
    </div>
  );
};
