import mongoose from 'mongoose';
import {
  SavingsGoal,
  ISavingsGoalDocument,
  centsToAmount,
  amountToCents,
} from '../models/savings-goal.model.js';
import {
  GoalContribution,
  IGoalContributionDocument,
} from '../models/goal-contribution.model.js';
import { Transaction } from '../models/transaction.model.js';
import {
  SavingsGoalEnrichedResponse,
  GoalContributionResponse,
  SavingsOverviewData,
  SavingsRecommendation,
  GoalAnalyticsData,
  GoalHealthStatus,
  GoalMilestoneItem,
} from '../types/index.js';
import { AppError } from '../utils/apiError.js';

export class SavingsService {
  /**
   * Enriches a SavingsGoal document with calculated progress, velocity, health status, and timeline
   */
  public static enrichGoal(
    goal: ISavingsGoalDocument,
    contributions: IGoalContributionDocument[] = []
  ): SavingsGoalEnrichedResponse {
    const now = new Date();
    const startDate = new Date(goal.startDate || goal.createdAt);
    const deadline = new Date(goal.deadline);

    const totalDays = Math.max(1, Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    const daysElapsed = Math.max(0, Math.ceil((Math.min(now.getTime(), deadline.getTime()) - startDate.getTime()) / (1000 * 3600 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24)));
    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30.4));

    const targetAmount = centsToAmount(goal.targetAmountInCents);
    const currentAmount = centsToAmount(goal.currentAmountInCents);
    const remainingAmount = Math.max(0, targetAmount - currentAmount);
    const remainingAmountInCents = Math.max(0, goal.targetAmountInCents - goal.currentAmountInCents);
    const progressPercentage =
      goal.targetAmountInCents > 0
        ? Math.min(100, Math.round((goal.currentAmountInCents / goal.targetAmountInCents) * 1000) / 10)
        : 0;

    const requiredMonthlySavings =
      monthsRemaining > 0 ? Math.round((remainingAmount / monthsRemaining) * 100) / 100 : remainingAmount;
    const requiredDailySavings =
      daysRemaining > 0 ? Math.round((remainingAmount / daysRemaining) * 100) / 100 : remainingAmount;

    // Health status calculation
    let healthStatus: GoalHealthStatus = 'on_track';
    if (goal.status === 'completed' || goal.currentAmountInCents >= goal.targetAmountInCents) {
      healthStatus = 'completed';
    } else {
      const expectedLinearProgress = Math.min(100, (daysElapsed / totalDays) * 100);
      if (progressPercentage >= expectedLinearProgress + 5) {
        healthStatus = 'ahead';
      } else if (progressPercentage >= expectedLinearProgress - 10) {
        healthStatus = 'on_track';
      } else if (daysRemaining <= 45 && progressPercentage < 70) {
        healthStatus = 'at_risk';
      } else {
        healthStatus = 'behind';
      }
    }

    // Historical contribution calculations
    let averageMonthlyContribution = 0;
    let projectedCompletionDate: string | undefined = undefined;

    if (contributions.length > 0) {
      const totalContributed = contributions.reduce((acc, c) => {
        return c.type === 'withdrawal' ? acc - c.amountInCents : acc + c.amountInCents;
      }, 0);

      const monthsActive = Math.max(1, daysElapsed / 30.4);
      averageMonthlyContribution = Math.round((centsToAmount(totalContributed) / monthsActive) * 100) / 100;

      if (averageMonthlyContribution > 0 && remainingAmount > 0) {
        const monthsNeeded = remainingAmount / averageMonthlyContribution;
        const projectedTime = new Date(now.getTime() + monthsNeeded * 30.4 * 24 * 3600 * 1000);
        projectedCompletionDate = projectedTime.toISOString();
      }
    }

    const formattedMilestones: GoalMilestoneItem[] = (goal.milestones || []).map((m) => ({
      percentage: m.percentage,
      achievedAt: new Date(m.achievedAt).toISOString(),
    }));

    const recentContributions: GoalContributionResponse[] = contributions.slice(0, 5).map((c) => ({
      id: c._id.toString(),
      userId: c.userId.toString(),
      goalId: c.goalId.toString(),
      amountInCents: c.amountInCents,
      amount: centsToAmount(c.amountInCents),
      type: c.type,
      contributionDate: new Date(c.contributionDate).toISOString(),
      notes: c.notes,
      transactionId: c.transactionId ? c.transactionId.toString() : undefined,
      createdAt: new Date(c.createdAt).toISOString(),
      updatedAt: new Date(c.updatedAt).toISOString(),
    }));

