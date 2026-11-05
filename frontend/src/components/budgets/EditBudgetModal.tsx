import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';
import { Budget, UpdateBudgetInput, BudgetPeriod } from '../../types/budget';

interface EditBudgetModalProps {
  isOpen: boolean;
  budget: Budget | null;
  onClose: () => void;
  onUpdateBudget: (id: string, updates: UpdateBudgetInput) => Promise<boolean> | void;
}

const CATEGORIES = [
  'Food & Dining',
  'Technology & SaaS',
  'Housing & Rent',
  'Transportation',
  'Utilities & Bills',
  'Entertainment & Leisure',
  'Healthcare & Wellness',
  'Shopping & Retail',
  'Salary & Earnings',
  'Investments & Dividends',
  'Other',
];

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  budget,
  onClose,
  onUpdateBudget,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [limit, setLimit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [thresholds, setThresholds] = useState<number[]>([50, 75, 90, 100]);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (budget) {
      setName(budget.name || '');
      setCategory(budget.category || CATEGORIES[0]);
      setPeriod(budget.period || 'monthly');
      setLimit(budget.limit !== undefined ? budget.limit.toString() : '');
      setStartDate(budget.startDate ? budget.startDate.split('T')[0] : '');
      setEndDate(budget.endDate ? budget.endDate.split('T')[0] : '');
      setDescription(budget.description || '');
      setThresholds(budget.alertThresholds || [50, 75, 90, 100]);
      setIsActive(budget.isActive !== undefined ? budget.isActive : true);
      setError(null);
    }
  }, [budget]);

  if (!isOpen || !budget) return null;

  const toggleThreshold = (val: number) => {
    if (thresholds.includes(val)) {
      setThresholds(thresholds.filter((t) => t !== val));
    } else {
      setThresholds([...thresholds, val].sort((a, b) => a - b));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedLimit = parseFloat(limit);
    if (!name.trim()) {
      setError('Budget name is required');
      return;
    }
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('Please enter a valid positive budget limit');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start date and end date are required');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    const updates: UpdateBudgetInput = {
      name: name.trim(),
      category,
      period,
      limit: parsedLimit,
      startDate,
      endDate,
      description: description.trim() || undefined,
      alertThresholds: thresholds.length > 0 ? thresholds : [50, 75, 90, 100],
      isActive,
    };

    setIsSubmitting(true);
    try {
      const result = await onUpdateBudget(budget.id, updates);
      if (result === false) {
        setIsSubmitting(false);
        return;
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-base text-white">Edit Budget</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Budget Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Budget Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              required
            />
          </div>

          {/* Category & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Period <span className="text-rose-400">*</span>
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Limit Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Spending Limit ($ USD) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-brand-500 transition"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                End Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                required
              />
            </div>
          </div>

          {/* Alert Thresholds Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Alert Trigger Thresholds
            </label>
            <div className="flex items-center space-x-2">
              {[50, 75, 90, 100].map((t) => {
                const active = thresholds.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleThreshold(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      active
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {t}%
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Active Budget Tracking</div>
              <div className="text-[11px] text-slate-400">
                Inactive budgets are archived from real-time alert calculations
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500" />
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
