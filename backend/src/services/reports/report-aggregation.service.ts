import mongoose from 'mongoose';
import { Transaction, centsToAmount } from '../../models/transaction.model.js';
import { Budget } from '../../models/budget.model.js';
import { SavingsGoal } from '../../models/savings-goal.model.js';
import { GoalContribution } from '../../models/goal-contribution.model.js';
import { Bill } from '../../models/bill.model.js';
import {
  ReportSummaryMetrics,
  CategoryReportItem,
  CashFlowPoint,
  BudgetPerformanceReportItem,
  SavingsPerformanceReportItem,
  BillReportItem,
} from '../../types/index.js';

export interface AggregatedReportData {
  summary: ReportSummaryMetrics;
  categories: CategoryReportItem[];
  cashFlowTrend: CashFlowPoint[];
  budgetPerformance: BudgetPerformanceReportItem[];
  savingsPerformance: SavingsPerformanceReportItem[];
  billsAnalysis: BillReportItem[];
}

export class ReportAggregationService {
  /**
   * Aggregate all financial metrics for user within specified date bounds
   */
  public static async aggregatePeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AggregatedReportData> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Transactions Aggregation
    const txMatch = {
      userId: userObjectId,
      status: 'completed',
      transactionDate: { $gte: startDate, $lte: endDate },
    };

