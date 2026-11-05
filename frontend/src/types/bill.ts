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
  | 'Technology'
  | 'Utilities'
  | 'Other';

export type BillFrequency = 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type BillStatus = 'active' | 'paused' | 'cancelled' | 'completed';
export type BillPaymentStatus = 'paid' | 'failed' | 'pending';
export type BillSchedulePaymentStatus = 'paid' | 'upcoming' | 'due_today' | 'overdue' | 'partial';

export interface BillPayment {
  id: string;
  userId?: string;
  billId: string;
  billName?: string;
  amount: number;
  amountInCents?: number;
  paymentDate: string;
  status: BillPaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  isDemoRecord?: boolean;
}

export interface Bill {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  category: BillCategory | string;
  provider?: string;
  amount: number;
  amountInCents?: number;
  currency: string;
  frequency: BillFrequency;
  startDate: string;
  dueDate: string;
  nextDueDate?: string;
  autoRenew: boolean;
  reminderDays: number[];
  status: BillStatus;
  paymentStatus: BillSchedulePaymentStatus;
  totalPaid: number;
  totalPaidInCents?: number;
  remainingDue: number;
  remainingDueInCents?: number;
  daysUntilDue: number;
  isOverdue: boolean;
  lastPaymentDate?: string;
  recentPayments?: BillPayment[];
  createdAt?: string;
  updatedAt?: string;
  isDemoRecord?: boolean;
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

export interface BillOverview {
  totalBills: number;
  activeBillsCount: number;
  paidBillsCount: number;
  unpaidBillsCount: number;
  overdueBillsCount: number;
  upcomingPaymentsCount: number;
  totalMonthlyRecurring: number;
  totalMonthlyRecurringInCents?: number;
  totalPaidThisMonth: number;
  totalPaidThisMonthInCents?: number;
  totalPendingAmount: number;
  totalPendingAmountInCents?: number;
  reminders: BillReminderItem[];
  upcomingBills: Bill[];
}

export interface BillAnalytics {
  bill: Bill;
  paymentHistory: BillPayment[];
  totalPaid: number;
  totalPending: number;
  paymentCount: number;
  monthlyTrend: {
    month: string;
    paid: number;
  }[];
  nextDueDate?: string;
  recurringEstimateAnnual: number;
}

export interface CreateBillInput {
  name: string;
  description?: string;
  category: string;
  provider?: string;
  amount: number;
  currency?: string;
  frequency: BillFrequency;
  startDate?: string;
  dueDate: string;
  autoRenew?: boolean;
  reminderDays?: number[];
}

export interface UpdateBillInput {
  name?: string;
  description?: string;
  category?: string;
  provider?: string;
  amount?: number;
  frequency?: BillFrequency;
  dueDate?: string;
  reminderDays?: number[];
  autoRenew?: boolean;
  status?: BillStatus;
}

export interface RecordPaymentInput {
  amount: number;
  paymentDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
  transactionId?: string;
  createTransaction?: boolean;
}
