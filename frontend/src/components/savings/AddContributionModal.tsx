import React, { useState, useEffect } from 'react';
import { X, DollarSign, PlusCircle, MinusCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { SavingsGoal, AddContributionInput } from '../../types/savings';

interface AddContributionModalProps {
  isOpen: boolean;
  goal: SavingsGoal | null;
  defaultType?: 'deposit' | 'withdrawal';
  onClose: () => void;
  onSubmitContribution: (goalId: string, input: AddContributionInput) => Promise<boolean> | void;
}

export const AddContributionModal: React.FC<AddContributionModalProps> = ({
  isOpen,
  goal,
  defaultType = 'deposit',
  onClose,
  onSubmitContribution,
}) => {
  const [type, setType] = useState<'deposit' | 'withdrawal'>(defaultType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goal) {
      setType(defaultType);
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError(null);
    }
  }, [goal, defaultType, isOpen]);

  if (!isOpen || !goal) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const simulatedNewBalance =
    type === 'deposit'
      ? goal.currentAmount + parsedAmount
      : Math.max(0, goal.currentAmount - parsedAmount);

  const simulatedPercentage =
    goal.targetAmount > 0
      ? Math.min(100, Math.round((simulatedNewBalance / goal.targetAmount) * 1000) / 10)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid contribution amount greater than zero');
      return;
    }

    if (type === 'withdrawal' && parsedAmount > goal.currentAmount) {
      setError(`Cannot withdraw more than current balance ($${goal.currentAmount.toLocaleString()})`);
      return;
    }

    const payload: AddContributionInput = {
      amount: parsedAmount,
      type,
      notes: notes.trim() || undefined,
      contributionDate: date,
    };

    setIsSubmitting(true);
    try {
      const res = await onSubmitContribution(goal.id, payload);
      if (res === false) {
        setIsSubmitting(false);
        return;
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-base text-white">Record Contribution</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal Context Banner */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-white">{goal.name}</div>
            <div className="text-[11px] text-slate-400">{goal.category} &bull; Target ${goal.targetAmount.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Current Balance</div>
            <div className="font-mono font-bold text-emerald-400">${goal.currentAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Action Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Action Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('deposit')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition ${
                  type === 'deposit'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Add Deposit</span>
              </button>
              <button
                type="button"
                onClick={() => setType('withdrawal')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition ${
                  type === 'withdrawal'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MinusCircle className="w-4 h-4 text-rose-400" />
                <span>Withdraw Funds</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Amount ($ USD) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-brand-500 transition"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contribution Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly transfer from checking, bonus deposit"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          {/* Interactive Simulation Preview */}
          {parsedAmount > 0 && (
            <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-brand-300 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Simulated Balance Outcome</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>New Goal Balance:</span>
                <span className="font-mono font-bold text-white">${simulatedNewBalance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Updated Milestone Progress:</span>
                <span className="font-mono font-bold text-brand-300">{simulatedPercentage}%</span>
              </div>
            </div>
          )}

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
                  <span>Recording...</span>
                </>
              ) : (
                <span>Confirm {type === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
