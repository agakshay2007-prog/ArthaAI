import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Budget, BudgetAnalytics } from '../../types/budget';
import { Transaction } from '../../types/finance';
import { budgetService } from '../../services/budgets';
import { BudgetProgressBar, getStatusTheme } from './BudgetProgressBar';

interface BudgetAnalyticsModalProps {
  isOpen: boolean;
  budget: Budget | null;
  transactions?: Transaction[];
  onClose: () => void;
}

export const BudgetAnalyticsModal: React.FC<BudgetAnalyticsModalProps> = ({
  isOpen,
  budget,
  transactions = [],
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<BudgetAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !budget) {
      setAnalytics(null);
      return;
    }

    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        if (!budget.isDemoRecord && !budget.id.startsWith('bgt-demo-')) {
          const res = await budgetService.getBudgetAnalytics(budget.id);
          setAnalytics(res);
          return;
        }
      } catch {
        // Fallback to client-side compute
      }

      // Compute client-side analytics
      const bStart = new Date(budget.startDate);
      const bEnd = new Date(budget.endDate);
      const now = new Date();

      const matchingTx = transactions.filter((tx) => {
        if (tx.type !== 'expense') return false;
        if (tx.category.toLowerCase() !== budget.category.toLowerCase()) return false;
        const txDate = new Date(tx.date || tx.transactionDate || '');
        if (isNaN(txDate.getTime())) return false;
        return txDate >= bStart && txDate <= bEnd;
      });

      const totalDays = Math.max(1, Math.ceil((bEnd.getTime() - bStart.getTime()) / (1000 * 3600 * 24)));
      const daysElapsed = Math.min(
        totalDays,
        Math.max(1, Math.ceil((Math.min(now.getTime(), bEnd.getTime()) - bStart.getTime()) / (1000 * 3600 * 24)))
      );
      const daysRemaining = Math.max(0, totalDays - daysElapsed);

      const actualSpent = budget.actualSpent;
      const averageDailySpend = Math.round((actualSpent / daysElapsed) * 100) / 100;
      const projectedTotalSpend = Math.round((averageDailySpend * totalDays) * 100) / 100;
      const projectedUtilizationPercentage = Math.round((projectedTotalSpend / budget.limit) * 100);

      // Generate daily points
      const dailyTrend: { date: string; spent: number; cumulativeSpent: number }[] = [];
      let runningTotal = 0;
      const numPoints = Math.min(daysElapsed, 15);
      for (let i = numPoints; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const step = actualSpent / (numPoints + 1);
        runningTotal += step;
        dailyTrend.push({
          date: dateStr,
          spent: Math.round(step),
          cumulativeSpent: Math.round(Math.min(runningTotal, actualSpent)),
        });
      }

      setAnalytics({
        budget,
        dailySpendTrend: dailyTrend,
        velocity: {
          averageDailySpend,
          projectedTotalSpend,
          projectedUtilizationPercentage,
          isProjectedToExceed: projectedTotalSpend > budget.limit,
          daysRemaining,
          daysElapsed,
          totalDays,
        },
        recentTransactions: matchingTx.slice(0, 5),
      });
      setIsLoading(false);
    };

    loadAnalytics();
  }, [isOpen, budget, transactions]);

  if (!isOpen || !budget) return null;

  const theme = getStatusTheme(budget.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                {budget.category}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300">
                {budget.period.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${theme.badgeBg}`}>
                {theme.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{budget.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Period: {new Date(budget.startDate).toLocaleDateString()} &ndash;{' '}
              {new Date(budget.endDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Computing velocity models...</span>
          </div>
        ) : (
          <div className="space-y-6 mt-5">
            {/* 1. Core Utilization Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Spending Cap</span>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  ${budget.limit.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Actual Spend</span>
                <div className="text-lg font-bold font-mono text-brand-300 mt-1">
                  ${budget.actualSpent.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Remaining</span>
                <div
                  className={`text-lg font-bold font-mono mt-1 ${
                    budget.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ${budget.remaining.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Utilization</span>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  {budget.utilizationPercentage}%
                </div>
              </div>
            </div>

            {/* Progress Bar with markers */}
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Budget Consumption</span>
                <span>{budget.utilizationPercentage}% of ${budget.limit.toLocaleString()}</span>
              </div>
              <BudgetProgressBar
                percentage={budget.utilizationPercentage}
                status={budget.status}
                height="h-3"
              />
            </div>

            {/* 2. Predictive Spending Velocity */}
            {analytics?.velocity && (
              <div className="glass-card rounded-2xl p-5 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    <h4 className="text-sm font-bold text-white">Velocity & Run-Rate Forecasting</h4>
                  </div>
                  {analytics.velocity.isProjectedToExceed ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Projected Over Budget</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Projected Under Budget</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Daily Burn Rate</span>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      ${analytics.velocity.averageDailySpend.toFixed(2)}/day
                    </div>
                    <span className="text-[10px] text-slate-500">Based on past {analytics.velocity.daysElapsed} days</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Projected Month-End Spend</span>
                    <div
                      className={`text-base font-bold font-mono mt-0.5 ${
                        analytics.velocity.isProjectedToExceed ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      ${analytics.velocity.projectedTotalSpend.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {analytics.velocity.projectedUtilizationPercentage}% projected utilization
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Timeline</span>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {analytics.velocity.daysRemaining} days remaining
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {analytics.velocity.daysElapsed} of {analytics.velocity.totalDays} elapsed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Daily Spending Trend Chart */}
            {analytics?.dailySpendTrend && analytics.dailySpendTrend.length > 0 && (
              <div className="glass-card rounded-2xl p-5 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white">Cumulative Spend Progression</h4>
                  <span className="text-xs text-slate-400">Actual vs Cap</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics.dailySpendTrend}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="budgetSpendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`$${val}`, 'Cumulative Spend']}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulativeSpent"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#budgetSpendGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 4. Contributing Transactions */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-3">Recent Matching Transactions</h4>
              {analytics?.recentTransactions && analytics.recentTransactions.length > 0 ? (
                <div className="space-y-2">
                  {analytics.recentTransactions.map((tx: any, idx: number) => (
                    <div
                      key={tx.id || idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{tx.title || tx.merchant}</div>
                        <div className="text-[11px] text-slate-400">
                          {tx.date || tx.transactionDate ? new Date(tx.date || tx.transactionDate).toLocaleDateString() : 'Recent'} &bull; {tx.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-rose-400">
                          -${(tx.amount || 0).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500 capitalize">{tx.status || 'completed'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No expense transactions recorded in this category for this period yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
