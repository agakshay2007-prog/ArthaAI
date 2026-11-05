import React, { useState } from 'react';
import { PiggyBank, CheckCircle2, Plus, Minus } from 'lucide-react';
import { DEMO_BUDGET_CATEGORIES } from '../../data/mockFinanceData';
import { BudgetCategory } from '../../types/finance';

export const BudgetingView: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetCategory[]>(DEMO_BUDGET_CATEGORIES);

  const handleAdjustBudget = (id: string, delta: number) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const newAllocated = Math.max(100, b.allocatedAmount + delta);
          return { ...b, allocatedAmount: newAllocated };
        }
        return b;
      })
    );
  };

  const totalAllocated = budgets.reduce((acc, c) => acc + c.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, c) => acc + c.spentAmount, 0);
  const remaining = totalAllocated - totalSpent;
  const overallPercentage = Math.round((totalSpent / totalAllocated) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Monthly Budget Discipline</h2>
            <p className="text-xs text-slate-400">Allocated spending limits & velocity tracking</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>{overallPercentage}% Overall Utilization ({remaining >= 0 ? 'Under Budget' : 'Over Budget'})</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Allocated Budget</div>
          <div className="text-2xl font-bold text-white font-mono">${totalAllocated.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Sum of active category caps</div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Current Spend</div>
          <div className="text-2xl font-bold text-brand-400 font-mono">${totalSpent.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">{overallPercentage}% of monthly limit consumed</div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-400 mb-1">Remaining Safety Buffer</div>
          <div className={`text-2xl font-bold font-mono ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {remaining >= 0 ? `+$${remaining.toLocaleString()}` : `-$${Math.abs(remaining).toLocaleString()}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available for savings / overflow</div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-white">Category Allocations</h3>
          <span className="text-[11px] text-slate-400">Adjust caps with (+ / -) controls</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((cat) => {
            const pct = Math.round((cat.spentAmount / cat.allocatedAmount) * 100);
            const isNearCap = pct >= 90;
            const isOver = pct > 100;

            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-xs">{cat.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      ${cat.spentAmount.toLocaleString()}{' '}
                      <span className="text-slate-500 font-normal">/ ${cat.allocatedAmount.toLocaleString()}</span>
                    </span>
                    {/* Quick Adjust Buttons */}
                    <div className="flex items-center space-x-1 pl-1">
                      <button
                        onClick={() => handleAdjustBudget(cat.id, -50)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Reduce cap by $50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAdjustBudget(cat.id, 50)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Increase cap by $50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-500 shadow-glow-rose'
                        : isNearCap
                        ? 'bg-amber-500'
                        : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span className={isNearCap ? 'text-amber-400 font-semibold' : ''}>
                    {pct}% utilized
                  </span>
                  <span>${(cat.allocatedAmount - cat.spentAmount).toLocaleString()} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
