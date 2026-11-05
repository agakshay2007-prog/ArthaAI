import React from 'react';
import {
  Zap,
  Droplet,
  Wifi,
  Smartphone,
  Home,
  Shield,
  GraduationCap,
  Landmark,
  Tv,
  Car,
  HeartPulse,
  CalendarClock,
  Calendar,
  CreditCard,
  History,
  BarChart2,
  Edit2,
  Trash2,
  Repeat,
  ShieldCheck,
} from 'lucide-react';
import { Bill } from '../../types/bill';
import { BillStatusBadge } from './BillStatusBadge';

interface BillCardProps {
  bill: Bill;
  onRecordPayment: (bill: Bill) => void;
  onViewHistory: (bill: Bill) => void;
  onViewAnalytics: (bill: Bill) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('electr') || cat.includes('power')) return Zap;
  if (cat.includes('water')) return Droplet;
  if (cat.includes('internet') || cat.includes('wifi') || cat.includes('fiber')) return Wifi;
  if (cat.includes('mobile') || cat.includes('phone')) return Smartphone;
  if (cat.includes('rent') || cat.includes('housing')) return Home;
  if (cat.includes('insurance')) return Shield;
  if (cat.includes('education') || cat.includes('tuition')) return GraduationCap;
  if (cat.includes('loan') || cat.includes('emi') || cat.includes('mortgage')) return Landmark;
  if (cat.includes('stream') || cat.includes('entertain') || cat.includes('subscri')) return Tv;
  if (cat.includes('transport') || cat.includes('car') || cat.includes('vehicle')) return Car;
  if (cat.includes('health') || cat.includes('medic') || cat.includes('dental')) return HeartPulse;
  return CalendarClock;
};

export const BillCard: React.FC<BillCardProps> = ({
  bill,
  onRecordPayment,
  onViewHistory,
  onViewAnalytics,
  onEdit,
  onDelete,
}) => {
  const IconComponent = getCategoryIcon(bill.category);

  const formattedDueDate = new Date(bill.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getDueCountdown = () => {
    if (bill.paymentStatus === 'paid') {
      return (
        <span className="text-emerald-400 font-medium">
          Paid for current cycle
        </span>
      );
    }
    if (bill.daysUntilDue < 0) {
      return (
        <span className="text-rose-400 font-bold">
          Overdue by {Math.abs(bill.daysUntilDue)} day{Math.abs(bill.daysUntilDue) === 1 ? '' : 's'}
        </span>
      );
    }
    if (bill.daysUntilDue === 0) {
      return <span className="text-amber-400 font-bold">Due today</span>;
    }
    if (bill.daysUntilDue === 1) {
      return <span className="text-amber-300 font-semibold">Due tomorrow</span>;
    }
    return <span className="text-slate-400">Due in {bill.daysUntilDue} days</span>;
  };

  const progressPercentage =
    bill.amount > 0 ? Math.min(100, Math.round((bill.totalPaid / bill.amount) * 100)) : 0;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-brand-500/30 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header: Category Icon, Name, Provider & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform flex-shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-brand-300 transition-colors">
                {bill.name}
              </h3>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>{bill.provider || bill.category}</span>
                {bill.autoRenew && (
                  <span className="text-[10px] text-brand-400/90 flex items-center gap-0.5">
                    • <ShieldCheck className="w-3 h-3 inline text-emerald-400" /> AutoRenew
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <BillStatusBadge status={bill.paymentStatus} />
            <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-1">
              <Repeat className="w-2.5 h-2.5 text-slate-400" />
              {bill.frequency.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Financial Details: Amount & Cycle Status */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-baseline justify-between">
          <div>
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              ${bill.amount.toFixed(2)}
            </div>
            {bill.totalPaid > 0 && bill.paymentStatus !== 'paid' && (
              <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                Paid: ${bill.totalPaid.toFixed(2)} (${bill.remainingDue.toFixed(2)} remaining)
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formattedDueDate}</span>
            </div>
            <div className="text-[11px] mt-0.5">{getDueCountdown()}</div>
          </div>
        </div>

        {/* Partial payment progress bar if partially paid */}
        {bill.totalPaid > 0 && bill.paymentStatus !== 'paid' && (
          <div className="mt-3">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onRecordPayment(bill)}
          disabled={bill.status === 'completed' || (bill.frequency === 'one_time' && bill.paymentStatus === 'paid')}
          className="flex-1 py-1.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{bill.paymentStatus === 'paid' ? 'Add Payment' : 'Pay / Record'}</span>
        </button>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onViewHistory(bill)}
            title="Payment History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewAnalytics(bill)}
            title="Analytics"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(bill)}
            title="Edit Bill"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(bill)}
            title="Archive or Delete"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
