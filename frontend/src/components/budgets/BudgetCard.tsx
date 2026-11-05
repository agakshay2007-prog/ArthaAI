import React from 'react';
import {
  Calendar,
  AlertTriangle,
  BarChart2,
  Edit2,
  Trash2,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { Budget } from '../../types/budget';
import { BudgetProgressBar } from './BudgetProgressBar';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  onViewAnalytics: (budget: Budget) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
  onViewAnalytics,
}) => {
  const isOver = budget.status === 'exceeded';
  const remaining = budget.remaining ?? (budget.limit - budget.actualSpent);
  const activeAlert = budget.alerts && budget.alerts.length > 0 ? budget.alerts[0] : null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-brand-500/5">
      <div>
        {/* Header: Category, Period, Status, Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                <Tag className="w-3 h-3" />
                <span>{budget.category}</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span className="capitalize">{budget.period}</span>
              </span>
              {!budget.isActive && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-500 border border-slate-700/50">
                  Inactive
                </span>
              )}
              {budget.isDemoRecord && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Demo
                </span>
              )}
            </div>
            <h3 className="font-bold text-white text-base truncate" title={budget.name}>
              {budget.name}
            </h3>
            {budget.description && (
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{budget.description}</p>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => onViewAnalytics(budget)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 transition"
              title="View Velocity & Analytics"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(budget)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Edit Budget"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete Budget"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Financial Numbers Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3.5 my-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Limit</div>
            <div className="text-sm sm:text-base font-bold font-mono text-white mt-0.5">
              ${budget.limit.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Spent</div>
            <div className="text-sm sm:text-base font-bold font-mono text-brand-300 mt-0.5">
              ${budget.actualSpent.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Remaining</div>
            <div
              className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${
                remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {remaining >= 0 ? `$${remaining.toLocaleString()}` : `-$${Math.abs(remaining).toLocaleString()}`}
            </div>
          </div>
        </div>

        {/* Progress Bar & Status */}
        <div className="mt-3">
          <BudgetProgressBar
            percentage={budget.utilizationPercentage}
            status={budget.status}
            showStatusBadge={true}
          />
        </div>

        {/* Alert Pill if breached */}
        {activeAlert && (
          <div
            className={`mt-3 px-3 py-2 rounded-xl flex items-center space-x-2 text-xs border ${
              isOver
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{activeAlert.message}</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center space-x-1">
          <CheckCircle className="w-3 h-3 text-slate-500" />
          <span>{budget.transactionCount || 0} expenses recorded</span>
        </span>
        <button
          onClick={() => onViewAnalytics(budget)}
          className="text-brand-400 hover:text-brand-300 font-semibold transition"
        >
          Details &rarr;
        </button>
      </div>
    </div>
  );
};