    const [typeAggregate, categoryAggregate, allTransactions] = await Promise.all([
      Transaction.aggregate([
        { $match: txMatch },
        {
          $group: {
            _id: '$type',
            totalInCents: { $sum: '$amountInCents' },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { ...txMatch, type: 'expense' } },
        {
          $group: {
            _id: '$category',
            totalInCents: { $sum: '$amountInCents' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalInCents: -1 } },
      ]),
      Transaction.find(txMatch).sort({ transactionDate: 1 }).lean(),
    ]);

    let totalIncomeCents = 0;
    let totalExpenseCents = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const group of typeAggregate) {
      if (group._id === 'income') {
        totalIncomeCents = group.totalInCents;
        incomeCount = group.count;
      } else if (group._id === 'expense') {
        totalExpenseCents = group.totalInCents;
        expenseCount = group.count;
      }
    }

    const netCashFlowCents = totalIncomeCents - totalExpenseCents;
    const savingsRate =
      totalIncomeCents > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(((totalIncomeCents - totalExpenseCents) / totalIncomeCents) * 1000) / 10
            )
          )
        : 0;

    // Categories Breakdown
    const categories: CategoryReportItem[] = categoryAggregate.map((cat) => {
      const amount = centsToAmount(cat.totalInCents);
      const percentage =
        totalExpenseCents > 0
          ? Math.round((cat.totalInCents / totalExpenseCents) * 1000) / 10
          : 0;
      return {
        category: cat._id || 'Uncategorized',
        amount,
        percentage,
        transactionCount: cat.count,
      };
    });

    const highestSpendingCategory =
      categories.length > 0
        ? {
            category: categories[0].category,
            amount: categories[0].amount,
            percentage: categories[0].percentage,
          }
        : null;

    const lowestSpendingCategory =
      categories.length > 0
        ? {
            category: categories[categories.length - 1].category,
            amount: categories[categories.length - 1].amount,
          }
        : null;

    // Cash Flow Timeline Points
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cashFlowTrendMap = new Map<string, { income: number; expense: number }>();

    for (const tx of allTransactions) {
      const txDate = new Date(tx.transactionDate);
      const key =
        diffDays <= 35
          ? txDate.toISOString().split('T')[0] // Daily points: "YYYY-MM-DD"
          : `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`; // Monthly points: "YYYY-MM"

      const existing = cashFlowTrendMap.get(key) || { income: 0, expense: 0 };
      if (tx.type === 'income') {
        existing.income += tx.amountInCents;
      } else {
        existing.expense += tx.amountInCents;
      }
      cashFlowTrendMap.set(key, existing);
    }

    const cashFlowTrend: CashFlowPoint[] = Array.from(cashFlowTrendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, values]) => ({
        date,
        income: centsToAmount(values.income),
        expenses: centsToAmount(values.expense),
        netCashFlow: centsToAmount(values.income - values.expense),
      }));

    // 2. Budget Performance Aggregation
    const budgets = await Budget.find({
      userId: userObjectId,
      isActive: true,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).lean();

    let totalBudgetLimitCents = 0;
    let totalBudgetSpentCents = 0;
    let exceededCount = 0;

    const budgetPerformance: BudgetPerformanceReportItem[] = await Promise.all(
      budgets.map(async (b) => {
        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              userId: userObjectId,
              type: 'expense',
              category: b.category,
              transactionDate: {
                $gte: new Date(Math.max(startDate.getTime(), b.startDate.getTime())),
                $lte: new Date(Math.min(endDate.getTime(), b.endDate.getTime())),
              },
            },
          },
          { $group: { _id: null, totalSpent: { $sum: '$amountInCents' } } },
        ]);

        const spentInCents = spentAgg.length > 0 ? spentAgg[0].totalSpent : 0;
        const limitInCents = b.limitInCents;
        const remainingInCents = Math.max(0, limitInCents - spentInCents);
        const utilizationPercentage =
          limitInCents > 0 ? Math.round((spentInCents / limitInCents) * 1000) / 10 : 0;

        let status: 'healthy' | 'warning' | 'critical' | 'exceeded' = 'healthy';
        if (utilizationPercentage > 100) {
          status = 'exceeded';
          exceededCount += 1;
        } else if (utilizationPercentage >= 90) {
          status = 'critical';
        } else if (utilizationPercentage >= 75) {
          status = 'warning';
        }

        totalBudgetLimitCents += limitInCents;
        totalBudgetSpentCents += spentInCents;

        return {
          name: b.name,
          category: b.category,
          limit: centsToAmount(limitInCents),
          spent: centsToAmount(spentInCents),
          remaining: centsToAmount(remainingInCents),
          utilizationPercentage,
          status,
        };
      })
    );

    const overallBudgetUtilization =
      totalBudgetLimitCents > 0
        ? Math.round((totalBudgetSpentCents / totalBudgetLimitCents) * 1000) / 10
        : 0;

    // 3. Savings Performance Aggregation
    const [goals, periodContributions] = await Promise.all([
      SavingsGoal.find({ userId: userObjectId }).lean(),
      GoalContribution.find({
        userId: userObjectId,
        contributionDate: { $gte: startDate, $lte: endDate },
      }).lean(),
    ]);

    let totalSavedCents = 0;
    let totalTargetCents = 0;
    let totalPeriodContributionsCents = 0;

    const contributionsByGoal = new Map<string, number>();
    for (const c of periodContributions) {
      const gId = c.goalId.toString();
      const current = contributionsByGoal.get(gId) || 0;
      if (c.type === 'deposit') {
        contributionsByGoal.set(gId, current + c.amountInCents);
        totalPeriodContributionsCents += c.amountInCents;
      } else {
        contributionsByGoal.set(gId, current - c.amountInCents);
        totalPeriodContributionsCents -= c.amountInCents;
      }
    }

    const savingsPerformance: SavingsPerformanceReportItem[] = goals.map((g) => {
      totalSavedCents += g.currentAmountInCents;
      totalTargetCents += g.targetAmountInCents;

      const progress =
        g.targetAmountInCents > 0
          ? Math.min(
              100,
              Math.round((g.currentAmountInCents / g.targetAmountInCents) * 1000) / 10
            )
          : 0;

      const periodNetCents = contributionsByGoal.get(g._id.toString()) || 0;

      return {
        name: g.name,
        category: g.category,
        targetAmount: centsToAmount(g.targetAmountInCents),
        currentAmount: centsToAmount(g.currentAmountInCents),
        progressPercentage: progress,
        periodContributions: centsToAmount(periodNetCents),
        status: g.status,
      };
    });

    const overallSavingsProgress =
      totalTargetCents > 0
        ? Math.min(100, Math.round((totalSavedCents / totalTargetCents) * 1000) / 10)
        : 0;

    // 4. Bills Performance Aggregation
    const bills = await Bill.find({
      userId: userObjectId,
      status: { $nin: ['cancelled', 'archived'] },
    }).lean();

    const now = new Date();
    let totalPaidInPeriodCents = 0;
    let pendingCommitmentsCents = 0;
    let overdueCount = 0;
    let overdueAmountCents = 0;

    const billsAnalysis: BillReportItem[] = bills.map((b) => {
      const isPaid = b.status === 'completed';
      const isOverdue = b.dueDate && new Date(b.dueDate) < now && !isPaid;

      if (isPaid) {
        totalPaidInPeriodCents += b.amountInCents;
      } else {
        pendingCommitmentsCents += b.amountInCents;
      }

      if (isOverdue) {
        overdueCount += 1;
        overdueAmountCents += b.amountInCents;
      }

      return {
        name: b.name,
        category: b.category,
        amount: centsToAmount(b.amountInCents),
        dueDate: b.dueDate ? new Date(b.dueDate).toISOString().split('T')[0] : 'N/A',
        frequency: b.frequency,
        status: b.status,
        paymentStatus: isPaid ? 'paid' : isOverdue ? 'overdue' : 'upcoming',
      };
    });

    const summary: ReportSummaryMetrics = {
      totalIncome: centsToAmount(totalIncomeCents),
      totalExpenses: centsToAmount(totalExpenseCents),
      netCashFlow: centsToAmount(netCashFlowCents),
      savingsRatePercentage: savingsRate,
      transactionCount: incomeCount + expenseCount,
      incomeTransactionCount: incomeCount,
      expenseTransactionCount: expenseCount,
      highestSpendingCategory,
      lowestSpendingCategory,
      budgetUtilization: {
        totalLimit: centsToAmount(totalBudgetLimitCents),
        totalSpent: centsToAmount(totalBudgetSpentCents),
        utilizationPercentage: overallBudgetUtilization,
        activeBudgetCount: budgets.length,
        exceededCount,
      },
      savingsProgress: {
        totalSaved: centsToAmount(totalSavedCents),
        totalTarget: centsToAmount(totalTargetCents),
        overallProgressPercentage: overallSavingsProgress,
        periodContributions: centsToAmount(totalPeriodContributionsCents),
      },
      billsSummary: {
        totalPaidInPeriod: centsToAmount(totalPaidInPeriodCents),
        pendingCommitments: centsToAmount(pendingCommitmentsCents),
        overdueCount,
        overdueAmount: centsToAmount(overdueAmountCents),
      },
      netWorthNote: 'Net worth unavailable — additional asset and liability information is required.',
    };

    return {
      summary,
      categories,
      cashFlowTrend,
      budgetPerformance,
      savingsPerformance,
      billsAnalysis,
    };
  }
}
