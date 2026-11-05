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
  | 'Shopping & Retail';

export interface Transaction {
  id: string;
  title: string;
  category: TransactionCategory;
  date: string;
  amount: number;
  type: TransactionType;
  status: 'completed' | 'pending';
  account: string;
  merchant?: string;
  isDemoRecord: true;
}

export interface ExpenseCategoryShare {
  name: string;
  value: number;
  color: string;
  formattedAmount: string;
}

export interface MonthlyCashFlowPoint {
  month: string;
  income: number;
  expenses: number;
  netSavings: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  color: string;
  iconName: string;
  isDemoRecord: true;
}

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

