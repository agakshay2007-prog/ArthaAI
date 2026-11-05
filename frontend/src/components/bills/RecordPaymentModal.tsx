import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  Receipt,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Bill, RecordPaymentInput } from '../../types/bill';

interface RecordPaymentModalProps {
  isOpen: boolean;
  bill: Bill | null;
  onClose: () => void;
  onRecordPayment: (billId: string, input: RecordPaymentInput) => Promise<void>;
}

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer (ACH / Wire)' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'auto_debit', label: 'Auto-Debit (ACH)' },
  { value: 'upi', label: 'UPI / Instant Transfer' },
  { value: 'cash', label: 'Cash / Check' },
  { value: 'other', label: 'Other Method' },
];

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  bill,
  onClose,
  onRecordPayment,
}) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [createTransaction, setCreateTransaction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bill && isOpen) {
      // Prefill with remaining due (or full amount if remaining is 0)
      const defaultAmount = bill.remainingDue > 0 ? bill.remainingDue : bill.amount;
      setAmount(defaultAmount.toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setReferenceNumber('');
      setNotes('');
      setError(null);
    }
  }, [bill, isOpen]);

  if (!isOpen || !bill) return null;

  const parsedAmount = parseFloat(amount) || 0;
  const newTotalPaid = bill.totalPaid + parsedAmount;
  const resultingRemaining = Math.max(0, bill.amount - newTotalPaid);
  const isFullPayment = parsedAmount >= bill.remainingDue && bill.remainingDue > 0;
  const isPartialPayment = parsedAmount > 0 && parsedAmount < bill.remainingDue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedAmount <= 0) {
      setError('Please enter a valid positive payment amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRecordPayment(bill.id, {
        amount: parsedAmount,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        createTransaction,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Record Bill Payment</h3>
              <p className="text-xs text-slate-400">{bill.name}</p>
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

        {/* Live Calculation Preview Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Cycle Due:</span>
            <span className="font-mono font-semibold text-white">${bill.amount.toFixed(2)}</span>
          </div>
          {bill.totalPaid > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Already Paid:</span>
              <span className="font-mono text-cyan-400">${bill.totalPaid.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Remaining Balance:</span>
            <span className="font-mono font-bold text-brand-300">${bill.remainingDue.toFixed(2)}</span>
          </div>

          {parsedAmount > 0 && (
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-300">Status After Payment:</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  isFullPayment
                    ? 'text-emerald-400'
                    : isPartialPayment
                    ? 'text-cyan-400'
                    : 'text-brand-300'
                }`}
              >
                {isFullPayment ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid ($0.00 left)
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" /> Partial (${resultingRemaining.toFixed(2)} left)
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Payment Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment Amount ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white font-mono text-sm font-bold focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Payment Date & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference / Confirmation Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reference / Confirmation # (Optional)
            </label>
            <div className="relative">
              <Receipt className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. TXN-998812, CONF#4412"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Ledger Transaction Creation Toggle */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-brand-400 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-white">Record in Transaction Ledger</div>
                  <div className="text-[11px] text-slate-400">
                    Also record this payment as an expense in your main banking ledger
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={createTransaction}
                onChange={(e) => setCreateTransaction(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 bg-slate-900 border-slate-700 focus:ring-brand-500 ml-3"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via Apple Pay confirmation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>This records user-reported payment status and does not initiate a bank transfer.</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
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
              {isSubmitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
