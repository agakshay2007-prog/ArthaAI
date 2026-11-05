export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'starting';

export interface DatabaseHealthInfo {
  status: 'connected' | 'connecting' | 'disconnected' | 'disconnecting' | 'unconfigured';
  readyState: number;
  isReady: boolean;
  host?: string;
  name?: string;
}

export interface DetailedHealthData {
  service: string;
  status: HealthStatus;
  ready: boolean;
  uptime: number;
  timestamp: string;
  environment: string;
  database: DatabaseHealthInfo;
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      rssMB: string;
      heapUsedMB: string;
      heapTotalMB: string;
    };
  };
}

export interface LivenessData {
  service: string;
  status: 'alive';
  uptime: number;
  timestamp: string;
}

export interface ReadinessData {
  service: string;
  status: 'ready' | 'not_ready';
  ready: boolean;
  database: {
    status: DatabaseHealthInfo['status'];
    readyState: number;
    host?: string;
  };
  timestamp: string;
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSuccessData {
  user: UserResponse;
  token?: string;
}

export interface TransactionResponse {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amountInCents: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  merchant?: string;
  paymentMethod: string;
  transactionDate: string;
  notes?: string;
  account: string;
  status: 'completed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CategoryExpenseBreakdown {
  category: string;
  totalAmountInCents: number;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyFlowPoint {
  month: string;
  incomeInCents: number;
  income: number;
  expensesInCents: number;
  expenses: number;
  netSavingsInCents: number;
  netSavings: number;
}

export interface TransactionSummaryData {
  period: string;
  totalIncomeInCents: number;
  totalIncome: number;
  totalExpensesInCents: number;
  totalExpenses: number;
  netBalanceInCents: number;
  netBalance: number;
  totalSavingsInCents: number;
  totalSavings: number;
  savingsRatePercentage: number;
  transactionCount: number;
  categoryBreakdown: CategoryExpenseBreakdown[];
  monthlyCashFlow: MonthlyFlowPoint[];
}

export type BudgetPeriod = 'monthly' | 'yearly';
export type BudgetStatus = 'normal' | 'moderate' | 'warning' | 'critical' | 'exceeded';

export interface BudgetAlertItem {
  budgetId: string;
  budgetName: string;
  category: string;
  threshold: number;
  level: BudgetStatus;
  message: string;
  utilizationPercentage: number;
  limit: number;
  actualSpent: number;
  remaining: number;
  timestamp: string;
}

export interface BudgetResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  period: BudgetPeriod;
  category: string;
  limitInCents: number;
  limit: number;
  currency: string;
  startDate: string;
  endDate: string;
  alertThresholds: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetEnrichedResponse extends BudgetResponse {
  actualSpentInCents: number;
  actualSpent: number;
  remainingInCents: number;
  remaining: number;
  utilizationPercentage: number;
  status: BudgetStatus;
  transactionCount: number;
  alerts: BudgetAlertItem[];
}

export interface BudgetOverviewData {
  period: string;
  totalLimitInCents: number;
  totalLimit: number;
  totalSpentInCents: number;
  totalSpent: number;
  totalRemainingInCents: number;
  totalRemaining: number;
  overallUtilizationPercentage: number;
  activeBudgetCount: number;
  exceededBudgetCount: number;
  approachingLimitCount: number;
  normalBudgetCount: number;
  categorySpending: {
    category: string;
    limitInCents: number;
    limit: number;
    spentInCents: number;
    spent: number;
    remainingInCents: number;
    remaining: number;
    utilizationPercentage: number;
    status: BudgetStatus;
  }[];
  recentAlerts: BudgetAlertItem[];
}

export interface BudgetAnalyticsData {
  budget: BudgetEnrichedResponse;
  dailySpendTrend: {
    date: string;
    spentInCents: number;
    spent: number;
    cumulativeSpentInCents: number;
    cumulativeSpent: number;
  }[];
  velocity: {
    averageDailySpend: number;
    projectedTotalSpend: number;
    projectedUtilizationPercentage: number;
    isProjectedToExceed: boolean;
    daysRemaining: number;
    daysElapsed: number;
    totalDays: number;
  };
  recentTransactions: TransactionResponse[];
}

export type GoalCategory =
  | 'Emergency Fund'
  | 'Real Estate & Housing'
  | 'Vehicle & Auto'
  | 'Travel & Adventure'
  | 'Retirement & Wealth'
  | 'Education'
  | 'Investments'
  | 'Tech & Gadgets'
  | 'Family & Life'
  | 'Other';

export type GoalStatus = 'in_progress' | 'completed' | 'paused' | 'cancelled';
export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';
export type GoalHealthStatus = 'ahead' | 'on_track' | 'behind' | 'at_risk' | 'completed';

export interface GoalMilestoneItem {
  percentage: number;
  achievedAt: string;
}

export interface SavingsGoalResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  targetAmountInCents: number;
  targetAmount: number;
  currentAmountInCents: number;
  currentAmount: number;
  remainingAmount: number;
  remainingAmountInCents: number;
  progressPercentage: number;
  currency: string;
  startDate: string;
  deadline: string;
  status: GoalStatus;
  priority: GoalPriority;
  color: string;
  iconName: string;
  completedAt?: string;
  milestones: GoalMilestoneItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalContributionResponse {
  id: string;
  userId: string;
  goalId: string;
  amountInCents: number;
  amount: number;
  type: 'deposit' | 'withdrawal';
  contributionDate: string;
  notes?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalEnrichedResponse extends SavingsGoalResponse {
  healthStatus: GoalHealthStatus;
  daysRemaining: number;
  totalDays: number;
  daysElapsed: number;
  requiredMonthlySavings: number;
  requiredDailySavings: number;
  averageMonthlyContribution: number;
  projectedCompletionDate?: string;
  contributionCount: number;
  recentContributions: GoalContributionResponse[];
}

export interface SavingsRecommendation {
  id: string;
  goalId?: string;
  goalName?: string;
  type: 'acceleration' | 'feasibility' | 'milestone' | 'warning' | 'optimization';
  title: string;
  description: string;
  suggestedAction: string;
  impactAmount?: number;
  priority: 'low' | 'medium' | 'high';
}

export interface SavingsOverviewData {
  totalTargetAmountInCents: number;
  totalTargetAmount: number;
  totalSavedAmountInCents: number;
  totalSavedAmount: number;
  totalRemainingAmountInCents: number;
  totalRemainingAmount: number;
  overallProgressPercentage: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  totalMonthlyRequiredSavings: number;
  monthlySavingsCapacity: number;
  netSavingsPaceRatio: number; // capacity / required
  recommendations: SavingsRecommendation[];
  topGoals: SavingsGoalEnrichedResponse[];
}

export interface GoalAnalyticsData {
  goal: SavingsGoalEnrichedResponse;
  contributionTimeline: {
    date: string;
    amount: number;
    cumulativeSaved: number;
    targetProgress: number;
  }[];
  monthlyRunRate: {
    month: string;
    contributed: number;
    targetMonthly: number;
  }[];
  velocity: {
    dailyAverage: number;
    monthlyAverage: number;
    monthsRemaining: number;
    projectedMonthsToFinish: number;
    isFeasibleByDeadline: boolean;
    deficitOrSurplusPace: number;
  };
  milestonesStatus: {
    percentage: number;
    isAchieved: boolean;
    achievedAt?: string;
  }[];
}

// ----------------------------------------------------
// Phase 7: Bills, Payments & Recurring Expenses Types
// ----------------------------------------------------

export type BillCategory =
  | 'Electricity'
  | 'Water'
  | 'Internet'
  | 'Mobile'
  | 'Rent'
  | 'Insurance'
  | 'Education'
  | 'Loan EMI'
  | 'Streaming subscriptions'
  | 'Transportation'
  | 'Healthcare'
  | 'Other';

export type BillFrequency = 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type BillStatus = 'active' | 'paused' | 'cancelled' | 'completed';
export type BillPaymentStatus = 'paid' | 'failed' | 'pending';
export type BillSchedulePaymentStatus = 'paid' | 'upcoming' | 'due_today' | 'overdue' | 'partial';

export interface BillResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: BillCategory | string;
  provider?: string;
  amountInCents: number;
  amount: number;
  currency: string;
  frequency: BillFrequency;
  startDate: string;
  dueDate: string;
  nextDueDate?: string;
  autoRenew: boolean;
  reminderDays: number[];
  status: BillStatus;
  paymentStatus: BillSchedulePaymentStatus;
  totalPaidInCents: number;
  totalPaid: number;
  remainingDueInCents: number;
  remainingDue: number;
  daysUntilDue: number;
  isOverdue: boolean;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillPaymentResponse {
  id: string;
  userId: string;
  billId: string;
  billName?: string;
  amountInCents: number;
  amount: number;
  paymentDate: string;
  status: BillPaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillReminderItem {
  id: string;
  billId: string;
  billName: string;
  category: string;
  provider?: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  type: '7_days' | '3_days' | '1_day' | 'due_today' | 'overdue';
  isUrgent: boolean;
  message: string;
}

export interface BillOverviewData {
  totalBills: number;
  activeBillsCount: number;
  paidBillsCount: number;
  unpaidBillsCount: number;
  overdueBillsCount: number;
  upcomingPaymentsCount: number;
  totalMonthlyRecurringInCents: number;
  totalMonthlyRecurring: number;
  totalPaidThisMonthInCents: number;
  totalPaidThisMonth: number;
  totalPendingAmountInCents: number;
  totalPendingAmount: number;
  reminders: BillReminderItem[];
  upcomingBills: BillResponse[];
}

export interface BillAnalyticsData {
  bill: BillResponse;
  paymentHistory: BillPaymentResponse[];
  totalPaidInCents: number;
  totalPaid: number;
  totalPendingInCents: number;
  totalPending: number;
  paymentCount: number;
  monthlyTrend: {
    month: string;
    paid: number;
  }[];
  nextDueDate?: string;
  recurringEstimateAnnual: number;
}

export interface AIMessageItem {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AIConversationResponse {
  id: string;
  userId: string;
  title: string;
  messages: AIMessageItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AIConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastMessageSnippet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialContextData {
  timestamp: string;
  currency: string;
  hasTransactions: boolean;
  hasBudgets: boolean;
  hasSavingsGoals: boolean;
  hasBills: boolean;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    savingsRatePercentage: number;
    totalBudgetLimit: number;
    totalBudgetSpent: number;
    overallBudgetUtilization: number;
    totalSavingsTarget: number;
    totalSavingsSaved: number;
    overallSavingsProgress: number;
    totalMonthlyBills: number;
    overdueBillsCount: number;
    overdueBillsAmount: number;
    upcoming30DaysBillsAmount: number;
  };
  topExpenseCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  recentTransactions: {
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
  }[];
  activeBudgets: {
    name: string;
    category: string;
    limit: number;
    spent: number;
    remaining: number;
    utilizationPercentage: number;
    status: 'healthy' | 'warning' | 'critical' | 'exceeded';
  }[];
  activeGoals: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    progressPercentage: number;
    targetDate?: string;
    monthlyRequired: number;
  }[];
  upcomingBills: {
    name: string;
    amount: number;
    dueDate: string;
    frequency: string;
    status: string;
    isOverdue: boolean;
  }[];
}

export interface FinancialHealthScoreItem {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  breakdown: {
    savingsRateScore: { score: number; max: number; note: string };
    budgetUtilizationScore: { score: number; max: number; note: string };
    billTimelinessScore: { score: number; max: number; note: string };
    goalProgressScore: { score: number; max: number; note: string };
  };
  summary: string;
}

export interface FinancialInsightsResponse {
  healthScore: FinancialHealthScoreItem;
  topSpendingCategory: {
    category: string;
    amount: number;
    percentage: number;
  } | null;
  lowestSpendingCategory: {
    category: string;
    amount: number;
  } | null;
  budgetAlerts: {
    exceededCount: number;
    warningCount: number;
    criticalCategories: string[];
  };
  savingsTrajectory: {
    totalTarget: number;
    totalSaved: number;
    progressPercentage: number;
    monthlyRequired: number;
  };
  billCommitments: {
    monthlyRecurring: number;
    overdueCount: number;
    overdueAmount: number;
    nextDueBill?: {
      name: string;
      amount: number;
      dueDate: string;
    };
  };
}

export interface FinancialContextStatusResponse {
  hasTransactions: boolean;
  transactionCount: number;
  hasBudgets: boolean;
  budgetCount: number;
  hasSavingsGoals: boolean;
  savingsGoalCount: number;
  hasBills: boolean;
  billCount: number;
  currency: string;
  lastUpdated: string;
}

export interface AIChatResponseData {
  conversationId: string;
  message: AIMessageItem;
  title: string;
  model: string;
  isSimulated?: boolean;
}

export type ReportType = 'monthly' | 'quarterly' | 'annual' | 'custom';
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportPeriodInfo {
  type: ReportType;
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


