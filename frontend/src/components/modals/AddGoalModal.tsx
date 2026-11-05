import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { SavingsGoal } from '../../types/finance';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: SavingsGoal) => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onAddGoal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('Dec 2027');
  const [category, setCategory] = useState('Personal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);
    const parsedCurrent = parseFloat(currentAmount || '0');

    if (!name.trim() || isNaN(parsedTarget) || parsedTarget <= 0) return;

    const targetAmountInCents = Math.round(parsedTarget * 100);
    const currentAmountInCents = Math.round((isNaN(parsedCurrent) ? 0 : parsedCurrent) * 100);
    const remainingAmountInCents = Math.max(0, targetAmountInCents - currentAmountInCents);
    const progressPercentage =
      targetAmountInCents > 0
        ? Math.min(100, Math.round((currentAmountInCents / targetAmountInCents) * 100))
        : 0;

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      name: name.trim(),
      description: '',
      targetAmount: parsedTarget,
      targetAmountInCents,
      currentAmount: isNaN(parsedCurrent) ? 0 : parsedCurrent,
      currentAmountInCents,
      remainingAmount: remainingAmountInCents / 100,
      remainingAmountInCents,
      progressPercentage,
      currency: 'USD',
      startDate: new Date().toISOString().split('T')[0],
      deadline,
      category: category as any,
      status: 'in_progress',
      priority: 'medium',
      color: '#8b5cf6',
      iconName: 'Target',
      milestones: [],
      healthStatus: 'on_track',
      daysRemaining: 30,
      totalDays: 30,
      daysElapsed: 0,
      requiredMonthlySavings: remainingAmountInCents / 100,
      requiredDailySavings: Math.round((remainingAmountInCents / 3000) * 100) / 100,
      averageMonthlyContribution: 0,
      isDemoRecord: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddGoal(newGoal);
    onClose();
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-base text-white">Create Savings Target</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Goal Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Next-Gen Tech Setup"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount ($)</label>
              <input
                type="number"
                step="1"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="5000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Initial Saved ($)</label>
              <input
                type="number"
                step="1"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="500"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Date</label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Dec 2027"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Personal">Personal</option>
                <option value="Safety Net">Safety Net</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Travel">Travel</option>
                <option value="Automotive">Automotive</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow-violet transition cursor-pointer"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

