import React from 'react';
import { Target, Plus, Shield, Home, Zap, Compass } from 'lucide-react';
import { DEMO_SAVINGS_GOALS } from '../../data/mockFinanceData';

import { SavingsGoal } from '../../types/finance';

interface SavingsGoalsCardProps {
  goals?: SavingsGoal[];
  onOpenNewGoal?: () => void;
}

export const SavingsGoalsCard: React.FC<SavingsGoalsCardProps> = ({
  goals = DEMO_SAVINGS_GOALS,
  onOpenNewGoal,
}) => {
  const iconMap: Record<string, React.ElementType> = {
    Shield,
    Home,
    Zap,
    Compass,
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white">Savings Targets & Goals</h3>
          </div>

          <button
            onClick={onOpenNewGoal}
            className="flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-300 font-semibold px-2 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-5">Track progress towards capital reserve milestones</p>

        <div className="space-y-4">
          {goals.map((goal) => {
            const Icon = iconMap[goal.iconName] || Target;
            const progress = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);

            return (
              <div
                key={goal.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: `${goal.color}25`, borderColor: `${goal.color}50` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{goal.name}</div>
                      <div className="text-[10px] text-slate-400">Target by {goal.deadline}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white font-mono">
                      ${goal.currentAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      of ${goal.targetAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: goal.color,
                      boxShadow: `0 0 10px ${goal.color}80`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                  <span className="font-mono font-medium text-slate-300">{progress}% funded</span>
                  <span>${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
        <span className="text-xs text-slate-400">
          Monthly auto-allocation active: <strong className="text-brand-300 font-mono">$1,500.00/mo</strong>
        </span>
      </div>
    </div>
  );
};

