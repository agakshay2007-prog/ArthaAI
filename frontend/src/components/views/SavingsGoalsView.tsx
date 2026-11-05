import React from 'react';
import { Target, Plus, Shield, Home, Zap, Compass, CheckCircle2 } from 'lucide-react';
import { DEMO_SAVINGS_GOALS } from '../../data/mockFinanceData';
import { SavingsGoal } from '../../types/finance';

interface SavingsGoalsViewProps {
  goals?: SavingsGoal[];
  onOpenNewGoal: () => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals = DEMO_SAVINGS_GOALS,
  onOpenNewGoal,
}) => {
  const iconMap: Record<string, React.ElementType> = {
    Shield,
    Home,
    Zap,
    Compass,
  };

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallFunded = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Savings & Wealth Milestones</h2>
            <p className="text-xs text-slate-400">Target-driven capital accumulation accounts</p>
          </div>
        </div>

        <button
          onClick={onOpenNewGoal}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-glow-violet transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Target Goal</span>
        </button>
      </div>

      {/* Overview Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Combined Goals Progress
            </span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              ${totalSaved.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-400">/ ${totalTarget.toLocaleString()}</span>
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{overallFunded}% aggregate milestone fulfillment</span>
            </p>
          </div>

          <div className="w-full sm:w-64 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Overall Completion</span>
              <span className="font-mono font-bold text-brand-400">{overallFunded}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
                style={{ width: `${overallFunded}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => {
          const Icon = iconMap[goal.iconName] || Target;
          const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);

          return (
            <div key={goal.id} className="glass-card rounded-2xl p-5 hover:border-slate-700 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${goal.color}20`, borderColor: `${goal.color}50` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: goal.color }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{goal.name}</h4>
                    <span className="text-[11px] text-slate-400">{goal.category} • Target {goal.deadline}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-950 text-white border border-slate-800">
                  {pct}%
                </span>
              </div>

              {/* Progress */}
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800/80 mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: goal.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Saved so far</span>
                  <span className="text-white font-mono font-bold">${goal.currentAmount.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Target Goal</span>
                  <span className="text-slate-300 font-mono font-medium">${goal.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

