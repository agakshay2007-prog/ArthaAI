import React from 'react';
import {
  Target,
  Shield,
  Home,
  Zap,
  Compass,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  Minus,
  History,
  BarChart2,
  Edit2,
  Trash2,
} from 'lucide-react';
import { SavingsGoal, GoalHealthStatus } from '../../types/savings';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onAddFunds: (goal: SavingsGoal) => void;
  onWithdraw: (goal: SavingsGoal) => void;
  onViewHistory: (goal: SavingsGoal) => void;
  onViewAnalytics: (goal: SavingsGoal) => void;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Home,
  Zap,
  Compass,
  Target,
};

export const getHealthBadge = (health: GoalHealthStatus) => {
  switch (health) {
    case 'completed':
      return {
        label: '100% Completed',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      };
    case 'ahead':
      return {
        label: 'Ahead of Pace',
        badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      };
    case 'on_track':
      return {
        label: 'On Track',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      };
    case 'behind':
      return {
        label: 'Behind Schedule',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    case 'at_risk':
      return {
        label: 'Deadline at Risk',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      };
    default:
      return {
        label: 'In Progress',
        badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      };
  }
};

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onAddFunds,
  onWithdraw,
  onViewHistory,
  onViewAnalytics,
  onEdit,
  onDelete,
}) => {
  const Icon = ICON_MAP[goal.iconName] || Target;
  const health = getHealthBadge(goal.healthStatus);
  const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount;
  const progress = Math.min(Math.round(goal.progressPercentage), 100);

  const formattedDeadline = new Date(goal.deadline).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-brand-500/5">
      <div>
        {/* Header: Icon, Name, Category & Action Icons */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start space-x-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${goal.color}15`,
                borderColor: `${goal.color}40`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: goal.color }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${health.badgeClass}`}>
                  {health.label}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                  {goal.category}
                </span>
                {goal.priority === 'urgent' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Urgent
                  </span>
                )}
              </div>
              <h3 className="font-bold text-white text-base truncate" title={goal.name}>
                {goal.name}
              </h3>
              {goal.description && (
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{goal.description}</p>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => onViewAnalytics(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition"
              title="View Velocity Analytics & Milestones"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewHistory(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Contribution Ledger"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Edit Goal"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete Goal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Financial Numbers Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3.5 my-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Target</div>
            <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
              ${goal.targetAmount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Saved</div>
            <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-0.5">
              ${goal.currentAmount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Remaining</div>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-200 mt-0.5">
              ${goal.remainingAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="space-y-1.5 my-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Milestone Progress</span>
            <span className="font-mono font-bold text-white">{goal.progressPercentage}%</span>
          </div>

          <div className="relative w-full bg-slate-950 rounded-full h-3 overflow-hidden p-[1px] border border-slate-800/80">
            {/* Visual Milestones markers */}
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: goal.color,
                boxShadow: `0 0 12px ${goal.color}60`,
              }}
            />
          </div>

          {/* Milestone markers tick marks */}
          <div className="flex justify-between px-1 text-[10px] font-mono text-slate-500">
            <span className={progress >= 25 ? 'text-brand-300 font-semibold' : ''}>25%</span>
            <span className={progress >= 50 ? 'text-brand-300 font-semibold' : ''}>50%</span>
            <span className={progress >= 75 ? 'text-brand-300 font-semibold' : ''}>75%</span>
            <span className={progress >= 100 ? 'text-emerald-400 font-bold' : ''}>100%</span>
          </div>
        </div>

        {/* Planning Run-Rate & Timeline Info */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/70 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">Target: {formattedDeadline}</span>
          </div>
          <div className="flex items-center justify-end space-x-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>{goal.daysRemaining > 0 ? `${goal.daysRemaining} days left` : 'Due today'}</span>
          </div>
        </div>

        {/* Required velocity callout if active */}
        {!isCompleted && goal.requiredMonthlySavings > 0 && (
          <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
              <span>Required pace:</span>
            </span>
            <span className="font-mono font-bold text-white">
              ${goal.requiredMonthlySavings.toLocaleString()}/mo
            </span>
          </div>
        )}
      </div>

      {/* Footer Deposit & Withdraw Action Buttons */}
      <div className="pt-3 mt-4 border-t border-slate-800/70 grid grid-cols-2 gap-2">
        <button
          onClick={() => onWithdraw(goal)}
          disabled={goal.currentAmount <= 0}
          className="flex items-center justify-center space-x-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
          title="Withdraw funds"
        >
          <Minus className="w-3.5 h-3.5 text-slate-400" />
          <span>Withdraw</span>
        </button>

        <button
          onClick={() => onAddFunds(goal)}
          className="flex items-center justify-center space-x-1 py-1.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition"
          title="Deposit funds"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Funds</span>
        </button>
      </div>
    </div>
  );
};
