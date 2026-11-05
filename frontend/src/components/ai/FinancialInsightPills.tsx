import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, CalendarClock } from 'lucide-react';
import { FinancialInsightsData } from '../../types/ai';

interface FinancialInsightPillsProps {
  insights: FinancialInsightsData | null;
  isLoading?: boolean;
}

export const FinancialInsightPills: React.FC<FinancialInsightPillsProps> = ({
  insights,
  isLoading = false,
}) => {
  if (isLoading || !insights) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-900/60 border border-slate-800" />
        ))}
      </div>
    );
  }

  const { healthScore, topSpendingCategory, budgetAlerts, savingsTrajectory, billCommitments } =
    insights;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Health Score */}
      <div className="glass-card rounded-2xl p-3.5 border border-slate-800/80 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Health Index</span>
          <ShieldCheck className="w-4 h-4 text-brand-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-white tracking-tight">{healthScore.score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ml-auto ${getScoreColor(
              healthScore.score
            )}`}
          >
            {healthScore.rating}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 truncate mt-1">
          {healthScore.summary.split(',')[0]}
        </p>
      </div>

      {/* 2. Top Spending */}
      <div className="glass-card rounded-2xl p-3.5 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Top Category</span>
          <TrendingUp className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-white truncate max-w-[120px]">
            {topSpendingCategory ? topSpendingCategory.category : 'None'}
          </span>
          <span className="text-xs font-semibold text-indigo-300">
            ${topSpendingCategory ? topSpendingCategory.amount.toFixed(0) : '0'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {topSpendingCategory ? `${topSpendingCategory.percentage}% of monthly burn` : 'No expenses recorded'}
        </p>
      </div>

      {/* 3. Budget Status */}
      <div className="glass-card rounded-2xl p-3.5 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Budget Status</span>
          <AlertTriangle
            className={`w-4 h-4 ${
              budgetAlerts.exceededCount > 0
                ? 'text-rose-400'
                : budgetAlerts.warningCount > 0
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-white">
            {budgetAlerts.exceededCount > 0
              ? `${budgetAlerts.exceededCount} Exceeded`
              : budgetAlerts.warningCount > 0
              ? `${budgetAlerts.warningCount} In Warning`
              : 'All Healthy'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 truncate mt-1">
          {budgetAlerts.criticalCategories.length > 0
            ? `Vigilance: ${budgetAlerts.criticalCategories.join(', ')}`
            : 'Within target parameters'}
        </p>
      </div>

      {/* 4. Upcoming Obligations / Goals */}
      <div className="glass-card rounded-2xl p-3.5 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Next Obligation</span>
          <CalendarClock className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-white truncate max-w-[120px]">
            {billCommitments.nextDueBill ? billCommitments.nextDueBill.name : 'No Bills Due'}
          </span>
          <span className="text-xs font-semibold text-violet-300">
            ${billCommitments.nextDueBill ? billCommitments.nextDueBill.amount.toFixed(0) : '0'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {billCommitments.nextDueBill ? `Due ${billCommitments.nextDueBill.dueDate}` : `Goals: ${savingsTrajectory.progressPercentage}% funded`}
        </p>
      </div>
    </div>
  );
};
