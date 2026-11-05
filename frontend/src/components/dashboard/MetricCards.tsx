import React from 'react';
import { Wallet, TrendingUp, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DEMO_FINANCIAL_SUMMARY } from '../../data/mockFinanceData';

interface MetricCardsProps {
  summary?: typeof DEMO_FINANCIAL_SUMMARY;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary = DEMO_FINANCIAL_SUMMARY }) => {
  const cards = [
    {
      title: 'Total Net Worth',
      value: `$${summary.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: `+${summary.balanceChangePercentage}%`,
      isPositive: true,
      subtext: 'vs last month',
      icon: Wallet,
      gradient: 'from-violet-600/20 via-indigo-600/10 to-transparent',
      borderColor: 'border-violet-500/30',
      iconBg: 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-glow-violet',
    },
    {
      title: 'Monthly Inflow',
      value: `$${summary.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: `+${summary.incomeChangePercentage}%`,
      isPositive: true,
      subtext: 'vs last month',
      icon: TrendingUp,
      gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow',
    },
    {
      title: 'Monthly Outflow',
      value: `$${summary.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: `${summary.expensesChangePercentage}%`,
      isPositive: true, // Lower expenses is positive
      subtext: 'favorable vs June',
      icon: CreditCard,
      gradient: 'from-amber-600/20 via-rose-600/10 to-transparent',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow',
    },
    {
      title: 'Total Liquid Savings',
      value: `$${summary.totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: `${summary.savingsRatePercentage}% rate`,
      isPositive: true,
      subtext: '38.6% of income saved',
      icon: PiggyBank,
      gradient: 'from-cyan-600/20 via-blue-600/10 to-transparent',
      borderColor: 'border-cyan-500/30',
      iconBg: 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden border ${card.borderColor}`}
          >
            {/* Ambient Corner Glow */}
            <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${card.gradient} blur-2xl pointer-events-none`} />

            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-semibold text-slate-400 tracking-wide">{card.title}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 font-mono">
              {card.value}
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span
                className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded-md ${
                  card.isPositive
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                }`}
              >
                {card.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
                )}
                {card.change}
              </span>
              <span className="text-slate-400 text-[11px] truncate">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

