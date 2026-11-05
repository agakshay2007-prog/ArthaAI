export type BudgetPeriod = 'monthly' | 'yearly';
export type BudgetStatus = 'normal' | 'moderate' | 'warning' | 'critical' | 'exceeded';

export interface BudgetAlert {
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

export interface Budget {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  period: BudgetPeriod;
  category: string;
  limit: number;
  limitInCents?: number;
  currency: string;
  startDate: string;
  endDate: string;
  alertThresholds: number[];
  isActive: boolean;
  actualSpent: number;
  actualSpentInCents?: number;
  remaining: number;
  remainingInCents?: number;
  utilizationPercentage: number;
  status: BudgetStatus;
  transactionCount?: number;
  alerts?: BudgetAlert[];
  createdAt?: string;
  updatedAt?: string;
  isDemoRecord?: boolean;
}

export interface CreateBudgetInput {
  name: string;
  description?: string;
  period: BudgetPeriod;
  category: string;
  limit: number;
  startDate: string;
  endDate: string;
  alertThresholds?: number[];
  currency?: string;
}

export interface UpdateBudgetInput {
  name?: string;
  description?: string;
  period?: BudgetPeriod;
  category?: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
  alertThresholds?: number[];
  isActive?: boolean;
}

export interface BudgetOverview {
  period: string;
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  overallUtilizationPercentage: number;
  activeBudgetCount: number;
  exceededBudgetCount: number;
  approachingLimitCount: number;
  normalBudgetCount: number;
  categorySpending: {
    category: string;
    limit: number;
    spent: number;
    remaining: number;
    utilizationPercentage: number;
    status: BudgetStatus;
  }[];
  recentAlerts: BudgetAlert[];
}

export interface BudgetAnalytics {
  budget: Budget;
  dailySpendTrend: {
    date: string;
    spent: number;
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
  recentTransactions: any[];
}
