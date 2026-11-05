import React from 'react';
import {
  CalendarClock,
  ChevronRight,
  CreditCard,
  AlertTriangle,
  Repeat,
  CheckCircle2,
} from 'lucide-react';
import { Bill, BillOverview } from '../../types/bill';

interface UpcomingBillsCardProps {
  bills: Bill[];
  overview: BillOverview | null;
  onNavigateToBills: () => void;
  onQuickPay?: (bill: Bill) => void;
}

export const UpcomingBillsCard: React.FC<UpcomingBillsCardProps> = ({
  bills,
  overview,
  onNavigateToBills,
  onQuickPay,
}) => {
  const unpaidBills = bills
    .filter((b) => b.status === 'active' && b.paymentStatus !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const overdueCount = overview?.overdueBillsCount || bills.filter((b) => b.isOverdue).length;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Bills & Subscriptions</h3>
            <p className="text-xs text-slate-400">Scheduled commitments & recurring outflows</p>
          </div>
        </div>

        <button
          onClick={onNavigateToBills}
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors group"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Monthly Recurring Commitment Badge */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Repeat className="w-4 h-4 text-brand-400" />
          <span>Monthly Recurring Outflows</span>
        </div>
        <div className="text-base font-bold font-mono text-white">
          ${(overview?.totalMonthlyRecurring ?? 0).toFixed(2)}
          <span className="text-[10px] text-slate-500 font-sans font-normal ml-1">/mo</span>
        </div>
      </div>

      {/* Overdue Alert Banner if any overdue */}
      {overdueCount > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-pulse" />
            <span>{overdueCount} bill{overdueCount === 1 ? ' is' : 's are'} overdue</span>
          </div>
          <button
            onClick={onNavigateToBills}
            className="text-[11px] font-semibold underline hover:text-rose-200"
          >
            Review
          </button>
        </div>
      )}

      {/* Upcoming List */}
      <div className="space-y-2.5">
        {unpaidBills.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <div className="text-xs text-slate-300 font-medium">All Caught Up!</div>
            <div className="text-[11px] text-slate-500">No pending bills due in the near future.</div>
          </div>
        ) : (
          unpaidBills.slice(0, 3).map((bill) => (
            <div
              key={bill.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{bill.name}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span>{bill.category}</span>
                  <span>•</span>
                  <span
                    className={
                      bill.isOverdue
                        ? 'text-rose-400 font-bold'
                        : bill.daysUntilDue === 0
                        ? 'text-amber-400 font-bold'
                        : 'text-slate-400'
                    }
                  >
                    {bill.isOverdue
                      ? `Overdue (${Math.abs(bill.daysUntilDue)}d)`
                      : bill.daysUntilDue === 0
                      ? 'Due Today'
                      : `Due in ${bill.daysUntilDue}d`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="font-mono font-bold text-white text-xs">
                  ${bill.remainingDue.toFixed(2)}
                </span>
                {onQuickPay && (
                  <button
                    onClick={() => onQuickPay(bill)}
                    className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-white border border-brand-500/20 transition-colors"
                    title="Record Payment"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
