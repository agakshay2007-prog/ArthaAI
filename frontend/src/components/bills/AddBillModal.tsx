import React, { useState } from 'react';
import { X, CalendarClock, DollarSign, Calendar, Bell, Repeat } from 'lucide-react';
import { CreateBillInput, BillFrequency, BillCategory } from '../../types/bill';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBill: (input: CreateBillInput) => Promise<void>;
}

const CATEGORIES: BillCategory[] = [
  'Electricity',
  'Water',
  'Internet',
  'Mobile',
  'Rent',
  'Insurance',
  'Education',
  'Loan EMI',
  'Streaming subscriptions',
  'Transportation',
  'Healthcare',
  'Technology',
  'Utilities',
  'Other',
];

const FREQUENCIES: { value: BillFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly (Recurring)' },
  { value: 'weekly', label: 'Weekly (Every 7 days)' },
  { value: 'quarterly', label: 'Quarterly (Every 3 months)' },
  { value: 'yearly', label: 'Yearly (Annual)' },
  { value: 'one_time', label: 'One-Time Obligation' },
];

export const AddBillModal: React.FC<AddBillModalProps> = ({ isOpen, onClose, onAddBill }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BillCategory>('Utilities');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');

  // Default due date: 15 days from now
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);
  const [dueDate, setDueDate] = useState(defaultDueDate.toISOString().split('T')[0]);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoRenew, setAutoRenew] = useState(true);
  const [reminderDays, setReminderDays] = useState<number[]>([7, 3, 1]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleReminderDay = (day: number) => {
    if (reminderDays.includes(day)) {
      setReminderDays(reminderDays.filter((d) => d !== day));
    } else {
      setReminderDays([...reminderDays, day].sort((a, b) => b - a));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!name.trim()) {
      setError('Bill name is required');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive bill amount');
      return;
    }
    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddBill({
        name: name.trim(),
        category,
        provider: provider.trim() || undefined,
        amount: parsedAmount,
        currency: 'USD',
        frequency,
        startDate,
        dueDate,
        autoRenew: frequency !== 'one_time' ? autoRenew : false,
        reminderDays,
        description: description.trim() || undefined,
      });

      // Reset form
      setName('');
      setProvider('');
      setAmount('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Create New Bill</h3>
              <p className="text-xs text-slate-400">Configure recurring obligation or one-time payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Bill Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bill / Subscription Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High-Speed Fiber Internet"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Category & Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BillCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Biller / Provider
              </label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. AT&T, PG&E, Netflix"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Amount & Recurrence Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount ($) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="85.00"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Frequency *</label>
              <div className="relative">
                <Repeat className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as BillFrequency)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Due Date & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                First Due Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Reminder Days Configuration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-brand-400" />
              <span>In-App Payment Reminders</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[7, 3, 1].map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleReminderDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    reminderDays.includes(day)
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {day} Day{day === 1 ? '' : 's'} Before
                </button>
              ))}
            </div>
          </div>

          {/* Auto Renew Toggle (if recurring) */}
          {frequency !== 'one_time' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Auto-Renew Schedule</div>
                <div className="text-[11px] text-slate-400">
                  Automatically roll due date to next period when payment is recorded
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-slate-900 border-slate-700 focus:ring-brand-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
