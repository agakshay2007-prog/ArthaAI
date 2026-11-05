import React, { useState, useEffect } from 'react';
import { X, Edit2, DollarSign, Calendar, Bell, Repeat } from 'lucide-react';
import { Bill, UpdateBillInput, BillFrequency, BillCategory, BillStatus } from '../../types/bill';

interface EditBillModalProps {
  isOpen: boolean;
  bill: Bill | null;
  onClose: () => void;
  onUpdateBill: (id: string, input: UpdateBillInput) => Promise<void>;
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

export const EditBillModal: React.FC<EditBillModalProps> = ({
  isOpen,
  bill,
  onClose,
  onUpdateBill,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BillCategory>('Utilities');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<BillFrequency>('monthly');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<BillStatus>('active');
  const [autoRenew, setAutoRenew] = useState(true);
  const [reminderDays, setReminderDays] = useState<number[]>([7, 3, 1]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bill) {
      setName(bill.name);
      setCategory(bill.category as BillCategory);
      setProvider(bill.provider || '');
      setAmount(bill.amount.toString());
      setFrequency(bill.frequency);
      setDueDate(bill.dueDate ? bill.dueDate.split('T')[0] : '');
      setStatus(bill.status);
      setAutoRenew(bill.autoRenew);
      setReminderDays(bill.reminderDays || [7, 3, 1]);
      setDescription(bill.description || '');
      setError(null);
    }
  }, [bill, isOpen]);

  if (!isOpen || !bill) return null;

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
      await onUpdateBill(bill.id, {
        name: name.trim(),
        category,
        provider: provider.trim() || undefined,
        amount: parsedAmount,
        frequency,
        dueDate,
        status,
        autoRenew,
        reminderDays,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update bill');
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
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Edit Bill Settings</h3>
              <p className="text-xs text-slate-400">Modify recurrence, due date, status, or amount</p>
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Amount & Frequency */}
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
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500 transition-colors"
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

          {/* Due Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Due Date *</label>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bill Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BillStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
              >
                <option value="active">Active (Scheduled)</option>
                <option value="paused">Paused (Temporarily on hold)</option>
                <option value="cancelled">Cancelled (Archived)</option>
                <option value="completed">Completed (Paid in full)</option>
              </select>
            </div>
          </div>

          {/* Reminder Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-brand-400" />
              <span>In-App Reminders</span>
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
