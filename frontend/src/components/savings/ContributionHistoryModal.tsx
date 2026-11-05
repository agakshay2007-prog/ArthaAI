import React, { useState, useEffect } from 'react';
import { X, History, Trash2, PlusCircle, MinusCircle, Calendar } from 'lucide-react';
import { SavingsGoal, GoalContribution } from '../../types/savings';
import { savingsService } from '../../services/savings';

interface ContributionHistoryModalProps {
  isOpen: boolean;
  goal: SavingsGoal | null;
  demoContributions?: GoalContribution[];
  onClose: () => void;
  onDeleteContribution: (goalId: string, contributionId: string) => Promise<boolean> | void;
}

export const ContributionHistoryModal: React.FC<ContributionHistoryModalProps> = ({
  isOpen,
  goal,
  demoContributions = [],
  onClose,
  onDeleteContribution,
}) => {
  const [contributions, setContributions] = useState<GoalContribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !goal) return;

    const loadContributions = async () => {
      setIsLoading(true);
      try {
        if (!goal.isDemoRecord && !goal.id.startsWith('goal-')) {
          const res = await savingsService.getGoalContributions(goal.id);
          setContributions(res.contributions);
          return;
        }
      } catch {
        // Fallback to demo
      }

      // Fallback
      setContributions(demoContributions);
      setIsLoading(false);
    };

    loadContributions();
  }, [isOpen, goal, demoContributions]);

  if (!isOpen || !goal) return null;

  const handleDelete = async (contributionId: string) => {
    setDeletingId(contributionId);
    try {
      await onDeleteContribution(goal.id, contributionId);
      setContributions((prev) => prev.filter((c) => c.id !== contributionId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center space-x-2 text-brand-400 mb-1">
              <History className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">Contribution Ledger</h3>
            </div>
            <p className="text-xs text-slate-400">
              {goal.name} &bull; Current Balance: <span className="font-mono text-emerald-400 font-bold">${goal.currentAmount.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Loading contribution records...</span>
            </div>
          ) : contributions.length > 0 ? (
            contributions.map((c) => {
              const isDeposit = c.type === 'deposit';
              return (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isDeposit
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isDeposit ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {c.notes || (isDeposit ? 'Capital Contribution' : 'Funds Withdrawal')}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(c.contributionDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`font-mono font-bold text-sm ${
                        isDeposit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isDeposit ? `+$${c.amount.toLocaleString()}` : `-$${c.amount.toLocaleString()}`}
                    </span>

                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      title="Revert Contribution"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No contributions recorded yet. Use &ldquo;Add Funds&rdquo; to begin funding this goal.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>{contributions.length} recorded operations</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
