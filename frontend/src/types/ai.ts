export interface AIMessageItem {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isSimulated?: boolean;
}

export interface AIConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastMessageSnippet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIConversationDetail {
  id: string;
  title: string;
  messages: AIMessageItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FinancialHealthBreakdownItem {
  score: number;
  max: number;
  note: string;
}

export interface FinancialHealthScore {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  breakdown: {
    savingsRateScore: FinancialHealthBreakdownItem;
    budgetUtilizationScore: FinancialHealthBreakdownItem;
    billTimelinessScore: FinancialHealthBreakdownItem;
    goalProgressScore: FinancialHealthBreakdownItem;
  };
  summary: string;
}

export interface FinancialInsightsData {
  healthScore: FinancialHealthScore;
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

export interface FinancialContextStatus {
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

export interface ChatResponse {
  conversationId: string;
  title: string;
  model: string;
  message: AIMessageItem;
  isSimulated?: boolean;
}
