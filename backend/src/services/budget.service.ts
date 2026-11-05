import mongoose from 'mongoose';
import { IBudgetDocument, Budget } from '../models/budget.model.js';
import { Transaction, ITransactionDocument, centsToAmount } from '../models/transaction.model.js';
import {
  BudgetEnrichedResponse,
  BudgetStatus,
  BudgetAlertItem,
  BudgetOverviewData,
  BudgetAnalyticsData,
  TransactionResponse,
} from '../types/index.js';

export class BudgetService {
  /**
   * Determine the alert status level based on utilization percentage
   */
  static getStatusLevel(utilizationPct: number): BudgetStatus {
    if (utilizationPct >= 100) return 'exceeded';
    if (utilizationPct >= 90) return 'critical';
    if (utilizationPct >= 75) return 'warning';
    if (utilizationPct >= 50) return 'moderate';
    return 'normal';
  }

  /**
   * Generate contextual alerts based on breached thresholds
   */
  static generateAlerts(
    budgetId: string,
    budgetName: string,
    category: string,
    limitInCents: number,
    spentInCents: number,
    thresholds: number[]
  ): BudgetAlertItem[] {
    if (limitInCents <= 0) return [];

    const utilizationPct = Math.round((spentInCents / limitInCents) * 100);
    const limit = centsToAmount(limitInCents);
    const actualSpent = centsToAmount(spentInCents);
    const remaining = centsToAmount(limitInCents - spentInCents);

    const alerts: BudgetAlertItem[] = [];
    const sortedThresholds = [...(thresholds || [50, 75, 90, 100])].sort((a, b) => b - a);

    // Find the highest threshold breached to prevent alert spam
    for (const t of sortedThresholds) {
      if (utilizationPct >= t) {
        const level = this.getStatusLevel(utilizationPct);
        const isExceeded = utilizationPct >= 100;

        const message = isExceeded
          ? `Budget for "${category}" has exceeded its limit by $${Math.abs(remaining).toFixed(2)} (${utilizationPct}% utilized).`
          : `Budget for "${category}" has reached ${utilizationPct}% ($${remaining.toFixed(2)} remaining).`;

        alerts.push({
          budgetId,
          budgetName,
          category,
          threshold: t,
          level,
          message,
          utilizationPercentage: utilizationPct,
          limit,
          actualSpent,
          remaining,
          timestamp: new Date().toISOString(),
        });
        break; // Only include the most urgent breached threshold
      }
    }

    return alerts;
  }

  /**
   * Enrich a budget document with real-time transaction spending calculations
   */
  static async enrichBudget(
    budgetDoc: IBudgetDocument,
    userTransactions?: ITransactionDocument[]
  ): Promise<BudgetEnrichedResponse> {
    const budgetJson = budgetDoc.toJSON();
    const userId = budgetDoc.userId;

    let matchingExpenses: ITransactionDocument[];

    if (userTransactions) {
      // Filter in-memory if a batch of transactions was pre-fetched
      matchingExpenses = userTransactions.filter((tx) => {
        const matchesCategory =
          tx.category && tx.category.trim().toLowerCase() === budgetDoc.category.trim().toLowerCase();
        const matchesType = tx.type === 'expense';
        const isCompleted = tx.status === 'completed';
        const txDate = new Date(tx.transactionDate);
        const inDateRange = txDate >= budgetDoc.startDate && txDate <= budgetDoc.endDate;

        return matchesCategory && matchesType && isCompleted && inDateRange;
      });
    } else {
      // Query MongoDB directly using integer minor units
      matchingExpenses = await Transaction.find({
        userId,
        type: 'expense',
        status: 'completed',
        category: { $regex: new RegExp(`^${budgetDoc.category.trim()}$`, 'i') },
        transactionDate: {
          $gte: budgetDoc.startDate,
          $lte: budgetDoc.endDate,
        },
      });
    }

    // Precise integer calculation of actual spending
    let actualSpentInCents = 0;
    for (const tx of matchingExpenses) {
      actualSpentInCents += tx.amountInCents;
    }

    const remainingInCents = budgetDoc.limitInCents - actualSpentInCents;
    const utilizationPercentage =
      budgetDoc.limitInCents > 0
        ? Math.round((actualSpentInCents / budgetDoc.limitInCents) * 1000) / 10
        : 0;

    const status = this.getStatusLevel(utilizationPercentage);
    const alerts = this.generateAlerts(
      budgetJson.id as string,
      budgetDoc.name,
      budgetDoc.category,
      budgetDoc.limitInCents,
      actualSpentInCents,
      budgetDoc.alertThresholds
    );

    return {
      ...(budgetJson as any),
      actualSpentInCents,
      actualSpent: centsToAmount(actualSpentInCents),
      remainingInCents,
      remaining: centsToAmount(remainingInCents),
      utilizationPercentage,
      status,
      transactionCount: matchingExpenses.length,
      alerts,
    };
  }

  /**
   * Compute comprehensive budget overview across all active budgets for a user
   */
  static async computeOverview(
    userId: string,
    period?: 'monthly' | 'yearly'
  ): Promise<BudgetOverviewData> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const filter: Record<string, unknown> = {
      userId: userObjectId,
      isActive: true,
    };
    if (period) {
      filter.period = period;
    }

    const activeBudgets = await Budget.find(filter).sort({ startDate: 1 });

