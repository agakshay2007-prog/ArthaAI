import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, GitCompare, Calendar } from 'lucide-react';
import { MetricComparisonItem } from '../../types/reports';

interface PeriodComparisonProps {
  comparison?: {
    income: MetricComparisonItem;
    expenses: MetricComparisonItem;
    netCashFlow: MetricComparisonItem;
    savingsRate: MetricComparisonItem;
    previousPeriodLabel: string;
  };
  currentPeriodLabel: string;
}

export const PeriodComparison: React.FC<PeriodComparisonProps> = ({
  comparison,
  currentPeriodLabel,
}) => {
  if (!comparison) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2 mb-3">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <GitCompare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Period-over-Period Variance
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Prior period baseline data is unavailable for comparative analysis.
        </p>
      </div>
    );
  }

  const items = [
    {
      title: 'Total Inflow (Income)',
      metric: comparison.income,
      isCurrency: true,
      positiveIsGood: true,
    },
    {
      title: 'Total Outflow (Expenses)',
      metric: comparison.expenses,
      isCurrency: true,
      positiveIsGood: false, // spending more is not usually positive
    },
    {
      title: 'Net Cash Flow',
      metric: comparison.netCashFlow,
      isCurrency: true,
      positiveIsGood: true,
    },
    {
      title: 'Savings Rate',
      metric: comparison.savingsRate,
      isCurrency: false,
      isPercentage: true,
      positiveIsGood: true,
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Period-over-Period Variance
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{currentPeriodLabel}</span>
              <span className="text-slate-600">•</span>
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Baseline: {comparison.previousPeriodLabel}</span>
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-lg">
          Delta Benchmark
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const delta = item.metric.delta;
          const pct = item.metric.percentageChange;
          const isZero = delta === 0;
          const isPositive = delta > 0;
          const isGood = isPositive ? item.positiveIsGood : !item.positiveIsGood;

          const badgeClass = isZero
            ? 'bg-slate-800 text-slate-400 border-slate-700'
            : isGood
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

          return (
            <div
              key={item.title}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-2">{item.title}</span>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-lg font-bold text-white font-mono">
                    {item.isCurrency ? `$${item.metric.current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${item.metric.current}%`}
                  </span>

                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold px-2 py-0.5 rounded border ${badgeClass}`}
                  >
                    {isZero ? (
                      <Minus className="w-3 h-3" />
                    ) : isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {isZero ? '0%' : `${pct > 0 ? '+' : ''}${pct}%`}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Prior: {item.isCurrency ? `$${item.metric.previous.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${item.metric.previous}%`}</span>
                <span className={isGood ? 'text-emerald-400' : isZero ? 'text-slate-400' : 'text-rose-400'}>
                  {delta > 0 ? '+' : ''}
                  {item.isCurrency ? `$${delta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${delta}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