    return {
      id: goal._id.toString(),
      userId: goal.userId.toString(),
      name: goal.name,
      description: goal.description,
      category: goal.category,
      targetAmountInCents: goal.targetAmountInCents,
      targetAmount,
      currentAmountInCents: goal.currentAmountInCents,
      currentAmount,
      remainingAmountInCents,
      remainingAmount,
      progressPercentage,
      currency: goal.currency || 'USD',
      startDate: startDate.toISOString(),
      deadline: deadline.toISOString(),
      status: goal.status,
      priority: goal.priority,
      color: goal.color || '#8b5cf6',
      iconName: goal.iconName || 'Target',
      completedAt: goal.completedAt ? new Date(goal.completedAt).toISOString() : undefined,
      milestones: formattedMilestones,
      healthStatus,
      daysRemaining,
      totalDays,
      daysElapsed,
      requiredMonthlySavings,
      requiredDailySavings,
      averageMonthlyContribution,
      projectedCompletionDate,
      contributionCount: contributions.length,
      recentContributions,
      createdAt: new Date(goal.createdAt).toISOString(),
      updatedAt: new Date(goal.updatedAt).toISOString(),
    };
  }

  /**
   * Computes portfolio-level savings metrics, net savings pace, and intelligent recommendations
   */
  public static async computeOverview(userId: string): Promise<SavingsOverviewData> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch user goals
    const goals = await SavingsGoal.find({ userId: userObjectId }).sort({ deadline: 1 });

    let totalTargetAmountInCents = 0;
    let totalSavedAmountInCents = 0;
    let activeGoalsCount = 0;
    let completedGoalsCount = 0;
    let totalMonthlyRequiredSavings = 0;

    const enrichedGoals: SavingsGoalEnrichedResponse[] = [];

    for (const goal of goals) {
      totalTargetAmountInCents += goal.targetAmountInCents;
      totalSavedAmountInCents += goal.currentAmountInCents;

      if (goal.status === 'completed' || goal.currentAmountInCents >= goal.targetAmountInCents) {
        completedGoalsCount++;
      } else if (goal.status === 'in_progress') {
        activeGoalsCount++;
      }

      const recentContributions = await GoalContribution.find({ goalId: goal._id })
        .sort({ contributionDate: -1 })
        .limit(5);

      const enriched = this.enrichGoal(goal, recentContributions);
      enrichedGoals.push(enriched);

      if (goal.status === 'in_progress') {
        totalMonthlyRequiredSavings += enriched.requiredMonthlySavings;
      }
    }

    totalMonthlyRequiredSavings = Math.round(totalMonthlyRequiredSavings * 100) / 100;
    const totalRemainingAmountInCents = Math.max(0, totalTargetAmountInCents - totalSavedAmountInCents);
    const overallProgressPercentage =
      totalTargetAmountInCents > 0
        ? Math.min(100, Math.round((totalSavedAmountInCents / totalTargetAmountInCents) * 1000) / 10)
        : 0;

    // Calculate actual monthly savings capacity from Phase 4 transactions (last 60 days)
    let monthlySavingsCapacity = 1200; // default baseline
    try {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 3600 * 1000);
      const userTxs = await Transaction.find({
        userId: userObjectId,
        status: 'completed',
        transactionDate: { $gte: sixtyDaysAgo },
      });

      if (userTxs.length > 0) {
        const incomeCents = userTxs
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amountInCents, 0);
        const expenseCents = userTxs
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amountInCents, 0);
        const netCents = Math.max(0, incomeCents - expenseCents);
        monthlySavingsCapacity = Math.round((centsToAmount(netCents) / 2) * 100) / 100; // 60 days = 2 months
      }
    } catch {
      // Keep baseline
    }

    const netSavingsPaceRatio =
      totalMonthlyRequiredSavings > 0
        ? Math.round((monthlySavingsCapacity / totalMonthlyRequiredSavings) * 100) / 100
        : 1;

    // Generate intelligent recommendations
    const recommendations: SavingsRecommendation[] = [];

    // 1. Feasibility Recommendation
    if (totalMonthlyRequiredSavings > 0) {
      if (monthlySavingsCapacity >= totalMonthlyRequiredSavings) {
        recommendations.push({
          id: 'rec-feasibility-positive',
          type: 'feasibility',
          title: 'Sustainable Funding Trajectory',
          description: `Your monthly cash flow capacity ($${monthlySavingsCapacity.toLocaleString()}/mo) safely covers your total required savings rate ($${totalMonthlyRequiredSavings.toLocaleString()}/mo).`,
          suggestedAction: 'Maintain current spending habits to reach all milestones on schedule.',
          priority: 'low',
        });
      } else {
        const deficit = Math.round((totalMonthlyRequiredSavings - monthlySavingsCapacity) * 100) / 100;
        recommendations.push({
          id: 'rec-feasibility-deficit',
          type: 'warning',
          title: 'Monthly Savings Shortfall Detected',
          description: `Active goals demand $${totalMonthlyRequiredSavings.toLocaleString()}/mo, which exceeds your current monthly net cash flow surplus by $${deficit.toLocaleString()}/mo.`,
          suggestedAction: 'Consider extending target deadlines by 2–4 months or trimming non-essential discretionary budgets.',
          impactAmount: deficit,
          priority: 'high',
        });
      }
    }

    // 2. Goal-Specific Recommendations
    for (const g of enrichedGoals) {
      if (g.status === 'in_progress') {
        // Milestone proximity (close to 100%)
        if (g.progressPercentage >= 85 && g.progressPercentage < 100) {
          recommendations.push({
            id: `rec-close-${g.id}`,
            goalId: g.id,
            goalName: g.name,
            type: 'milestone',
            title: `Milestone in Reach: "${g.name}"`,
            description: `You are only $${g.remainingAmount.toLocaleString()} away from 100% completion on your ${g.name} target.`,
            suggestedAction: 'Allocate next discretionary surplus to close out this milestone.',
            impactAmount: g.remainingAmount,
            priority: 'medium',
          });
        }

        // At-risk or timeline alerts
        if (g.healthStatus === 'at_risk' || (g.healthStatus === 'behind' && g.daysRemaining <= 60)) {
          recommendations.push({
            id: `rec-at-risk-${g.id}`,
            goalId: g.id,
            goalName: g.name,
            type: 'acceleration',
            title: `Deadline Acceleration Needed for "${g.name}"`,
            description: `Target deadline is in ${g.daysRemaining} days with ${g.progressPercentage}% funded. Requires $${g.requiredMonthlySavings}/mo to fulfill on time.`,
            suggestedAction: 'Increase monthly contribution frequency or reallocate funds from paused targets.',
            priority: 'high',
          });
        }
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec-general-wealth',
        type: 'optimization',
        title: 'Capital Reserves Optimized',
        description: 'All your designated savings targets are progressing within target parameters.',
        suggestedAction: 'Explore creating an additional investment or high-yield vehicle fund.',
        priority: 'low',
      });
    }

    return {
      totalTargetAmountInCents,
      totalTargetAmount: centsToAmount(totalTargetAmountInCents),
      totalSavedAmountInCents,
      totalSavedAmount: centsToAmount(totalSavedAmountInCents),
      totalRemainingAmountInCents,
      totalRemainingAmount: centsToAmount(totalRemainingAmountInCents),
      overallProgressPercentage,
      activeGoalsCount,
      completedGoalsCount,
      totalMonthlyRequiredSavings,
      monthlySavingsCapacity,
      netSavingsPaceRatio,
      recommendations,
      topGoals: enrichedGoals.slice(0, 4),
    };
  }

  /**
   * Computes in-depth analytics, velocity run-rate, and milestone progression for a single goal
   */
  public static async computeGoalAnalytics(
    userId: string,
    goalId: string
  ): Promise<GoalAnalyticsData> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const goalObjectId = new mongoose.Types.ObjectId(goalId);

    const goal = await SavingsGoal.findOne({ _id: goalObjectId, userId: userObjectId });
    if (!goal) {
      throw new AppError('Savings goal not found', 404);
    }

    const contributions = await GoalContribution.find({ goalId: goalObjectId, userId: userObjectId }).sort({
      contributionDate: 1,
    });

    const enriched = this.enrichGoal(goal, contributions);

    // Contribution Timeline
    const contributionTimeline: {
      date: string;
      amount: number;
      cumulativeSaved: number;
      targetProgress: number;
    }[] = [];

    let runningSaved = 0;
    for (const c of contributions) {
      const change = c.type === 'withdrawal' ? -c.amountInCents : c.amountInCents;
      runningSaved = Math.max(0, runningSaved + change);
      const runningAmount = centsToAmount(runningSaved);
      const progress = goal.targetAmountInCents > 0 ? Math.min(100, Math.round((runningSaved / goal.targetAmountInCents) * 100)) : 0;

      contributionTimeline.push({
        date: new Date(c.contributionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: centsToAmount(change),
        cumulativeSaved: runningAmount,
        targetProgress: progress,
      });
    }

    // If no contributions, add initial starting point
    if (contributionTimeline.length === 0) {
      contributionTimeline.push({
        date: new Date(goal.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: enriched.currentAmount,
        cumulativeSaved: enriched.currentAmount,
        targetProgress: enriched.progressPercentage,
      });
    }

    // Monthly Run-Rate grouping
    const monthlyGroups = new Map<string, number>();
    for (const c of contributions) {
      const monthKey = new Date(c.contributionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      const change = c.type === 'withdrawal' ? -centsToAmount(c.amountInCents) : centsToAmount(c.amountInCents);
      monthlyGroups.set(monthKey, (monthlyGroups.get(monthKey) || 0) + change);
    }

    const monthlyRunRate = Array.from(monthlyGroups.entries()).map(([month, contributed]) => ({
      month,
      contributed: Math.round(contributed * 100) / 100,
      targetMonthly: enriched.requiredMonthlySavings,
    }));

    // Velocity modeling
    const monthsRemaining = Math.max(1, Math.ceil(enriched.daysRemaining / 30.4));
    const monthlyAverage = enriched.averageMonthlyContribution;
    const projectedMonthsToFinish =
      monthlyAverage > 0 ? Math.round((enriched.remainingAmount / monthlyAverage) * 10) / 10 : 999;
    const isFeasibleByDeadline = projectedMonthsToFinish <= monthsRemaining;
    const deficitOrSurplusPace = Math.round((monthlyAverage - enriched.requiredMonthlySavings) * 100) / 100;

    // Milestones Status
    const milestonePercentages = [25, 50, 75, 100];
    const milestonesStatus = milestonePercentages.map((pct) => {
      const achieved = goal.milestones?.find((m) => m.percentage === pct);
      const isCurrentlyMet = enriched.progressPercentage >= pct;
      return {
        percentage: pct,
        isAchieved: Boolean(achieved || isCurrentlyMet),
        achievedAt: achieved?.achievedAt ? new Date(achieved.achievedAt).toISOString() : undefined,
      };
    });

    return {
      goal: enriched,
      contributionTimeline,
      monthlyRunRate,
      velocity: {
        dailyAverage: enriched.requiredDailySavings,
        monthlyAverage,
        monthsRemaining,
        projectedMonthsToFinish,
        isFeasibleByDeadline,
        deficitOrSurplusPace,
      },
      milestonesStatus,
    };
  }

  /**
   * Records a deposit or withdrawal contribution, updates current savings balance,
   * checks milestones, and completes goal when 100% is reached
   */
  public static async recordContribution(
    userId: string,
    goalId: string,
    input: {
      amount: number;
      type: 'deposit' | 'withdrawal';
      notes?: string;
      contributionDate?: Date;
      transactionId?: string;
    }
  ): Promise<{ contribution: GoalContributionResponse; goal: SavingsGoalEnrichedResponse }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const goalObjectId = new mongoose.Types.ObjectId(goalId);

    const goal = await SavingsGoal.findOne({ _id: goalObjectId, userId: userObjectId });
    if (!goal) {
      throw new AppError('Savings goal not found', 404);
    }

    if (!input.amount || input.amount <= 0) {
      throw new AppError('Contribution amount must be greater than zero', 400);
    }

    const amountInCents = amountToCents(input.amount);

    if (input.type === 'withdrawal' && goal.currentAmountInCents < amountInCents) {
      throw new AppError(
        `Insufficient funds in savings goal. Current balance is $${centsToAmount(goal.currentAmountInCents)}, requested withdrawal is $${input.amount}`,
        400
      );
    }

    // Create contribution document
    const contribution = await GoalContribution.create({
      userId: userObjectId,
      goalId: goalObjectId,
      amountInCents,
      type: input.type,
      notes: input.notes?.trim() || '',
      contributionDate: input.contributionDate || new Date(),
      transactionId: input.transactionId ? new mongoose.Types.ObjectId(input.transactionId) : undefined,
    });

    // Update goal balance
    if (input.type === 'deposit') {
      goal.currentAmountInCents += amountInCents;
    } else {
      goal.currentAmountInCents -= amountInCents;
    }

    const currentPercentage =
      goal.targetAmountInCents > 0
        ? Math.round((goal.currentAmountInCents / goal.targetAmountInCents) * 100)
        : 0;

    // Check & update milestones (25, 50, 75, 100)
    const milestoneSteps = [25, 50, 75, 100];
    const existingMilestones = goal.milestones || [];

    for (const step of milestoneSteps) {
      const hasStep = existingMilestones.some((m) => m.percentage === step);
      if (currentPercentage >= step && !hasStep) {
        existingMilestones.push({ percentage: step, achievedAt: new Date() });
      } else if (currentPercentage < step && hasStep) {
        // Withdrawal reduced progress below milestone
        const idx = existingMilestones.findIndex((m) => m.percentage === step);
        if (idx !== -1) existingMilestones.splice(idx, 1);
      }
    }
    goal.milestones = existingMilestones;

    // Check completion status
    if (goal.currentAmountInCents >= goal.targetAmountInCents) {
      goal.status = 'completed';
      if (!goal.completedAt) goal.completedAt = new Date();
    } else if (goal.status === 'completed' && goal.currentAmountInCents < goal.targetAmountInCents) {
      goal.status = 'in_progress';
      goal.completedAt = undefined;
    }

    await goal.save();

    const allContributions = await GoalContribution.find({ goalId: goalObjectId }).sort({
      contributionDate: -1,
    });
    const enriched = this.enrichGoal(goal, allContributions);

    return {
      contribution: {
        id: contribution._id.toString(),
        userId: contribution.userId.toString(),
        goalId: contribution.goalId.toString(),
        amountInCents: contribution.amountInCents,
        amount: centsToAmount(contribution.amountInCents),
        type: contribution.type,
        contributionDate: new Date(contribution.contributionDate).toISOString(),
        notes: contribution.notes,
        transactionId: contribution.transactionId ? contribution.transactionId.toString() : undefined,
        createdAt: new Date(contribution.createdAt).toISOString(),
        updatedAt: new Date(contribution.updatedAt).toISOString(),
      },
      goal: enriched,
    };
  }

  /**
   * Deletes a contribution, reverses its balance on the goal, and recalculates milestones
   */
  public static async deleteContribution(
    userId: string,
    goalId: string,
    contributionId: string
  ): Promise<SavingsGoalEnrichedResponse> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const goalObjectId = new mongoose.Types.ObjectId(goalId);
    const contributionObjectId = new mongoose.Types.ObjectId(contributionId);

    const goal = await SavingsGoal.findOne({ _id: goalObjectId, userId: userObjectId });
    if (!goal) {
      throw new AppError('Savings goal not found', 404);
    }

    const contribution = await GoalContribution.findOne({
      _id: contributionObjectId,
      goalId: goalObjectId,
      userId: userObjectId,
    });
    if (!contribution) {
      throw new AppError('Contribution record not found', 404);
    }

    // Revert balance
    if (contribution.type === 'deposit') {
      goal.currentAmountInCents = Math.max(0, goal.currentAmountInCents - contribution.amountInCents);
    } else {
      goal.currentAmountInCents += contribution.amountInCents;
    }

    // Recalculate milestones
    const currentPercentage =
      goal.targetAmountInCents > 0
        ? Math.round((goal.currentAmountInCents / goal.targetAmountInCents) * 100)
        : 0;

    const milestoneSteps = [25, 50, 75, 100];
    const existingMilestones = goal.milestones || [];

    for (const step of milestoneSteps) {
      const hasStep = existingMilestones.some((m) => m.percentage === step);
      if (currentPercentage >= step && !hasStep) {
        existingMilestones.push({ percentage: step, achievedAt: new Date() });
      } else if (currentPercentage < step && hasStep) {
        const idx = existingMilestones.findIndex((m) => m.percentage === step);
        if (idx !== -1) existingMilestones.splice(idx, 1);
      }
    }
    goal.milestones = existingMilestones;

    if (goal.currentAmountInCents < goal.targetAmountInCents && goal.status === 'completed') {
      goal.status = 'in_progress';
      goal.completedAt = undefined;
    }

    await goal.save();
    await GoalContribution.deleteOne({ _id: contributionObjectId });

    const allContributions = await GoalContribution.find({ goalId: goalObjectId }).sort({
      contributionDate: -1,
    });
    return this.enrichGoal(goal, allContributions);
  }

  /**
   * Deletes a savings goal and its contribution ledger.
   * STRICT SAFETY RULE: Does NOT mutate or delete any Phase 4 bank transactions!
   */
  public static async deleteGoal(userId: string, goalId: string): Promise<void> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const goalObjectId = new mongoose.Types.ObjectId(goalId);

    const goal = await SavingsGoal.findOne({ _id: goalObjectId, userId: userObjectId });
    if (!goal) {
      throw new AppError('Savings goal not found', 404);
    }

    // Delete contribution ledger records for this goal
    await GoalContribution.deleteMany({ goalId: goalObjectId, userId: userObjectId });

    // Delete the goal itself
    await SavingsGoal.deleteOne({ _id: goalObjectId, userId: userObjectId });
  }
}
