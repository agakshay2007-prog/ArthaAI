import React from 'react';
import { BudgetStatus } from '../../types/budget';

interface BudgetProgressBarProps {
  percentage: number;
  status: BudgetStatus;
  height?: string;
  showStatusBadge?: boolean;
}

export const getStatusTheme = (status: BudgetStatus) => {
  switch (status) {
    case 'exceeded':
      return {
        badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        barGradient: 'from-rose-500 to-red-600',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
        label: 'Exceeded',
        textColor: 'text-rose-400',
      };
    case 'critical':
      return {
        badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        barGradient: 'from-orange-500 to-amber-500',
        glow: 'shadow-[0_0_8px_rgba(249,115,22,0.3)]',
        label: 'Critical (≥90%)',
        textColor: 'text-orange-400',
      };
    case 'warning':
      return {
        badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        barGradient: 'from-amber-500 to-yellow-400',
        glow: '',
        label: 'Warning (≥75%)',
        textColor: 'text-amber-400',
      };
    case 'moderate':
      return {
        badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        barGradient: 'from-blue-500 to-cyan-400',
        glow: '',
        label: 'Moderate (≥50%)',
        textColor: 'text-blue-400',
      };
    case 'normal':
    default:
      return {
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        barGradient: 'from-emerald-500 to-teal-400',
        glow: '',
        label: 'On Track',
        textColor: 'text-emerald-400',
      };
  }
};

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  percentage,
  status,
  height = 'h-2.5',
  showStatusBadge = false,
}) => {
  const theme = getStatusTheme(status);
  const visualWidth = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="w-full space-y-1.5">
      {showStatusBadge && (
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-0.5 rounded-md font-medium border text-[11px] ${theme.badgeBg}`}>
            {theme.label}
          </span>
          <span className={`font-mono font-semibold ${theme.textColor}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full ${height} overflow-hidden p-[1px]`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient} ${theme.glow} transition-all duration-500 ease-out`}
          style={{ width: `${visualWidth}%` }}
        />
      </div>
    </div>
  );
};