    if (activeBudgets.length === 0) {
      return {
        period: period || 'all',
        totalLimitInCents: 0,
        totalLimit: 0,
        totalSpentInCents: 0,
        totalSpent: 0,
        totalRemainingInCents: 0,
        totalRemaining: 0,
        overallUtilizationPercentage: 0,
        activeBudgetCount: 0,
        exceededBudgetCount: 0,
        approachingLimitCount: 0,
        normalBudgetCount: 0,
        categorySpending: [],
        recentAlerts: [],
      };
    }

    // Determine the broadest date range encompassing all active budgets to pre-fetch transactions
    let minDate = activeBudgets[0].startDate;
    let maxDate = activeBudgets[0].endDate;
    for (const b of activeBudgets) {
      if (b.startDate < minDate) minDate = b.startDate;
      if (b.endDate > maxDate) maxDate = b.endDate;
    }

    const allExpenses = await Transaction.find({
      userId: userObjectId,
      type: 'expense',
      status: 'completed',
      transactionDate: { $gte: minDate, $lte: maxDate },
    });

    const enrichedBudgets = await Promise.all(
      activeBudgets.map((b) => this.enrichBudget(b, allExpenses))
    );

    let totalLimitInCents = 0;
    let totalSpentInCents = 0;
    let exceededCount = 0;
    let approachingCount = 0;
    let normalCount = 0;
    const allAlerts: BudgetAlertItem[] = [];

    const categorySpending = enrichedBudgets.map((eb) => {
      totalLimitInCents += eb.limitInCents;
      totalSpentInCents += eb.actualSpentInCents;

      if (eb.utilizationPercentage >= 100) {
        exceededCount++;
      } else if (eb.utilizationPercentage >= 75) {
        approachingCount++;
      } else {
        normalCount++;
      }

      if (eb.alerts && eb.alerts.length > 0) {
        allAlerts.push(...eb.alerts);
      }

      return {
        category: eb.category,
        limitInCents: eb.limitInCents,
        limit: eb.limit,
        spentInCents: eb.actualSpentInCents,
        spent: eb.actualSpent,
        remainingInCents: eb.remainingInCents,
        remaining: eb.remaining,
        utilizationPercentage: eb.utilizationPercentage,
        status: eb.status,
      };
    });

    const totalRemainingInCents = totalLimitInCents - totalSpentInCents;
    const overallUtilizationPercentage =
      totalLimitInCents > 0
        ? Math.round((totalSpentInCents / totalLimitInCents) * 1000) / 10
        : 0;

    return {
      period: period || 'current',
      totalLimitInCents,
      totalLimit: centsToAmount(totalLimitInCents),
      totalSpentInCents,
      totalSpent: centsToAmount(totalSpentInCents),
      totalRemainingInCents,
      totalRemaining: centsToAmount(totalRemainingInCents),
      overallUtilizationPercentage,
      activeBudgetCount: activeBudgets.length,
      exceededBudgetCount: exceededCount,
      approachingLimitCount: approachingCount,
      normalBudgetCount: normalCount,
      categorySpending,
      recentAlerts: allAlerts.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage),
    };
  }

  /**
   * Compute analytics, velocity and daily spending trends for a specific budget
   */
  static async computeAnalytics(budgetDoc: IBudgetDocument): Promise<BudgetAnalyticsData> {
    const matchingExpenses = await Transaction.find({
      userId: budgetDoc.userId,
      type: 'expense',
      status: 'completed',
      category: { $regex: new RegExp(`^${budgetDoc.category.trim()}$`, 'i') },
      transactionDate: {
        $gte: budgetDoc.startDate,
        $lte: budgetDoc.endDate,
      },
    }).sort({ transactionDate: 1 });

    const enriched = await this.enrichBudget(budgetDoc, matchingExpenses);

    // Group expenses by day
    const dailyMap = new Map<string, number>();
    for (const tx of matchingExpenses) {
      const dateKey = new Date(tx.transactionDate).toISOString().slice(0, 10);
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + tx.amountInCents);
    }

    // Build chronological daily trend
    let cumulative = 0;
    const dailySpendTrend = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, spentInCents]) => {
        cumulative += spentInCents;
        return {
          date,
          spentInCents,
          spent: centsToAmount(spentInCents),
          cumulativeSpentInCents: cumulative,
          cumulativeSpent: centsToAmount(cumulative),
        };
      });

    // Velocity calculations
    const now = new Date();
    const startMs = budgetDoc.startDate.getTime();
    const endMs = budgetDoc.endDate.getTime();
    const nowMs = Math.min(now.getTime(), endMs);

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const totalDays = Math.max(1, Math.round((endMs - startMs) / MS_PER_DAY));
    const daysElapsed = Math.max(1, Math.round((nowMs - startMs) / MS_PER_DAY));
    const daysRemaining = Math.max(0, Math.round((endMs - nowMs) / MS_PER_DAY));

    const averageDailySpend = enriched.actualSpent / daysElapsed;
    const projectedTotalSpend = enriched.actualSpent + averageDailySpend * daysRemaining;
    const projectedUtilizationPercentage =
      enriched.limit > 0 ? Math.round((projectedTotalSpend / enriched.limit) * 1000) / 10 : 0;
    const isProjectedToExceed = projectedTotalSpend > enriched.limit;

    return {
      budget: enriched,
      dailySpendTrend,
      velocity: {
        averageDailySpend: Math.round(averageDailySpend * 100) / 100,
        projectedTotalSpend: Math.round(projectedTotalSpend * 100) / 100,
        projectedUtilizationPercentage,
        isProjectedToExceed,
        daysRemaining,
        daysElapsed,
        totalDays,
      },
      recentTransactions: matchingExpenses
        .slice(-10)
        .reverse()
        .map((tx) => tx.toJSON() as unknown as TransactionResponse),
    };
  }
}
