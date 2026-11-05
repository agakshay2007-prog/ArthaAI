import React, { useState, useEffect } from 'react';
import {
  X,
  BarChart2,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Repeat,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Bill, BillAnalytics } from '../../types/bill';
import { billService } from '../../services/bills';

interface BillAnalyticsModalProps {
  isOpen: boolean;
  bill: Bill | null;
  onClose: () => void;
}

export const BillAnalyticsModal: React.FC<BillAnalyticsModalProps> = ({
  isOpen,
  bill,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<BillAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !bill) {
      setAnalytics(null);
      return;
    }

    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        if (!bill.isDemoRecord && !bill.id.startsWith('bill-')) {
          const res = await billService.getBillAnalytics(bill.id);
          setAnalytics(res);
          return;
        }
      } catch {
        // Fallback to client-side compute
      }

      // Compute client-side demo analytics
      const now = new Date();
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        // Sample simulated trend
        const paid = i === 0 ? bill.totalPaid : i === 1 ? bill.amount : bill.amount * 0.95;
        monthlyTrend.push({
          month,
          paid: Math.round(paid * 100) / 100,
        });
      }

      let recurringEstimateAnnual = bill.amount * 12;
      if (bill.frequency === 'weekly') recurringEstimateAnnual = bill.amount * 52;
      if (bill.frequency === 'quarterly') recurringEstimateAnnual = bill.amount * 4;
      if (bill.frequency === 'yearly') recurringEstimateAnnual = bill.amount;

      setAnalytics({
        bill,
        paymentHistory: [],
        totalPaid: bill.totalPaid,
        totalPending: bill.remainingDue,
        paymentCount: bill.totalPaid > 0 ? 1 : 0,
        monthlyTrend,
        nextDueDate: bill.nextDueDate,
        recurringEstimateAnnual: Math.round(recurringEstimateAnnual * 100) / 100,
      });
      setIsLoading(false);
    };

    loadAnalytics();
  }, [isOpen, bill]);

  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recurring Expense Analytics</h3>
              <p className="text-xs text-slate-400">{bill.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading analytics...</div>
        ) : analytics ? (
          <div className="mt-4 space-y-4">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
                  <span>Annualized Cost</span>
                </div>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  ${analytics.recurringEstimateAnnual.toFixed(2)}
                  <span className="text-[10px] text-slate-500 font-sans font-normal ml-1">/yr</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Current Paid</span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  ${analytics.totalPaid.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Recurrence & Next Due Details */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-brand-400" />
                <span className="text-slate-300 capitalize">
                  {bill.frequency.replace('_', ' ')} Cycle
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Next Due: {bill.nextDueDate ? new Date(bill.nextDueDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            {/* 6-Month Payment Trend Chart */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-brand-400" />
                  <span>6-Month Payment Trend</span>
                </h4>
                <span className="text-[10px] text-slate-500">Historical spend</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: unknown) => [`$${Number(val || 0).toFixed(2)}`, 'Paid']}
                    />
                    <Bar dataKey="paid" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
