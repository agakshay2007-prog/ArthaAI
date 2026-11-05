import React, { useState } from 'react';
import { X, Target, Shield, Home, Zap, Compass, AlertCircle, PlusCircle } from 'lucide-react';
import { CreateGoalInput, GoalPriority } from '../../types/savings';

interface AddSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (input: CreateGoalInput) => Promise<boolean> | void;
}

const CATEGORIES = [
  'Emergency Fund',
  'Real Estate & Housing',
  'Vehicle & Auto',
  'Travel & Adventure',
  'Retirement & Wealth',
  'Education',
  'Investments',
  'Tech & Gadgets',
  'Family & Life',
  'Other',
];

const COLORS = ['#8b5cf6', '#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'];

const ICONS = [
  { name: 'Target', label: 'Target', component: Target },
  { name: 'Shield', label: 'Safety', component: Shield },
  { name: 'Home', label: 'Property', component: Home },
  { name: 'Zap', label: 'Vehicle/Energy', component: Zap },
  { name: 'Compass', label: 'Adventure', component: Compass },
];

export const AddSavingsGoalModal: React.FC<AddSavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onAddGoal,
}) => {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const defaultDeadline = oneYearFromNow.toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [color, setColor] = useState(COLORS[0]);
  const [iconName, setIconName] = useState('Target');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = currentAmount ? parseFloat(currentAmount) : 0;

    if (!name.trim()) {
      setError('Goal name is required');
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Please enter a valid target amount greater than zero');
      return;
    }

    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      setError('Initial saved amount cannot be negative');
      return;
    }

    if (!deadline) {
      setError('Target deadline date is required');
      return;
    }

    const payload: CreateGoalInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      deadline,
      priority,
      color,
      iconName,
      currency: 'USD',
    };

    setIsSubmitting(true);
    try {
      const res = await onAddGoal(payload);
      if (res === false) {
        setIsSubmitting(false);
        return;
      }
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setTargetAmount('');
      setCurrentAmount('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create savings goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-base text-white">Create Savings Goal</h3>
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
          {/* Goal Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Goal Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Reserve, Home Down Payment"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              required
            />
          </div>

          {/* Category & Priority */}
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
                Priority Tier <span className="text-rose-400">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Target Amount & Initial Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Amount ($ USD) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="25000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-brand-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Initial Saved Balance ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Deadline <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              required
            />
          </div>

          {/* Color & Icon Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Color Accent</label>
              <div className="flex items-center space-x-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Icon Theme</label>
              <div className="flex items-center space-x-1.5">
                {ICONS.map((item) => {
                  const ItemIcon = item.component;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIconName(item.name)}
                      className={`p-1.5 rounded-xl border transition ${
                        iconName === item.name
                          ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title={item.label}
                    >
                      <ItemIcon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Strategic purpose, motivation, or target details..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          {/* Actions */}
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
                  <span>Creating Goal...</span>
                </>
              ) : (
                <span>Create Goal</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
