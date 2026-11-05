export type ReportPeriodType = 'monthly' | 'quarterly' | 'annual' | 'custom';

export type ReportFilterPreset =
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom';

export interface ReportPeriodInfo {
  type: ReportPeriodType;
  startDate: string;
  endDate: string;
  label: string;
  currency: string;
  generatedAt: string;
}

export interface MetricComparisonItem {
  current: number;
  previous: number;
  delta: number;
  percentageChange: number;
}

export interface ReportSummaryMetrics {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRatePercentage: number;
  transactionCount: number;
  incomeTransactionCount: number;
  expenseTransactionCount: number;
  highestSpendingCategory: {
    category: string;
    amount: number;
    percentage: number;
  } | null;
  lowestSpendingCategory: {
    category: string;
    amount: number;
  } | null;
  budgetUtilization: {
    totalLimit: number;
    totalSpent: number;
    utilizationPercentage: number;
    activeBudgetCount: number;
    exceededCount: number;
  };
  savingsProgress: {
    totalSaved: number;
    totalTarget: number;
    overallProgressPercentage: number;
    periodContributions: number;
  };
  billsSummary: {
    totalPaidInPeriod: number;
    pendingCommitments: number;
    overdueCount: number;
    overdueAmount: number;
  };
  netWorthNote: string;
}

export interface CategoryReportItem {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  previousAmount?: number;
  changePercentage?: number;
}

export interface CashFlowPoint {
  date: string;
  income: number;
  expenses: number;
  netCashFlow: number;
}

export interface BudgetPerformanceReportItem {
  name: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  utilizationPercentage: number;
  status: 'healthy' | 'warning' | 'critical' | 'exceeded';
}

export interface SavingsPerformanceReportItem {
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  periodContributions: number;
  status: string;
}

export interface BillReportItem {
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  frequency: string;
  status: string;
  paymentStatus: string;
}

export interface ComprehensiveFinancialReport {
  period: ReportPeriodInfo;
  summary: ReportSummaryMetrics;
  comparison?: {
    income: MetricComparisonItem;
    expenses: MetricComparisonItem;
    netCashFlow: MetricComparisonItem;
    savingsRate: MetricComparisonItem;
    previousPeriodLabel: string;
  };
  categories: CategoryReportItem[];
  cashFlowTrend: CashFlowPoint[];
  budgetPerformance: BudgetPerformanceReportItem[];
  savingsPerformance: SavingsPerformanceReportItem[];
  billsAnalysis: BillReportItem[];
  aiAnalysis?: string;
}

export interface AIReportInsightsResponse {
  insights: string;
  reportLabel: string;
  generatedAt: string;
}
