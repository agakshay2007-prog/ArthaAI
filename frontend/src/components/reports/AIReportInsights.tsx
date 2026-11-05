import React, { useState } from 'react';
import { Sparkles, Bot, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { reportService } from '../../services/reports';
import { ReportPeriodType } from '../../types/reports';

interface AIReportInsightsProps {
  initialInsights?: string;
  periodType: ReportPeriodType;
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  quarter?: number;
  isGuestDemo?: boolean;
}

export const AIReportInsights: React.FC<AIReportInsightsProps> = ({
  initialInsights,
  periodType,
  startDate,
  endDate,
  year,
  month,
  quarter,
  isGuestDemo,
}) => {
  const [insights, setInsights] = useState<string | null>(initialInsights || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    if (isGuestDemo) {
      setTimeout(() => {
        setInsights(
          `### 🤖 ArthaAI Executive Financial Synthesis\n\n` +
          `**1. Cash Flow & Surplus Analysis:**\n` +
          `Strong net surplus generated across the period with a solid 30%+ savings rate. Operational inflows comfortably surpass routine operational obligations.\n\n` +
          `**2. Category Variance & Outlier Spend:**\n` +
          `Discretionary spending is dominated by Dining and Technology infrastructure. Category variance remains within 8% of target projections.\n\n` +
          `**3. Budgetary Adherence:**\n` +
          `Core operating budgets are currently healthy. Dining is trending at 85% utilization; recommend throttling discretionary spend for the remainder of the cycle.\n\n` +
          `**4. Strategic Recommendations:**\n` +
          `• Allocate $450 of current net surplus directly toward the Emergency Reserve.\n` +
          `• Consolidate annual cloud software bills to unlock 15% upfront discount tiers.`
        );
        setIsLoading(false);
      }, 700);
      return;
    }

    try {
      const res = await reportService.getAIInsights({
        type: periodType,
        startDate,
        endDate,
        year,
        month,
        quarter,
      });
      setInsights(res.insights);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to generate AI report insights.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-violet-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-violet-950/20 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-inner">
            <Bot className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ArthaAI Gemini Financial Evaluation
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-violet-300" />
                AI Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Automated audit, risk detection, and portfolio recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium shadow-md shadow-violet-600/20 transition disabled:opacity-50"
            title="Generate AI insights for this period"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{insights ? 'Refresh Insights' : 'Analyze Report'}</span>
          </button>

          {insights && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle AI analysis view"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-3 text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
          <p className="font-mono">Synthesizing multi-metric financial insights...</p>
        </div>
      ) : insights && isExpanded ? (
        <div className="mt-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-3 font-sans">
          {insights.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('###') || paragraph.startsWith('##')) {
              return (
                <h4 key={index} className="text-sm font-bold text-violet-300 pt-1">
                  {paragraph.replace(/^#+\s*/, '')}
                </h4>
              );
            }
            if (paragraph.startsWith('**') || paragraph.startsWith('•') || paragraph.startsWith('-')) {
              return (
                <div key={index} className="space-y-1">
                  {paragraph.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className="text-slate-300">
                      {line}
                    </p>
                  ))}
                </div>
              );
            }
            return (
              <p key={index} className="text-slate-300">
                {paragraph}
              </p>
            );
          })}
        </div>
      ) : !insights ? (
        <div className="py-6 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
          <Sparkles className="w-8 h-8 text-violet-500/30 mb-2" />
          <p className="max-w-md">
            Click &ldquo;Analyze Report&rdquo; to prompt the ArthaAI Gemini engine for automated
            variance commentary, savings anomalies, and personalized budget adjustments.
          </p>
        </div>
      ) : null}
    </div>
  );
};

