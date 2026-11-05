import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, PauseCircle } from 'lucide-react';
import { BillSchedulePaymentStatus, BillStatus } from '../../types/bill';

interface BillStatusBadgeProps {
  status: BillSchedulePaymentStatus | BillStatus;
  size?: 'sm' | 'md';
}

export const BillStatusBadge: React.FC<BillStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'paid':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Paid</span>
        </span>
      );

    case 'due_today':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse ${sizeClasses}`}
        >
          <AlertCircle className="w-3 h-3" />
          <span>Due Today</span>
        </span>
      );

    case 'overdue':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Overdue</span>
        </span>
      );

    case 'partial':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3" />
          <span>Partially Paid</span>
        </span>
      );

    case 'paused':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}
        >
          <PauseCircle className="w-3 h-3" />
          <span>Paused</span>
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-slate-800/80 text-slate-500 border border-slate-700/60 ${sizeClasses}`}
        >
          <span>Cancelled</span>
        </span>
      );

    case 'upcoming':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3" />
          <span>Upcoming</span>
        </span>
      );
  }
};
