import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { SavingsGoal, GoalAnalytics } from '../../types/savings';
import { savingsService } from '../../services/savings';

interface GoalAnalyticsModalProps {
  isOpen: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
}

export const GoalAnalyticsModal: React.FC<GoalAnalyticsModalProps> = ({
  isOpen,
  goal,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<GoalAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !goal) {
      setAnalytics(null);
      return;
    }

    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        if (!goal.isDemoRecord && !goal.id.startsWith('goal-')) {
          const res = await savingsService.getGoalAnalytics(goal.id);
          setAnalytics(res);
          return;
        }
      } catch {
        // Fallback to client-side compute
      }

      // Compute client-side analytics
      const now = new Date();
      const startDate = new Date(goal.startDate || '2026-01-01');
      const deadline = new Date(goal.deadline);

      const daysElapsed = Math.max(1, Math.ceil((Math.min(now.getTime(), deadline.getTime()) - startDate.getTime()) / (1000 * 3600 * 24)));
      const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24)));
      const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30.4));

      const dailyAverage = Math.round((goal.currentAmount / daysElapsed) * 100) / 100;
      const monthlyAverage = Math.round((dailyAverage * 30.4) * 100) / 100;
      const requiredMonthly = monthsRemaining > 0 ? Math.round((goal.remainingAmount / monthsRemaining) * 100) / 100 : 0;
      const projectedMonthsToFinish =
        monthlyAverage > 0 ? Math.round((goal.remainingAmount / monthlyAverage) * 10) / 10 : 999;
      const isFeasible = projectedMonthsToFinish <= monthsRemaining;

      // Simulated timeline points
      const timeline: { date: string; amount: number; cumulativeSaved: number; targetProgress: number }[] = [];
      const numPoints = 6;
      let accum = 0;
      for (let i = numPoints; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 25 * 24 * 3600 * 1000);
        const step = goal.currentAmount / (numPoints + 1);
        accum += step;
        const currentSaved = Math.round(Math.min(accum, goal.currentAmount));
        timeline.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: Math.round(step),
          cumulativeSaved: currentSaved,
          targetProgress: Math.min(100, Math.round((currentSaved / goal.targetAmount) * 100)),
        });
      }

      // Milestones
      const milestoneSteps = [25, 50, 75, 100];
      const milestonesStatus = milestoneSteps.map((pct) => {
        const achieved = goal.milestones?.find((m) => m.percentage === pct);
        const isMet = goal.progressPercentage >= pct;
        return {
          percentage: pct,
          isAchieved: Boolean(achieved || isMet),
          achievedAt: achieved?.achievedAt || (isMet ? 'Completed' : undefined),
        };
      });

      setAnalytics({
        goal,
        contributionTimeline: timeline,
        monthlyRunRate: [],
        velocity: {
          dailyAverage,
          monthlyAverage,
          monthsRemaining,
          projectedMonthsToFinish,
          isFeasibleByDeadline: isFeasible,
          deficitOrSurplusPace: Math.round((monthlyAverage - requiredMonthly) * 100) / 100,
        },
        milestonesStatus,
      });
      setIsLoading(false);
    };

    loadAnalytics();
  }, [isOpen, goal]);

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-navy-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                {goal.category}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300">
                Priority: {goal.priority.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{goal.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Deadline: {new Date(goal.deadline).toLocaleDateString()} &bull; {goal.daysRemaining} days remaining
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Computing velocity models...</span>
          </div>
        ) : (
          <div className="space-y-6 mt-5">
            {/* 1. Core Financial Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Target Amount</span>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  ${goal.targetAmount.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Current Saved</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  ${goal.currentAmount.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Remaining</span>
                <div className="text-lg font-bold font-mono text-slate-200 mt-1">
                  ${goal.remainingAmount.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400">Milestone Progress</span>
                <div className="text-lg font-bold font-mono text-brand-300 mt-1">
                  {goal.progressPercentage}%
                </div>
              </div>
            </div>

            {/* 2. Predictive Velocity & Run-Rate Feasibility */}
            {analytics?.velocity && (
              <div className="glass-card rounded-2xl p-5 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    <h4 className="text-sm font-bold text-white">Savings Velocity & Feasibility Analysis</h4>
                  </div>
                  {analytics.velocity.isFeasibleByDeadline ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>On-Pace for Target</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Acceleration Advised</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Monthly Run-Rate</span>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      ${analytics.velocity.monthlyAverage.toLocaleString()}/mo
                    </div>
                    <span className="text-[10px] text-slate-500">Historical accumulation average</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Required Monthly Pace</span>
                    <div className="text-base font-bold font-mono text-brand-300 mt-0.5">
                      ${goal.requiredMonthlySavings.toLocaleString()}/mo
                    </div>
                    <span className="text-[10px] text-slate-500">To fulfill by deadline</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Projected Completion</span>
                    <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                      {analytics.velocity.projectedMonthsToFinish < 900
                        ? `${analytics.velocity.projectedMonthsToFinish} months`
                        : 'Requires active deposits'}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {analytics.velocity.monthsRemaining} months until deadline
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Cumulative Savings Progression AreaChart */}
            {analytics?.contributionTimeline && analytics.contributionTimeline.length > 0 && (
              <div className="glass-card rounded-2xl p-5 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white">Capital Accumulation Trajectory</h4>
                  <span className="text-xs text-slate-400">Progress Towards Target</span>
                </div>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics.contributionTimeline}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={goal.color} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={goal.color} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Accumulated Savings']}
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulativeSaved"
                        stroke={goal.color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#savingsGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 4. Milestones Checkpoints (25, 50, 75, 100) */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center space-x-2 mb-3">
                <Award className="w-4 h-4 text-brand-400" />
                <h4 className="text-sm font-bold text-white">Milestone Checkpoints</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {analytics?.milestonesStatus.map((m) => (
                  <div
                    key={m.percentage}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center transition ${
                      m.isAchieved
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                        m.isAchieved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {m.isAchieved ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <span className="font-bold text-sm font-mono text-white">{m.percentage}%</span>
                    <span className="text-[10px] mt-0.5">
                      {m.isAchieved ? (m.achievedAt || 'Achieved') : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
