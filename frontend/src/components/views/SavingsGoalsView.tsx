import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Lightbulb,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { SavingsGoal, SavingsOverview, GoalStatus } from '../../types/savings';
import { SavingsGoalCard } from '../savings/SavingsGoalCard';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  overview: SavingsOverview | null;
  isLoading?: boolean;
  onOpenNewGoal: () => void;
  onAddFunds: (goal: SavingsGoal) => void;
  onWithdraw: (goal: SavingsGoal) => void;
  onViewHistory: (goal: SavingsGoal) => void;
  onViewAnalytics: (goal: SavingsGoal) => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (goal: SavingsGoal) => void;
  onRefresh?: () => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  overview,
  isLoading = false,
  onOpenNewGoal,
  onAddFunds,
  onWithdraw,
  onViewHistory,
  onViewAnalytics,
  onEditGoal,
  onDeleteGoal,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GoalStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Categories list
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    goals.forEach((g) => cats.add(g.category));
    return Array.from(cats);
  }, [goals]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && g.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = g.name.toLowerCase().includes(query);
        const matchCat = g.category.toLowerCase().includes(query);
        const matchDesc = g.description?.toLowerCase().includes(query);
        if (!matchName && !matchCat && !matchDesc) return false;
      }
      return true;
    });
  }, [goals, statusFilter, categoryFilter, priorityFilter, searchQuery]);

  // Aggregate numbers
  const totalTarget = overview?.totalTargetAmount ?? goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = overview?.totalSavedAmount ?? goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalRemaining = totalTarget - totalSaved;
  const overallPercentage =
    overview?.overallProgressPercentage ??
    (totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 1000) / 10) : 0);

  const totalMonthlyRequired =
    overview?.totalMonthlyRequiredSavings ??
    goals
      .filter((g) => g.status === 'in_progress')
      .reduce((acc, g) => acc + g.requiredMonthlySavings, 0);

  const activeCount = goals.filter((g) => g.status === 'in_progress').length;
  const completedCount = goals.filter((g) => g.status === 'completed' || g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Savings & Wealth Milestones</h2>
            <p className="text-xs text-slate-400">
              Target-driven capital accumulation, velocity modeling & intelligent financial planning
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Refresh Savings Goals"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenNewGoal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Savings Goal</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Saved Amount */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Accumulated Savings</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">${totalSaved.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span>{overallPercentage}% of combined targets funded</span>
          </div>
        </div>

        {/* Card 2: Total Target Goal Cap */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Combined Goal Target</div>
          <div className="text-2xl font-bold text-white font-mono">${totalTarget.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {goals.length} capital milestones ({activeCount} active, {completedCount} completed)
          </div>
        </div>

        {/* Card 3: Remaining Capital Deficit */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Remaining Capital To Accumulate</div>
          <div className="text-2xl font-bold font-mono text-slate-200">
            ${Math.max(0, totalRemaining).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {completedCount > 0 ? `${completedCount} milestone(s) 100% fulfilled` : 'All goals actively funded'}
          </div>
        </div>

        {/* Card 4: Required Monthly Savings Pace */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Combined Required Pace</div>
          <div className="text-2xl font-bold text-brand-300 font-mono">
            ${totalMonthlyRequired.toLocaleString()}<span className="text-xs text-slate-500 font-normal">/mo</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
            <span>Monthly velocity required to hit all deadlines</span>
          </div>
        </div>
      </div>

      {/* Intelligent Financial Planning Recommendations Banner */}
      {overview?.recommendations && overview.recommendations.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-brand-500/30 bg-brand-500/5 space-y-3">
          <div className="flex items-center space-x-2 text-brand-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>ArthaAI Intelligent Savings Recommendations ({overview.recommendations.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {overview.recommendations.map((rec) => {
              const isHigh = rec.priority === 'high';
              const isMed = rec.priority === 'medium';
              return (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                    isHigh
                      ? 'bg-rose-500/10 border-rose-500/30 text-slate-200'
                      : isMed
                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-200'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-1.5 font-bold text-white mb-1">
                      {isHigh ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : (
                        <Lightbulb className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      )}
                      <span className="truncate">{rec.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{rec.description}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-brand-300 font-medium truncate">{rec.suggestedAction}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                  </div>
                </div>
              );
            })}
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
            placeholder="Search goals..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap gap-y-2">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'in_progress'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'completed'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'paused'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paused
            </button>
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

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">All Priorities</option>
            <option value="urgent" className="bg-slate-900 text-white">Urgent</option>
            <option value="high" className="bg-slate-900 text-white">High Priority</option>
            <option value="medium" className="bg-slate-900 text-white">Medium Priority</option>
            <option value="low" className="bg-slate-900 text-white">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Grid of Savings Goal Cards */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onAddFunds={onAddFunds}
              onWithdraw={onWithdraw}
              onViewHistory={onViewHistory}
              onViewAnalytics={onViewAnalytics}
              onEdit={onEditGoal}
              onDelete={onDeleteGoal}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Savings Goals Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all'
                ? 'No savings goals match your active filters. Try resetting search or filter options.'
                : 'Start accumulating capital towards your major financial objectives by setting up your first target.'}
            </p>
          </div>
          <button
            onClick={onOpenNewGoal}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Goal</span>
          </button>
        </div>
      )}
    </div>
  );
};
