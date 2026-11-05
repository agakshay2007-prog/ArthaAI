import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { CreateTransactionInput, TransactionCategory, TransactionType } from '../../types/finance';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: CreateTransactionInput) => Promise<boolean> | void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<TransactionCategory>('Food & Dining');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');
  const [account, setAccount] = useState('Primary Checking');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Transaction title is required');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero');
      return;
    }

    const payload: CreateTransactionInput = {
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      merchant: merchant.trim() || undefined,
      paymentMethod,
      notes: notes.trim() || undefined,
      account: account.trim() || 'Primary Checking',
      transactionDate: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      const result = await onAddTransaction(payload);
      if (result === false) {
        // Failed
        setIsSubmitting(false);
        return;
      }
      onClose();
      setTitle('');
      setAmount('');
      setMerchant('');
      setNotes('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-base text-white">Record Transaction</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Inflow vs Outflow toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg transition cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense (Outflow)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg transition cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income (Inflow)
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Trader Joe's Groceries"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Merchant / Entity (Optional)</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Trader Joe's Store #402"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="upi">UPI / Instant Pay</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Account</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Primary Checking"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow-violet transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Add to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
