import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Receipt,
  RotateCcw,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Bill, BillPayment } from '../../types/bill';
import { billService } from '../../services/bills';
import { DEMO_BILL_PAYMENTS_LIST } from '../../data/mockFinanceData';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  bill: Bill | null;
  onClose: () => void;
  onPaymentReverted: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  bill,
  onClose,
  onPaymentReverted,
}) => {
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !bill) {
      setPayments([]);
      return;
    }

    const loadPayments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!bill.isDemoRecord && !bill.id.startsWith('bill-')) {
          const res = await billService.getBillPayments(bill.id);
          setPayments(res.payments);
          return;
        }
      } catch {
        // Fallback to client demo records
      }

      const demoList = DEMO_BILL_PAYMENTS_LIST[bill.id] || [];
      setPayments(demoList);
      setIsLoading(false);
    };

    loadPayments();
  }, [isOpen, bill]);

  if (!isOpen || !bill) return null;

  const handleRevert = async (paymentId: string) => {
    if (!confirm('Are you sure you want to revert this payment record?')) return;

    setRevertingId(paymentId);
    setError(null);
    try {
      if (!bill.isDemoRecord && !bill.id.startsWith('bill-')) {
        await billService.revertPayment(bill.id, paymentId);
      } else {
        // Demo mode revert
        setPayments(payments.filter((p) => p.id !== paymentId));
      }
      setPayments(payments.filter((p) => p.id !== paymentId));
      onPaymentReverted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to revert payment');
    } finally {
      setRevertingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Payment Ledger</h3>
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

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading payment records...</div>
          ) : payments.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs text-slate-400">No payment history recorded yet for this bill.</div>
            </div>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">
                      ${p.amount.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Paid
                    </span>
                    {p.transactionId && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" /> Ledger Linked
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(p.paymentDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="capitalize flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-500" />
                      {p.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>

                  {p.referenceNumber && (
                    <div className="text-[10px] font-mono text-slate-500">Ref: {p.referenceNumber}</div>
                  )}

                  {p.notes && <div className="text-[11px] text-slate-300 italic">"{p.notes}"</div>}
                </div>

                <button
                  onClick={() => handleRevert(p.id)}
                  disabled={revertingId === p.id}
                  title="Revert payment"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Reverting payments recalculates due dates while preserving transactions.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
