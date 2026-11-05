import React, { useState } from 'react';
import {
  ReceiptText,
  Search,
  Filter,
  Download,
  PlusCircle,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Transaction, TransactionCategory } from '../../types/finance';

interface TransactionsViewProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onOpenAddTransaction: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
  onRefresh?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  isLoading = false,
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = transactions.filter((tx) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      tx.title.toLowerCase().includes(term) ||
      (tx.category && tx.category.toLowerCase().includes(term)) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(term)) ||
      (tx.notes && tx.notes.toLowerCase().includes(term));
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedTransactions = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['ID', 'Title', 'Category', 'Date', 'Amount', 'Type', 'Account', 'Merchant', 'Notes'];
    const rows = filtered.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${t.date}"`,
      t.amount.toFixed(2),
      t.type,
      `"${(t.account || '').replace(/"/g, '""')}"`,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `artha_ai_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories: TransactionCategory[] = [
    'Salary & Earnings',
    'Investments & Dividends',
    'Housing & Rent',
    'Food & Dining',
    'Technology & SaaS',
    'Transportation',
    'Utilities & Bills',
    'Entertainment & Leisure',
    'Healthcare & Wellness',
    'Shopping & Retail',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Transaction Ledger</h2>
              <p className="text-xs text-slate-400">
                Persistent financial records, audit logs, and transaction management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer disabled:opacity-50"
              title="Refresh transaction ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({filtered.length})</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-glow-violet transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, merchant, notes or category..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => {
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                typeFilter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setTypeFilter('income');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Inflow
            </button>
            <button
              onClick={() => {
                setTypeFilter('expense');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Outflow
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-brand-400" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-navy-900 text-white">
                All Categories
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-navy-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Transaction / Entity</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading transactions from ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="space-y-2">
                      <p className="text-slate-300 font-medium">No transactions match your filters</p>
                      <p className="text-[11px] text-slate-500">
                        {transactions.length === 0
                          ? 'Your ledger is currently empty. Click "Record Transaction" above to start tracking!'
                          : 'Try adjusting your search keyword, category, or type filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition group">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center space-x-1.5">
                          <span>{tx.title}</span>
                          {tx.isDemoRecord ? (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              Demo
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                              Live
                            </span>
                          )}
                        </div>
                        {tx.merchant && <div className="text-[10px] text-slate-500">{tx.merchant}</div>}
                        {tx.notes && <div className="text-[10px] text-slate-500 truncate max-w-xs">{tx.notes}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{tx.account}</td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{tx.date}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                          {tx.status || 'completed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={isIncome ? 'text-emerald-400' : 'text-slate-100'}>
                          {isIncome ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {onEditTransaction && (
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteTransaction && (
                            <button
                              onClick={() => onDeleteTransaction(tx)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 hover:text-white transition cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 hover:text-white transition cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
