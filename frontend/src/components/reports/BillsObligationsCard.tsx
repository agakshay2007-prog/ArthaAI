import React from 'react';
import { Receipt, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { BillReportItem } from '../../types/reports';

interface BillsObligationsCardProps {
  bills: BillReportItem[];
}

export const BillsObligationsCard: React.FC<BillsObligationsCardProps> = ({ bills }) => {
  if (!bills || bills.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Receipt className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recurring Bills & Obligations
          </h3>
        </div>
        <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
          <p>No recurring bill obligations detected for this period.</p>
        </div>
      </div>
    );
  }

  const totalCommitted = bills.reduce((sum, b) => sum + b.amount, 0);
  const overdueCount = bills.filter((b) => b.status === 'overdue' || b.paymentStatus === 'overdue').length;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recurring Bills & Obligations
            </h3>
            <p className="text-xs text-slate-400">
              Contractual liabilities and periodic payment schedules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400 mr-2">Total Obligations:</span>
            <span className="text-white font-bold">
              ${totalCommitted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {overdueCount > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-xl text-xs font-mono text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{overdueCount} Overdue</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bills.map((bill) => {
          const isPaid = bill.status === 'paid' || bill.paymentStatus === 'paid';
          const isOverdue = bill.status === 'overdue' || bill.paymentStatus === 'overdue';

          return (
            <div
              key={`${bill.name}-${bill.dueDate}`}
              className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                  {bill.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    isPaid
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : isOverdue
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle className="w-2.5 h-2.5" />
                  ) : isOverdue ? (
                    <AlertCircle className="w-2.5 h-2.5" />
                  ) : (
                    <Calendar className="w-2.5 h-2.5" />
                  )}
                  {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Due'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1 pt-2 border-t border-slate-800/60 font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">
                    {bill.frequency} • {bill.category}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </span>
                </div>

                <span className="text-sm font-bold text-white">
                  ${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

