import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Transaction } from '../../types/finance';

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirmDelete: (id: string) => Promise<boolean>;
}

export const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await onConfirmDelete(transaction.id);
    setIsDeleting(false);
    if (success) {
      onClose();
    }
  };

  const isIncome = transaction.type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-base text-white">Delete Transaction</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Are you sure you want to delete this record? This action will permanently remove it from your financial ledger.
          </p>

          <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-5 text-left text-xs">
            <div className="font-semibold text-white truncate">{transaction.title}</div>
            <div className="flex items-center justify-between text-slate-400 mt-1">
              <span>{transaction.category}</span>
              <span className={`font-mono font-bold ${isIncome ? 'text-emerald-400' : 'text-slate-100'}`}>
                {isIncome ? `+$${transaction.amount.toFixed(2)}` : `-$${transaction.amount.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition shadow cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
