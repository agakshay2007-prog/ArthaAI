import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { CreateBudgetInput, BudgetPeriod } from '../../types/budget';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBudget: (input: CreateBudgetInput) => Promise<boolean> | void;
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

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  onAddBudget,
}) => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [limit, setLimit] = useState('');
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [description, setDescription] = useState('');
  const [thresholds, setThresholds] = useState<number[]>([50, 75, 90, 100]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePeriodChange = (newPeriod: BudgetPeriod) => {
    setPeriod(newPeriod);
    const d = new Date();
    if (newPeriod === 'yearly') {
      const yearStart = new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0];
      const yearEnd = new Date(d.getFullYear(), 11, 31).toISOString().split('T')[0];
      setStartDate(yearStart);
      setEndDate(yearEnd);
    } else {
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(monthStart);
      setEndDate(monthEnd);
    }
  };

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

    const payload: CreateBudgetInput = {
      name: name.trim(),
      category,
      period,
      limit: parsedLimit,
      startDate,
      endDate,
      description: description.trim() || undefined,
      alertThresholds: thresholds.length > 0 ? thresholds : [50, 75, 90, 100],
      currency: 'USD',
    };

    setIsSubmitting(true);
    try {
      const result = await onAddBudget(payload);
      if (result === false) {
        setIsSubmitting(false);
        return;
      }
      onClose();
      // Reset form
      setName('');
      setLimit('');
      setDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create budget');
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
            <PlusCircle className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-base text-white">Create New Budget</h3>
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
              placeholder="e.g. Monthly Grocery & Dinners"
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
                onChange={(e) => handlePeriodChange(e.target.value as BudgetPeriod)}
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
              placeholder="e.g. 850.00"
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
            <p className="text-[11px] text-slate-500 mt-1">
              You will be notified when spending reaches these utilization percentages.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes, targets, or purpose of this budget..."
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
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Budget</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
