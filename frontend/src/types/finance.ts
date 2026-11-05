export type NavigationTab =
  | 'dashboard'
  | 'transactions'
  | 'budgeting'
  | 'savings'
  | 'bills'
  | 'ai-assistant'
  | 'reports'
  | 'settings';

export type DateFilterOption = 'this_month' | 'last_30_days' | 'quarter_to_date' | 'year_to_date';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Salary & Earnings'
  | 'Investments & Dividends'
  | 'Housing & Rent'
  | 'Food & Dining'
  | 'Technology & SaaS'
  | 'Transportation'
  | 'Utilities & Bills'
  | 'Entertainment & Leisure'
  | 'Healthcare & Wellness'
  | 'Shopping & Retail'
  | 'Other'
  | string;

export interface Transaction {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  category: TransactionCategory;
  date: string;
  transactionDate?: string;
  amount: number;
  amountInCents?: number;
  type: TransactionType;
  status: 'completed' | 'pending';
  account: string;
  merchant?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  isDemoRecord?: boolean;
}

export interface CreateTransactionInput {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  merchant?: string;
  paymentMethod?: string;
  transactionDate?: string;
  notes?: string;
  account?: string;
}

export interface UpdateTransactionInput {
  title?: string;
  amount?: number;
  type?: TransactionType;
  category?: string;
  merchant?: string;
  paymentMethod?: string;
  transactionDate?: string;
  notes?: string;
  account?: string;
  status?: 'completed' | 'pending';
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  category?: string;
  dateFilter?: DateFilterOption | 'all';
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CategoryExpenseBreakdown {
  category: string;
  totalAmountInCents?: number;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyCashFlowPoint {
  month: string;
  income: number;
  expenses: number;
  netSavings: number;
}

export interface TransactionSummary {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalSavings: number;
  savingsRatePercentage: number;
  transactionCount: number;
  categoryBreakdown: CategoryExpenseBreakdown[];
  monthlyCashFlow: MonthlyCashFlowPoint[];
}

export interface ExpenseCategoryShare {
  name: string;
  value: number;
  color: string;
  formattedAmount: string;
}

export type {
  SavingsGoal,
  GoalContribution,
  SavingsOverview,
  GoalAnalytics,
  GoalStatus,
  GoalPriority,
  GoalHealthStatus,
  CreateGoalInput,
  UpdateGoalInput,
  AddContributionInput,
} from './savings';

export interface FinancialHealthMetrics {
  score: number; // 0 - 100
  rating: 'Exceptional' | 'Excellent' | 'Good' | 'Needs Attention';
  savingsRatePercentage: number;
  runwayMonths: number;
  debtToIncomeRatio: number;
  monthlySavingsTargetMet: boolean;
  actionableInsights: {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    category: string;
  }[];
}

export interface BudgetCategory {
  id: string;
  category: TransactionCategory;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
}

export interface BillPaymentItem {
  id: string;
  title: string;
  biller: string;
  amount: number;
  dueDate: string;
  isAutoPay: boolean;
  status: 'upcoming' | 'paid' | 'overdue';
  category: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
  isDemoResponse: boolean;
}
