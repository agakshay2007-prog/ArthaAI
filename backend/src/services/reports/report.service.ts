import {
  ComprehensiveFinancialReport,
  ReportPeriodInfo,
  ReportSummaryMetrics,
} from '../../types/index.js';
import { ReportAggregationService } from './report-aggregation.service.js';
import { ReportComparisonService } from './report-comparison.service.js';
import { GeminiService } from '../ai/gemini.service.js';
import { PromptBuilderService } from '../ai/prompt-builder.service.js';

export class ReportService {
  /**
   * Generate comprehensive monthly financial report with comparison to prior month
   */
  public static async generateMonthlyReport(
    userId: string,
    year: number,
    month: number
  ): Promise<ComprehensiveFinancialReport> {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const label = `${monthNames[month - 1]} ${year}`;

    return this.buildReportWithComparison(userId, 'monthly', startDate, endDate, label);
  }

  /**
   * Generate comprehensive quarterly financial report with comparison to prior quarter
   */
  public static async generateQuarterlyReport(
    userId: string,
    year: number,
    quarter: number
  ): Promise<ComprehensiveFinancialReport> {
    const qStartMonth = (quarter - 1) * 3;
    const startDate = new Date(Date.UTC(year, qStartMonth, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, qStartMonth + 3, 0, 23, 59, 59, 999));
    const label = `Q${quarter} ${year}`;

    return this.buildReportWithComparison(userId, 'quarterly', startDate, endDate, label);
  }

  /**
   * Generate comprehensive annual financial report with comparison to prior year
   */
  public static async generateAnnualReport(
    userId: string,
    year: number
  ): Promise<ComprehensiveFinancialReport> {
    const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    const label = `Full Year ${year}`;

    return this.buildReportWithComparison(userId, 'annual', startDate, endDate, label);
  }

  /**
   * Generate custom date range report
   */
  public static async generateCustomReport(
    userId: string,
    startDate: Date,
    endDate: Date,
    customLabel?: string
  ): Promise<ComprehensiveFinancialReport> {
    const label =
      customLabel ||
      `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`;

    return this.buildReportWithComparison(userId, 'custom', startDate, endDate, label);
  }

  /**
   * Common helper: aggregate current and previous period, then calculate deltas
   */
  private static async buildReportWithComparison(
    userId: string,
    type: 'monthly' | 'quarterly' | 'annual' | 'custom',
    startDate: Date,
    endDate: Date,
    label: string
  ): Promise<ComprehensiveFinancialReport> {
    const previousInfo = ReportComparisonService.getPreviousPeriodRange(type, startDate, endDate);

    // Parallel aggregation of current and prior periods
    const [currentData, previousData] = await Promise.all([
      ReportAggregationService.aggregatePeriod(userId, startDate, endDate),
      ReportAggregationService.aggregatePeriod(
        userId,
        previousInfo.prevStartDate,
        previousInfo.prevEndDate
      ),
    ]);

    // Period Comparisons
    const incomeComparison = ReportComparisonService.compareMetrics(
      currentData.summary.totalIncome,
      previousData.summary.totalIncome
    );
    const expenseComparison = ReportComparisonService.compareMetrics(
      currentData.summary.totalExpenses,
      previousData.summary.totalExpenses
    );
    const cashFlowComparison = ReportComparisonService.compareMetrics(
      currentData.summary.netCashFlow,
      previousData.summary.netCashFlow
    );
    const savingsRateComparison = ReportComparisonService.compareMetrics(
      currentData.summary.savingsRatePercentage,
      previousData.summary.savingsRatePercentage
    );

    // Merge previous amounts into category breakdown
    const prevCatMap = new Map<string, number>();
    for (const pCat of previousData.categories) {
      prevCatMap.set(pCat.category, pCat.amount);
    }

    const categoriesWithDelta = currentData.categories.map((cat) => {
      const prevAmount = prevCatMap.get(cat.category) || 0;
      let changePercentage = 0;
      if (prevAmount > 0) {
        changePercentage =
          Math.round(((cat.amount - prevAmount) / prevAmount) * 1000) / 10;
      }
      return {
        ...cat,
        previousAmount: prevAmount,
        changePercentage,
      };
    });

    const periodInfo: ReportPeriodInfo = {
      type,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      label,
      currency: 'USD',
      generatedAt: new Date().toISOString(),
    };

    return {
      period: periodInfo,
      summary: currentData.summary,
      comparison: {
        income: incomeComparison,
        expenses: expenseComparison,
        netCashFlow: cashFlowComparison,
        savingsRate: savingsRateComparison,
        previousPeriodLabel: previousInfo.label,
      },
      categories: categoriesWithDelta,
      cashFlowTrend: currentData.cashFlowTrend,
      budgetPerformance: currentData.budgetPerformance,
      savingsPerformance: currentData.savingsPerformance,
      billsAnalysis: currentData.billsAnalysis,
    };
  }

