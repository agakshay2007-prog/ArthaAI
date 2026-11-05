import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Wallet,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';
import { ReportSummaryMetrics, MetricComparisonItem } from '../../types/reports';

interface ReportOverviewCardsProps {
  summary: ReportSummaryMetrics;
  comparison?: {
    income: MetricComparisonItem;
    expenses: MetricComparisonItem;
    netCashFlow: MetricComparisonItem;
    savingsRate: MetricComparisonItem;
    previousPeriodLabel: string;
  };
  isLoading?: boolean;
}

export const ReportOverviewCards: React.FC<ReportOverviewCardsProps> = ({
  summary,
  comparison,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800" />
        ))}
      </div>
    );
  }

  const renderDelta = (item?: MetricComparisonItem, invert = false) => {
    if (!item) return null;
    const isPositive = item.delta > 0;
    const isGood = invert ? !isPositive : isPositive;

    return (
      <div
        className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          isGood
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}
      >
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        <span>{Math.abs(item.percentageChange)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Income */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-white tracking-tight">
            ${summary.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
            <span>{summary.incomeTransactionCount} deposits</span>
            {renderDelta(comparison?.income)}
          </div>
        </div>
      </div>

      {/* 2. Total Outflows */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Outflows</span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-white tracking-tight">
            ${summary.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
            <span>{summary.expenseTransactionCount} outflows</span>
            {renderDelta(comparison?.expenses, true)}
          </div>
        </div>
      </div>

      {/* 3. Net Cash Flow */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Net Cash Flow</span>
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div
            className={`text-xl font-bold tracking-tight ${
              summary.netCashFlow >= 0 ? 'text-brand-300' : 'text-rose-400'
            }`}
          >
            {summary.netCashFlow >= 0 ? '+' : ''}${summary.netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
            <span>{summary.netCashFlow >= 0 ? 'Cash Surplus' : 'Deficit'}</span>
            {renderDelta(comparison?.netCashFlow)}
          </div>
        </div>
      </div>

      {/* 4. Savings Rate */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-white tracking-tight">
            {summary.savingsRatePercentage}%
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
            <span>Benchmark: 20%</span>
            {renderDelta(comparison?.savingsRate)}
          </div>
        </div>
      </div>

      {/* 5. Budget Utilization */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Budget Health</span>
          <div
            className={`p-1.5 rounded-lg ${
              summary.budgetUtilization.exceededCount > 0
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-white tracking-tight">
            {summary.budgetUtilization.utilizationPercentage}%
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
            <span>
              {summary.budgetUtilization.exceededCount > 0
                ? `${summary.budgetUtilization.exceededCount} exceeded`
                : 'Within limits'}
            </span>
            <span className="text-slate-400 font-mono">
              ${summary.budgetUtilization.totalSpent.toFixed(0)}/${summary.budgetUtilization.totalLimit.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Bills Obligations */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Commitments</span>
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-white tracking-tight">
            ${summary.billsSummary.pendingCommitments.toFixed(2)}
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
            <span>
              {summary.billsSummary.overdueCount > 0
                ? `${summary.billsSummary.overdueCount} Overdue`
                : '0 Overdue'}
            </span>
            <span className="text-emerald-400 font-semibold">
              ${summary.billsSummary.totalPaidInPeriod.toFixed(0)} Paid
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
