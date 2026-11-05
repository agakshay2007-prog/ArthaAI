import React, { useState, useMemo } from 'react';
import {
  PiggyBank,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { Budget, BudgetOverview, BudgetPeriod } from '../../types/budget';
import { BudgetCard } from '../budgets/BudgetCard';

interface BudgetingViewProps {
  budgets: Budget[];
  overview: BudgetOverview | null;
  isLoading?: boolean;
  onOpenAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
  onDeleteBudget: (budget: Budget) => void;
  onViewAnalytics: (budget: Budget) => void;
  onRefresh?: () => void;
}

export const BudgetingView: React.FC<BudgetingViewProps> = ({
  budgets,
  overview,
  isLoading = false,
  onOpenAddBudget,
  onEditBudget,
  onDeleteBudget,
  onViewAnalytics,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | BudgetPeriod>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'exceeded'>('all');

  // Compute categories list from existing budgets
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    budgets.forEach((b) => cats.add(b.category));
    return Array.from(cats);
  }, [budgets]);

  // Filter budgets
  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      // Period
      if (periodFilter !== 'all' && b.period !== periodFilter) return false;
      // Category
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      // Status
      if (statusFilter === 'active' && !b.isActive) return false;
      if (statusFilter === 'warning' && b.status !== 'warning' && b.status !== 'critical') return false;
      if (statusFilter === 'exceeded' && b.status !== 'exceeded') return false;
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(query);
        const matchCat = b.category.toLowerCase().includes(query);
        const matchDesc = b.description?.toLowerCase().includes(query);
        if (!matchName && !matchCat && !matchDesc) return false;
      }
      return true;
    });
  }, [budgets, periodFilter, categoryFilter, statusFilter, searchQuery]);

  // Aggregate summary
  const activeBudgets = budgets.filter((b) => b.isActive !== false);
  const totalLimit = overview?.totalLimit ?? activeBudgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = overview?.totalSpent ?? activeBudgets.reduce((acc, b) => acc + b.actualSpent, 0);
  const remaining = totalLimit - totalSpent;
  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  // Active breached alerts
  const breachedAlerts = useMemo(() => {
    const list: { budgetName: string; category: string; message: string; isExceeded: boolean }[] = [];
    activeBudgets.forEach((b) => {
      if (b.status === 'exceeded') {
        list.push({
          budgetName: b.name,
          category: b.category,
          message: `Spending exceeded limit by $${Math.abs(b.remaining).toLocaleString()} (${b.utilizationPercentage}%)`,
          isExceeded: true,
        });
      } else if (b.status === 'critical' || b.status === 'warning') {
        list.push({
          budgetName: b.name,
          category: b.category,
          message: `Reached ${b.utilizationPercentage}% of limit ($${b.actualSpent.toLocaleString()} / $${b.limit.toLocaleString()})`,
          isExceeded: false,
        });
      }
    });
    return list;
  }, [activeBudgets]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Budget Management</h2>
            <p className="text-xs text-slate-400">
              Real-time expense aggregation, threshold alerts, and velocity tracking
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Refresh Budgets"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenAddBudget}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Allocated Limit */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Budget Cap</div>
          <div className="text-2xl font-bold text-white font-mono">${totalLimit.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span>{activeBudgets.length} active spending caps</span>
          </div>
        </div>

        {/* Card 2: Actual Spent */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Current Spend</div>
          <div className="text-2xl font-bold text-brand-300 font-mono">${totalSpent.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {overallPercentage}% of aggregate budget consumed
          </div>
        </div>

        {/* Card 3: Safety Buffer Remaining */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Remaining Safety Buffer</div>
          <div
            className={`text-2xl font-bold font-mono ${
              remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {remaining >= 0 ? `+$${remaining.toLocaleString()}` : `-$${Math.abs(remaining).toLocaleString()}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {remaining >= 0 ? 'Within target parameters' : 'Deficit exceeded target'}
          </div>
        </div>

        {/* Card 4: Overall Health & Status */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Discipline Status</div>
          <div className="text-2xl font-bold text-white font-mono">{overallPercentage}%</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            {breachedAlerts.length > 0 ? (
              <span className="text-amber-400 font-medium flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{breachedAlerts.length} threshold alerts active</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>All categories within safe limits</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Threshold Alerts Banner (if any breached) */}
      {breachedAlerts.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5 space-y-2">
          <div className="flex items-center space-x-2 text-amber-300 font-semibold text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Active Spending Threshold Alerts ({breachedAlerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {breachedAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  alert.isExceeded
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="truncate mr-2">
                  <span className="font-bold text-white">{alert.budgetName}: </span>
                  <span>{alert.message}</span>
                </div>
                <span className="shrink-0 text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900/80">
                  {alert.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search budgets..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap gap-y-2">
          {/* Period Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Periods</option>
              <option value="monthly" className="bg-slate-900 text-white">Monthly</option>
              <option value="yearly" className="bg-slate-900 text-white">Yearly</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">All Statuses</option>
            <option value="active" className="bg-slate-900 text-white">Active Only</option>
            <option value="warning" className="bg-slate-900 text-white">Warning (≥75%)</option>
            <option value="exceeded" className="bg-slate-900 text-white">Exceeded (≥100%)</option>
          </select>
        </div>
      </div>

      {/* Grid of Budget Cards */}
      {filteredBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBudgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={onEditBudget}
              onDelete={onDeleteBudget}
              onViewAnalytics={onViewAnalytics}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <PiggyBank className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Budgets Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {searchQuery || periodFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'No budgets match the selected filters. Try resetting the search or filter options.'
                : 'Start organizing your spending discipline by creating your first budget.'}
            </p>
          </div>
          <button
            onClick={onOpenAddBudget}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Budget</span>
          </button>
        </div>
      )}
    </div>
  );
};