  /**
   * Quick summary metrics for reporting overview (current month)
   */
  public static async getReportOverview(userId: string): Promise<ReportSummaryMetrics> {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

    const aggregated = await ReportAggregationService.aggregatePeriod(userId, startOfMonth, endOfMonth);
    return aggregated.summary;
  }

  /**
   * Generate AI explanation and insights for a report using Google Gemini
   */
  public static async generateAIReportInsights(
    report: ComprehensiveFinancialReport,
    customQuestion?: string
  ): Promise<string> {
    const s = report.summary;
    const c = report.comparison;

    // Deterministic fallback if Gemini is not configured
    if (!GeminiService.isConfigured()) {
      return `### Financial Report Summary (${report.period.label})
- **Net Cash Flow**: $${s.netCashFlow.toFixed(2)} with a **${s.savingsRatePercentage}% savings rate**.
- **Income & Outflows**: Total earnings of $${s.totalIncome.toFixed(2)} against $${s.totalExpenses.toFixed(2)} in total expenditures.
- **Top Outflow**: ${s.highestSpendingCategory ? `${s.highestSpendingCategory.category} at $${s.highestSpendingCategory.amount.toFixed(2)} (${s.highestSpendingCategory.percentage}%)` : 'No expenses recorded'}.
- **Budget Performance**: Overall utilization is ${s.budgetUtilization.utilizationPercentage}% with ${s.budgetUtilization.exceededCount} exceeded budgets.
- **Period Trend**: Net cash flow changed by ${c ? `${c.netCashFlow.delta >= 0 ? '+' : ''}$${c.netCashFlow.delta.toFixed(2)} (${c.netCashFlow.percentageChange}%) compared to ${c.previousPeriodLabel}` : 'N/A'}.

*(Note: Live Gemini model interpretation is currently in standby. Set GEMINI_API_KEY in backend/.env for dynamic generative insights.)*`;
    }

    const systemInstruction = PromptBuilderService.buildSystemInstruction();

    const reportContext = `=== ARTHAAI REPORT CONTEXT ===
Report Label: ${report.period.label} (${report.period.startDate} to ${report.period.endDate})
Currency: ${report.period.currency}

[EXECUTIVE SUMMARY]
- Total Income: $${s.totalIncome.toFixed(2)}
- Total Expenses: $${s.totalExpenses.toFixed(2)}
- Net Cash Flow: $${s.netCashFlow.toFixed(2)}
- Savings Rate: ${s.savingsRatePercentage}%
- Transaction Count: ${s.transactionCount} (${s.incomeTransactionCount} income, ${s.expenseTransactionCount} expense)

[PERIOD OVER PERIOD DELTAS]
${
  c
    ? `- Income Change: ${c.income.delta >= 0 ? '+' : ''}$${c.income.delta.toFixed(2)} (${c.income.percentageChange}%)
- Expenses Change: ${c.expenses.delta >= 0 ? '+' : ''}$${c.expenses.delta.toFixed(2)} (${c.expenses.percentageChange}%)
- Net Cash Flow Change: ${c.netCashFlow.delta >= 0 ? '+' : ''}$${c.netCashFlow.delta.toFixed(2)} (${c.netCashFlow.percentageChange}%)
- Compared to: ${c.previousPeriodLabel}`
    : 'No prior period comparison available.'
}

[TOP EXPENSE CATEGORIES]
${report.categories.slice(0, 5).map((cat) => `- ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage}%)`).join('\n')}

[BUDGET STATUS]
- Overall Utilization: ${s.budgetUtilization.utilizationPercentage}%
- Active Budgets: ${s.budgetUtilization.activeBudgetCount}
- Exceeded Budgets: ${s.budgetUtilization.exceededCount}

[SAVINGS VELOCITY]
- Total Saved: $${s.savingsProgress.totalSaved.toFixed(2)}
- Period Contributions: $${s.savingsProgress.periodContributions.toFixed(2)}

[UPCOMING BILL COMMITMENTS]
- Total Paid in Period: $${s.billsSummary.totalPaidInPeriod.toFixed(2)}
- Pending Obligations: $${s.billsSummary.pendingCommitments.toFixed(2)}
- Overdue: ${s.billsSummary.overdueCount} ($${s.billsSummary.overdueAmount.toFixed(2)})
=== END REPORT CONTEXT ===`;

    const userPrompt = `${reportContext}\n\nUser Question:\n${
      customQuestion || 'Provide an executive breakdown of my financial performance for this period, highlighting key spending variances, budget risks, and 3 actionable recommendations.'
    }`;

    try {
      const response = await GeminiService.generateContent({
        prompt: userPrompt,
        systemInstruction,
      });

      return response.text;
    } catch (err: any) {
      console.error('[Report AI Insights Error]:', err?.message || err);
      return `Failed to generate AI report insights: ${err?.message || 'Service unavailable'}`;
    }
  }
}
