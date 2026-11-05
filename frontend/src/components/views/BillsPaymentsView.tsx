import React from 'react';
import { CalendarClock, ShieldCheck, Zap } from 'lucide-react';
import { DEMO_BILL_PAYMENTS } from '../../data/mockFinanceData';

export const BillsPaymentsView: React.FC = () => {
  const totalBills = DEMO_BILL_PAYMENTS.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Recurring Bills & Subscriptions</h2>
            <p className="text-xs text-slate-400">Scheduled obligations and automated payment status</p>
          </div>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          Monthly Commitments: <strong className="text-white">${totalBills.toFixed(2)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEMO_BILL_PAYMENTS.map((bill) => (
          <div key={bill.id} className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-brand-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">{bill.title}</h4>
                <div className="text-[11px] text-slate-400">{bill.biller}</div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>Due {bill.dueDate}</span>
                  {bill.isAutoPay && (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> AutoPay Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-base font-bold font-mono text-white">${bill.amount.toFixed(2)}</div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 mt-1 inline-block">
                Scheduled
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
