import {
  FinancialContextData,
  FinancialHealthScoreItem,
  FinancialInsightsResponse,
} from '../../types/index.js';

export class FinancialInsightsService {
  /**
   * Deterministic calculation of a transparent financial health score (0-100)
   */
  public static calculateHealthScore(context: FinancialContextData): FinancialHealthScoreItem {
    const summary = context.summary;

    // Component 1: Savings Rate Score (Max 30)
    let savingsRateScore = 15;
    let savingsNote = 'Savings rate data not yet established.';
    if (context.hasTransactions && summary.totalIncome > 0) {
      const rate = summary.savingsRatePercentage;
      if (rate >= 25) {
        savingsRateScore = 30;
        savingsNote = `Outstanding savings rate of ${rate}% exceeds recommended 20% benchmark.`;
      } else if (rate >= 15) {
        savingsRateScore = 24;
        savingsNote = `Healthy savings rate of ${rate}% approaches optimal financial velocity.`;
      } else if (rate > 0) {
        savingsRateScore = 16;
        savingsNote = `Positive savings rate of ${rate}%, with opportunity to optimize discretionary expenses.`;
      } else {
        savingsRateScore = 5;
        savingsNote = `Expenses equal or exceed income (${rate}% savings rate). Recommend spending freeze.`;
      }
    }

    // Component 2: Budget Adherence Score (Max 25)
    let budgetScore = 18;
    let budgetNote = 'No active budgets tracked yet.';
    if (context.hasBudgets && summary.totalBudgetLimit > 0) {
      const util = summary.overallBudgetUtilization;
      if (util <= 75) {
        budgetScore = 25;
        budgetNote = `Disciplined spending at ${util}% of overall budget ceiling.`;
      } else if (util <= 90) {
        budgetScore = 20;
        budgetNote = `Moderate spending at ${util}% of total budget; approaching warning limits.`;
      } else if (util <= 100) {
        budgetScore = 12;
        budgetNote = `Near-capacity spending at ${util}% of budget limits. Critical threshold.`;
      } else {
        budgetScore = 5;
        budgetNote = `Budget exceeded at ${util}% of allocation. Corrective action recommended.`;
      }
    }

    // Component 3: Bill Timeliness & Recurring Health (Max 25)
    let billScore = 25;
    let billNote = 'All upcoming bill obligations are up-to-date.';
    if (summary.overdueBillsCount > 0) {
      if (summary.overdueBillsCount === 1) {
        billScore = 12;
        billNote = `1 overdue payment detected ($${summary.overdueBillsAmount.toFixed(2)}). Immediate settlement advised.`;
      } else {
        billScore = 5;
        billNote = `${summary.overdueBillsCount} overdue payments detected ($${summary.overdueBillsAmount.toFixed(2)}). Risk of penalty fees.`;
      }
    } else if (!context.hasBills) {
      billScore = 20;
      billNote = 'No recurring bill obligations tracked.';
    }

    // Component 4: Savings Goals Velocity (Max 20)
    let goalScore = 12;
    let goalNote = 'No active savings goals targeted.';
    if (context.hasSavingsGoals && summary.totalSavingsTarget > 0) {
      const progress = summary.overallSavingsProgress;
      if (progress >= 75) {
        goalScore = 20;
        goalNote = `Superb goal execution with ${progress}% of targets fulfilled.`;
      } else if (progress >= 40) {
        goalScore = 16;
        goalNote = `Steady progress with ${progress}% of total goal targets accumulated.`;
      } else if (progress > 0) {
        goalScore = 11;
        goalNote = `Goal tracking initiated with ${progress}% funded. Monthly cadence active.`;
      } else {
        goalScore = 6;
        goalNote = 'Savings goals created but funding has not commenced.';
      }
    }

    const totalScore = Math.min(100, Math.max(0, savingsRateScore + budgetScore + billScore + goalScore));

    let rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Fair';
    if (totalScore >= 85) rating = 'Excellent';
    else if (totalScore >= 70) rating = 'Good';
    else if (totalScore >= 50) rating = 'Fair';
    else rating = 'Needs Attention';

    const summaryText = `Your overall financial health index is ${totalScore}/100 (${rating}), driven by a ${summary.savingsRatePercentage}% savings rate and ${
      summary.overdueBillsCount === 0 ? 'zero overdue bills' : `${summary.overdueBillsCount} overdue bills`
    }.`;

    return {
      score: totalScore,
      rating,
      breakdown: {
        savingsRateScore: { score: savingsRateScore, max: 30, note: savingsNote },
        budgetUtilizationScore: { score: budgetScore, max: 25, note: budgetNote },
        billTimelinessScore: { score: billScore, max: 25, note: billNote },
        goalProgressScore: { score: goalScore, max: 20, note: goalNote },
      },
      summary: summaryText,
    };
  }

  /**
   * Produce comprehensive deterministic financial insights from verified context
   */
  public static generateInsights(context: FinancialContextData): FinancialInsightsResponse {
    const healthScore = this.calculateHealthScore(context);

    // Top and lowest spending categories
    let topSpendingCategory = null;
    let lowestSpendingCategory = null;

    if (context.topExpenseCategories.length > 0) {
      topSpendingCategory = context.topExpenseCategories[0];
      lowestSpendingCategory = {
        category: context.topExpenseCategories[context.topExpenseCategories.length - 1].category,
        amount: context.topExpenseCategories[context.topExpenseCategories.length - 1].amount,
      };
    }

    // Budget warnings
    let exceededCount = 0;
    let warningCount = 0;
    const criticalCategories: string[] = [];

    for (const b of context.activeBudgets) {
      if (b.status === 'exceeded') {
        exceededCount += 1;
        criticalCategories.push(b.category);
      } else if (b.status === 'critical' || b.status === 'warning') {
        warningCount += 1;
        criticalCategories.push(b.category);
      }
    }

    // Savings trajectory
    let totalMonthlyRequired = 0;
    for (const g of context.activeGoals) {
      totalMonthlyRequired += g.monthlyRequired;
    }

    // Next due bill
    const nextDue = context.upcomingBills.length > 0 ? context.upcomingBills[0] : undefined;

    return {
      healthScore,
      topSpendingCategory,
      lowestSpendingCategory,
      budgetAlerts: {
        exceededCount,
        warningCount,
        criticalCategories: Array.from(new Set(criticalCategories)),
      },
      savingsTrajectory: {
        totalTarget: context.summary.totalSavingsTarget,
        totalSaved: context.summary.totalSavingsSaved,
        progressPercentage: context.summary.overallSavingsProgress,
        monthlyRequired: Math.round(totalMonthlyRequired * 100) / 100,
      },
      billCommitments: {
        monthlyRecurring: context.summary.totalMonthlyBills,
        overdueCount: context.summary.overdueBillsCount,
        overdueAmount: context.summary.overdueBillsAmount,
        nextDueBill: nextDue
          ? {
              name: nextDue.name,
              amount: nextDue.amount,
              dueDate: nextDue.dueDate,
            }
          : undefined,
      },
    };
  }
}
