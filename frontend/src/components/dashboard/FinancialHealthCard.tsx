import React from 'react';
import { ShieldCheck, Sparkles, Lightbulb, ArrowUpRight } from 'lucide-react';
import { DEMO_HEALTH_METRICS } from '../../data/mockFinanceData';

export const FinancialHealthCard: React.FC = () => {
  const { score, rating, savingsRatePercentage, runwayMonths, debtToIncomeRatio, actionableInsights } =
    DEMO_HEALTH_METRICS;

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white">Financial Health Score</h3>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {rating}
          </span>
        </div>

        {/* Score Ring Display */}
        <div className="flex items-center space-x-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5">
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                className="text-brand-500"
                fill="transparent"
                strokeDasharray={201}
                strokeDashoffset={201 - (201 * score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-extrabold text-white font-mono">{score}</span>
              <span className="text-[10px] text-slate-400 block -mt-1">/100</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Savings Rate:</span>
              <span className="font-mono font-bold text-emerald-400">{savingsRatePercentage}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Liquid Runway:</span>
              <span className="font-mono font-bold text-white">{runwayMonths} mos</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Debt-to-Income:</span>
              <span className="font-mono font-bold text-slate-300">{debtToIncomeRatio}% (Low)</span>
            </div>
          </div>
        </div>

        {/* Actionable Insights */}
        <div>
          <div className="flex items-center space-x-1.5 mb-2.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Autonomous Recommendations</span>
          </div>

          <div className="space-y-2">
            {actionableInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {insight.title}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                    {insight.impact} impact
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-brand-400 font-semibold cursor-pointer hover:text-brand-300">
        <span>View full diagnostic telemetry</span>
        <ArrowUpRight className="w-4 h-4" />
      </div>
    </div>
  );
};

