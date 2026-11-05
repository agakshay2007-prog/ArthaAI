import React, { useState } from 'react';
import {
  ReceiptText,
  ArrowDownLeft,
  Search,
  ExternalLink,
  Briefcase,
  Utensils,
  Laptop,
  TrendingUp,
  Activity,
  Home,
  Car,
  ShoppingBag,
} from 'lucide-react';
import { Transaction, TransactionCategory } from '../../types/finance';
import { DEMO_TRANSACTIONS } from '../../data/mockFinanceData';

interface RecentTransactionsCardProps {
  transactions?: Transaction[];
  onViewAll?: () => void;
  isLive?: boolean;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions = DEMO_TRANSACTIONS,
  onViewAll,
  isLive = false,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [cardSearch, setCardSearch] = useState('');

  const getCategoryIcon = (category: TransactionCategory) => {
    switch (category) {
      case 'Salary & Earnings':
        return Briefcase;
      case 'Food & Dining':
        return Utensils;
      case 'Technology & SaaS':
        return Laptop;
      case 'Investments & Dividends':
        return TrendingUp;
      case 'Healthcare & Wellness':
        return Activity;
      case 'Housing & Rent':
        return Home;
      case 'Transportation':
        return Car;
      default:
        return ShoppingBag;
    }
  };

  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSearch =
      cardSearch === '' ||
      tx.title.toLowerCase().includes(cardSearch.toLowerCase()) ||
      (tx.category && tx.category.toLowerCase().includes(cardSearch.toLowerCase())) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(cardSearch.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
      <div>
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Recent Transactions</h3>
              <p className="text-[11px] text-slate-400">
                {isLive ? 'Live database records' : 'Demonstration ledger'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter Pills */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filterType === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filterType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Inflow
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filterType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Outflow
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search inside card */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={cardSearch}
            onChange={(e) => setCardSearch(e.target.value)}
            placeholder="Filter recent transactions..."
            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Transaction Rows */}
        <div className="divide-y divide-slate-800/60 max-h-[360px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {transactions.length === 0 ? 'No transactions recorded yet.' : 'No transactions match criteria.'}
            </div>
          ) : (
            filtered.slice(0, 6).map((tx) => {
              const Icon = getCategoryIcon(tx.category);
              const isIncome = tx.type === 'income';

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-800/20 px-2 rounded-xl transition">
                  <div className="flex items-center space-x-3 overflow-hidden pr-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        <span>{tx.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-bold font-mono flex items-center justify-end ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isIncome ? (
                        <>
                          <ArrowDownLeft className="w-3.5 h-3.5 mr-0.5 text-emerald-400 inline" />
                          +${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </>
                      ) : (
                        <>
                          -${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">{tx.account ? tx.account.split(' ')[0] : 'Checking'}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px]">
          {isLive ? 'Database-backed ledger entries' : 'Showing top recent ledger entries'}
        </span>
        <button
          onClick={onViewAll}
          className="text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <span>View All Transactions</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
