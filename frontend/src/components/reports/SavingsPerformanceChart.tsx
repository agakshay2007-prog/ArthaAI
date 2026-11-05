import React from 'react';
import { PiggyBank, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { SavingsPerformanceReportItem } from '../../types/reports';

interface SavingsPerformanceChartProps {
  savings: SavingsPerformanceReportItem[];
}

export const SavingsPerformanceChart: React.FC<SavingsPerformanceChartProps> = ({ savings }) => {
  if (!savings || savings.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <PiggyBank className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Savings Goals Trajectory
          </h3>
        </div>
        <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
          <p>No savings goals configured for this reporting period.</p>
        </div>
      </div>
    );
  }

  const totalTarget = savings.reduce((sum, s) => sum + s.targetAmount, 0);
  const totalCurrent = savings.reduce((sum, s) => sum + s.currentAmount, 0);
  const totalContributions = savings.reduce((sum, s) => sum + s.periodContributions, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Savings Goals Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Capital accumulation towards active financial targets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400 mr-2">Aggregate Progress:</span>
            <span className="text-violet-400 font-bold">{overallProgress}%</span>
          </div>
          {totalContributions > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+${totalContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} contributed</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savings.map((s) => {
          const isCompleted = s.currentAmount >= s.targetAmount;
          const progressWidth = Math.min(s.progressPercentage, 100);

          return (
            <div
              key={`${s.category}-${s.name}`}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white text-xs">{s.name}</span>
                    <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {s.category}
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-violet-400">
                      {s.progressPercentage}%
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-500'
                    }`}
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Current / Target</span>
                  <span className="text-white font-medium">
                    ${s.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                    <span className="text-slate-500">
                      / ${s.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </span>
                </div>

                {s.periodContributions > 0 ? (
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 flex items-center justify-end">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                      This Period
                    </span>
                    <span className="text-emerald-400 font-bold">
                      +${s.periodContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] block uppercase">Remaining</span>
                    <span className="text-slate-300">
                      ${Math.max(0, s.targetAmount - s.currentAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

