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
