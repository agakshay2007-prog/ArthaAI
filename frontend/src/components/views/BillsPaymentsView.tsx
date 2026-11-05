import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Calendar,
  DollarSign,
  Repeat,
  CheckCircle2,
} from 'lucide-react';
import { Bill, BillOverview } from '../../types/bill';
import { BillCard } from '../bills/BillCard';

interface BillsPaymentsViewProps {
  bills: Bill[];
  overview: BillOverview | null;
  isLoading?: boolean;
  onOpenNewBill: () => void;
  onRecordPayment: (bill: Bill) => void;
  onViewHistory: (bill: Bill) => void;
  onViewAnalytics: (bill: Bill) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
  onRefresh?: () => void;
}

export const BillsPaymentsView: React.FC<BillsPaymentsViewProps> = ({
  bills,
  overview,
  isLoading = false,
  onOpenNewBill,
  onRecordPayment,
  onViewHistory,
  onViewAnalytics,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'paid'>('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    bills.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [bills]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      // Tab filter
      if (activeTab === 'upcoming' && bill.paymentStatus === 'paid') return false;
      if (activeTab === 'paid' && bill.paymentStatus !== 'paid') return false;

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'overdue' && !bill.isOverdue) return false;
        if (selectedStatus === 'due_today' && bill.paymentStatus !== 'due_today') return false;
        if (selectedStatus === 'paid' && bill.paymentStatus !== 'paid') return false;
        if (selectedStatus === 'active' && bill.status !== 'active') return false;
        if (selectedStatus === 'paused' && bill.status !== 'paused') return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && bill.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = bill.name.toLowerCase().includes(q);
        const matchProvider = bill.provider?.toLowerCase().includes(q);
        const matchCategory = bill.category?.toLowerCase().includes(q);
        if (!matchName && !matchProvider && !matchCategory) return false;
      }

      return true;
    });
  }, [bills, activeTab, selectedStatus, selectedCategory, searchQuery]);

  // Urgent reminders (overdue or due today)
  const urgentReminders = overview?.reminders.filter((r) => r.isUrgent) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-brand-600/30 to-violet-600/20 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/10">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Bills & Recurring Payments</h1>
            <p className="text-xs text-slate-400">
              Scheduled obligations, automated reminders & recurring expense tracking
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh bills"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenNewBill}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Bill</span>
          </button>
        </div>
      </div>

      {/* 2. High-Level Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Monthly Recurring Commitment */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monthly Recurring</span>
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            ${(overview?.totalMonthlyRecurring ?? 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Normalized commitment</div>
        </div>

        {/* Metric 2: Paid This Month */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Paid This Month</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
            ${(overview?.totalPaidThisMonth ?? 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {overview?.paidBillsCount ?? 0} bills completed
          </div>
        </div>

        {/* Metric 3: Pending Balance */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Due</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-2">
            ${(overview?.totalPendingAmount ?? 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {overview?.unpaidBillsCount ?? 0} active obligations
          </div>
        </div>

        {/* Metric 4: Upcoming Payments */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Upcoming (30d)</span>
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {overview?.upcomingPaymentsCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Scheduled payments</div>
        </div>

        {/* Metric 5: Overdue Alerts */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Attention Required</span>
            <div
              className={`p-1.5 rounded-lg ${
                (overview?.overdueBillsCount ?? 0) > 0
                  ? 'bg-rose-500/15 text-rose-400 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl font-bold font-mono mt-2 ${
              (overview?.overdueBillsCount ?? 0) > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {overview?.overdueBillsCount ?? 0} Overdue
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Immediate action needed</div>
        </div>
      </div>

      {/* 3. Urgent Reminders & Alerts Banner */}
      {urgentReminders.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Payment Reminders & Critical Alerts</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {urgentReminders.map((r) => {
              const matchedBill = bills.find((b) => b.id === r.billId);
              return (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-rose-500/20 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{r.billName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        ${r.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[11px] text-rose-300">{r.message}</div>
                  </div>

                  {matchedBill && (
                    <button
                      onClick={() => onRecordPayment(matchedBill)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold whitespace-nowrap shadow-sm shadow-rose-600/30 transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Controls: Tabs, Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        {/* Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Bills ({bills.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming / Unpaid ({bills.filter((b) => b.paymentStatus !== 'paid').length})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'paid'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paid ({bills.filter((b) => b.paymentStatus === 'paid').length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bills or billers..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs w-48 lg:w-56 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="due_today">Due Today</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Bills Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-48 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-3 border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto border border-brand-500/20">
            <CalendarClock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Bills Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'No bills match your current search or filter criteria. Try clearing filters.'
              : 'You have not added any recurring bills or subscriptions yet. Create your first bill to start tracking obligations.'}
          </p>
          <button
            onClick={onOpenNewBill}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Bill</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onRecordPayment={onRecordPayment}
              onViewHistory={onViewHistory}
              onViewAnalytics={onViewAnalytics}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
