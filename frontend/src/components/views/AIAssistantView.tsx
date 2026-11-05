import React from 'react';
import { AIAssistantCard } from '../dashboard/AIAssistantCard';
import { Sparkles, Bot, Shield } from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
          <Sparkles className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">ArthaAI Intelligent Wealth Copilot</h2>
          <p className="text-xs text-slate-400">
            Autonomous wealth strategist with predictive budget and runway modeling
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIAssistantCard />
        </div>

        {/* Advisory Context Sidebar */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-400" />
              <span>Model Capabilities</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                <span>Deterministic personal finance analysis without hallucination risk.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                <span>Immediate cash-flow runway projections under variable income stress.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                <span>Automated detection of recurring subscription creep.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Safety & Transparency</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              ArthaAI operates on strictly localized simulation models for this phase. Future updates will incorporate
              fine-tuned privacy-preserving agentic APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
