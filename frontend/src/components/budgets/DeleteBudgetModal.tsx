import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Budget } from '../../types/budget';

interface DeleteBudgetModalProps {
  isOpen: boolean;
  budget: Budget | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<boolean> | void;
}

export const DeleteBudgetModal: React.FC<DeleteBudgetModalProps> = ({
  isOpen,
  budget,
  onClose,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !budget) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const result = await onConfirmDelete(budget.id);
      if (result === false) {
        setIsDeleting(false);
        return;
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-rose-400">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-bold text-base text-white">Delete Budget</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete the budget{' '}
            <strong className="text-white">"{budget.name}"</strong>?
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Category:</span>
              <span className="text-white font-medium">{budget.category}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Limit:</span>
              <span className="text-white font-mono">${budget.limit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Spend:</span>
              <span className="text-brand-300 font-mono">${budget.actualSpent.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Associated financial transactions will <strong>not</strong> be
              deleted. Only the spending cap target and threshold alerts will be removed.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-5 mt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
