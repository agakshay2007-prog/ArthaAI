import mongoose from 'mongoose';
import { Transaction, centsToAmount } from '../../models/transaction.model.js';
import { Budget } from '../../models/budget.model.js';
import { SavingsGoal } from '../../models/savings-goal.model.js';
import { Bill } from '../../models/bill.model.js';
import { BillService } from '../bill.service.js';
import { FinancialContextData } from '../../types/index.js';

export class FinancialContextService {
  /**
   * Aggregate and format verified financial context for the authenticated user
   */
  public static async buildFinancialContext(userId: string): Promise<FinancialContextData> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Transactions Analysis
    const transactionAggregate = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$type',
          totalInCents: { $sum: '$amountInCents' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncomeCents = 0;
    let totalExpenseCents = 0;
    let transactionCount = 0;

    for (const group of transactionAggregate) {
      if (group._id === 'income') {
        totalIncomeCents = group.totalInCents;
      } else if (group._id === 'expense') {
        totalExpenseCents = group.totalInCents;
      }
      transactionCount += group.count;
    }

    const netCashFlowCents = totalIncomeCents - totalExpenseCents;
    const savingsRate =
      totalIncomeCents > 0
        ? Math.max(0, Math.min(100, Math.round(((totalIncomeCents - totalExpenseCents) / totalIncomeCents) * 1000) / 10))
        : 0;

    // Top Expense Categories
    const categoryAggregate = await Transaction.aggregate([
      { $match: { userId: userObjectId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          totalInCents: { $sum: '$amountInCents' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalInCents: -1 } },
      { $limit: 6 },
    ]);

    const topExpenseCategories = categoryAggregate.map((cat) => {
      const amount = centsToAmount(cat.totalInCents);
      const percentage =
        totalExpenseCents > 0
          ? Math.round((cat.totalInCents / totalExpenseCents) * 1000) / 10
          : 0;
      return {
        category: cat._id || 'Uncategorized',
        amount,
        percentage,
      };
    });

    // Recent 6 transactions
    const recentTxDocs = await Transaction.find({ userId: userObjectId })
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(6)
      .lean();

    const recentTransactions = recentTxDocs.map((tx) => ({
      title: tx.title,
      amount: centsToAmount(tx.amountInCents),
      type: tx.type,
      category: tx.category,
      date: new Date(tx.transactionDate).toISOString().split('T')[0],
    }));

    // 2. Budgets Analysis
    const budgetDocs = await Budget.find({ userId: userObjectId, isActive: true }).lean();
    let totalBudgetLimitCents = 0;
    let totalBudgetSpentCents = 0;

    const activeBudgets = await Promise.all(
      budgetDocs.map(async (b) => {
        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              userId: userObjectId,
              type: 'expense',
              category: b.category,
              transactionDate: { $gte: b.startDate, $lte: b.endDate },
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
        if (utilizationPercentage > 100) status = 'exceeded';
        else if (utilizationPercentage >= 90) status = 'critical';
        else if (utilizationPercentage >= 75) status = 'warning';

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

    // 3. Savings Goals Analysis
    const goalDocs = await SavingsGoal.find({
      userId: userObjectId,
      status: { $in: ['in_progress', 'completed'] },
    }).lean();

    let totalSavingsTargetCents = 0;
    let totalSavingsSavedCents = 0;

    const activeGoals = goalDocs.map((g) => {
      totalSavingsTargetCents += g.targetAmountInCents;
      totalSavingsSavedCents += g.currentAmountInCents;

      const progressPercentage =
        g.targetAmountInCents > 0
          ? Math.min(100, Math.round((g.currentAmountInCents / g.targetAmountInCents) * 1000) / 10)
          : 0;

      // Required monthly savings calculation
      let monthlyRequired = 0;
      if (g.deadline && g.currentAmountInCents < g.targetAmountInCents) {
        const now = new Date();
        const target = new Date(g.deadline);
        const monthsDiff = Math.max(
          1,
          (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
        );
        const remainingCents = g.targetAmountInCents - g.currentAmountInCents;
        monthlyRequired = centsToAmount(Math.ceil(remainingCents / monthsDiff));
      }

      return {
        name: g.name,
        targetAmount: centsToAmount(g.targetAmountInCents),
        currentAmount: centsToAmount(g.currentAmountInCents),
        progressPercentage,
        targetDate: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : undefined,
        monthlyRequired,
      };
    });

    const overallSavingsProgress =
      totalSavingsTargetCents > 0
        ? Math.min(
            100,
            Math.round((totalSavingsSavedCents / totalSavingsTargetCents) * 1000) / 10
          )
        : 0;

    // 4. Bills and Recurring Commitments Analysis
    const billDocs = await Bill.find({
      userId: userObjectId,
      status: { $nin: ['cancelled', 'archived'] },
    }).lean();

    const now = new Date();
    const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let totalMonthlyBillsCents = 0;
    let overdueBillsCount = 0;
    let overdueBillsAmountCents = 0;
    let upcoming30DaysBillsCents = 0;

    const upcomingBills = billDocs
      .filter((b) => b.dueDate)
      .map((b) => {
        const dueDate = new Date(b.dueDate);
        const isOverdue = dueDate < now && b.status === 'active';
        const monthlyEquivalentCents = BillService.normalizeMonthlyAmount(
          b.amountInCents,
          b.frequency
        );
        totalMonthlyBillsCents += monthlyEquivalentCents;

        if (isOverdue) {
          overdueBillsCount += 1;
          overdueBillsAmountCents += b.amountInCents;
        } else if (dueDate <= thirtyDaysOut && b.status === 'active') {
          upcoming30DaysBillsCents += b.amountInCents;
        }

        return {
          name: b.name,
          amount: centsToAmount(b.amountInCents),
          dueDate: dueDate.toISOString().split('T')[0],
          frequency: b.frequency,
          status: b.status,
          isOverdue,
        };
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 8);

    return {
      timestamp: new Date().toISOString(),
      currency: 'USD',
      hasTransactions: transactionCount > 0,
      hasBudgets: activeBudgets.length > 0,
      hasSavingsGoals: activeGoals.length > 0,
      hasBills: billDocs.length > 0,
      summary: {
        totalIncome: centsToAmount(totalIncomeCents),
        totalExpense: centsToAmount(totalExpenseCents),
        netCashFlow: centsToAmount(netCashFlowCents),
        savingsRatePercentage: savingsRate,
        totalBudgetLimit: centsToAmount(totalBudgetLimitCents),
        totalBudgetSpent: centsToAmount(totalBudgetSpentCents),
        overallBudgetUtilization,
        totalSavingsTarget: centsToAmount(totalSavingsTargetCents),
        totalSavingsSaved: centsToAmount(totalSavingsSavedCents),
        overallSavingsProgress,
        totalMonthlyBills: centsToAmount(totalMonthlyBillsCents),
        overdueBillsCount,
        overdueBillsAmount: centsToAmount(overdueBillsAmountCents),
        upcoming30DaysBillsAmount: centsToAmount(upcoming30DaysBillsCents),
      },
      topExpenseCategories,
      recentTransactions,
      activeBudgets,
      activeGoals,
      upcomingBills,
    };
  }
}
