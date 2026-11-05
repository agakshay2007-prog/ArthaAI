import React, { useState } from 'react';
import { AlertTriangle, X, Archive, Trash2, ShieldCheck } from 'lucide-react';
import { Bill } from '../../types/bill';

interface DeleteBillModalProps {
  isOpen: boolean;
  bill: Bill | null;
  onClose: () => void;
  onDeleteBill: (id: string, archive: boolean) => Promise<void>;
}

export const DeleteBillModal: React.FC<DeleteBillModalProps> = ({
  isOpen,
  bill,
  onClose,
  onDeleteBill,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !bill) return null;

  const handleAction = async (archive: boolean) => {
    setIsDeleting(true);
    setError(null);
    try {
      await onDeleteBill(bill.id, archive);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-rose-400 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Archive or Delete Bill</h3>
            <p className="text-xs text-slate-400">Manage obligation lifecycle safely</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to remove <strong className="text-white">"{bill.name}"</strong>?
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Strict Financial Integrity Guaranteed</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Archiving or deleting this bill <strong className="text-slate-200">never deletes or alters</strong> your financial bank transactions. All past payment histories remain safely preserved in the ledger.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => handleAction(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5 text-brand-400" />
            <span>Archive Bill (Recommended)</span>
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() => handleAction(false)}
            className="py-2 px-3 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
