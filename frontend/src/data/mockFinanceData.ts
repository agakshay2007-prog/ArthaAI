import {
  Transaction,
  ExpenseCategoryShare,
  MonthlyCashFlowPoint,
  SavingsGoal,
  GoalContribution,
  SavingsOverview,
  FinancialHealthMetrics,
  BudgetCategory,
  BillPaymentItem,
  DateFilterOption,
} from '../types/finance';
import { Budget, BudgetAlert, BudgetStatus } from '../types/budget';

/**
 * NOTICE: Clearly identified frontend demonstration records.
 * These records represent sample personal finance scenarios for UI evaluation
 * and are entirely decoupled from live user credentials or backend data stores.
 */

export const DEMO_FINANCIAL_SUMMARY = {
  totalBalance: 54820.5,
  balanceChangePercentage: 4.8,
  monthlyIncome: 9450.0,
  incomeChangePercentage: 6.2,
  monthlyExpenses: 4830.25,
  expensesChangePercentage: -2.4, // spent less
  totalSavings: 32150.0,
  savingsRatePercentage: 38.6,
  currencySymbol: '$',
  currencyCode: 'USD',
  userProfile: {
    name: 'Alex Morgan',
    email: 'alex.morgan@artha.ai',
    tier: 'ArthaAI Pro',
    avatarInitials: 'AM',
  },
};

export const DEMO_SUMMARIES_BY_DATE_FILTER: Record<DateFilterOption, typeof DEMO_FINANCIAL_SUMMARY> = {
  this_month: {
    ...DEMO_FINANCIAL_SUMMARY,
  },
  last_30_days: {
    ...DEMO_FINANCIAL_SUMMARY,
    totalBalance: 53940.0,
    balanceChangePercentage: 3.9,
    monthlyIncome: 9280.0,
    incomeChangePercentage: 4.5,
    monthlyExpenses: 4920.0,
    expensesChangePercentage: -1.2,
    totalSavings: 31200.0,
    savingsRatePercentage: 36.8,
  },
  quarter_to_date: {
    ...DEMO_FINANCIAL_SUMMARY,
    totalBalance: 54820.5,
    balanceChangePercentage: 8.4,
    monthlyIncome: 28100.0,
    incomeChangePercentage: 9.1,
    monthlyExpenses: 14750.5,
    expensesChangePercentage: -3.8,
    totalSavings: 32150.0,
    savingsRatePercentage: 41.2,
  },
  year_to_date: {
    ...DEMO_FINANCIAL_SUMMARY,
    totalBalance: 54820.5,
    balanceChangePercentage: 18.2,
    monthlyIncome: 65000.0,
    incomeChangePercentage: 14.6,
    monthlyExpenses: 34580.0,
    expensesChangePercentage: -5.1,
    totalSavings: 32150.0,
    savingsRatePercentage: 39.4,
  },
};

export const DEMO_MONTHLY_CASH_FLOW: MonthlyCashFlowPoint[] = [
  { month: 'Jan', income: 8400, expenses: 5100, netSavings: 3300 },
  { month: 'Feb', income: 8600, expenses: 4950, netSavings: 3650 },
  { month: 'Mar', income: 8900, expenses: 5400, netSavings: 3500 },
  { month: 'Apr', income: 9100, expenses: 4700, netSavings: 4400 },
  { month: 'May', income: 9200, expenses: 5200, netSavings: 4000 },
  { month: 'Jun', income: 9350, expenses: 4900, netSavings: 4450 },
  { month: 'Jul', income: 9450, expenses: 4830, netSavings: 4620 },
];

export const DEMO_CASH_FLOW_BY_DATE_FILTER: Record<DateFilterOption, MonthlyCashFlowPoint[]> = {
  this_month: [
    { month: 'Week 1', income: 2400, expenses: 1200, netSavings: 1200 },
    { month: 'Week 2', income: 2350, expenses: 1150, netSavings: 1200 },
    { month: 'Week 3', income: 2350, expenses: 1280, netSavings: 1070 },
    { month: 'Week 4', income: 2350, expenses: 1200, netSavings: 1150 },
  ],
  last_30_days: [
    { month: 'Day 1-7', income: 2320, expenses: 1250, netSavings: 1070 },
    { month: 'Day 8-14', income: 2320, expenses: 1220, netSavings: 1100 },
    { month: 'Day 15-21', income: 2320, expenses: 1230, netSavings: 1090 },
    { month: 'Day 22-30', income: 2320, expenses: 1220, netSavings: 1100 },
  ],
  quarter_to_date: [
    { month: 'May', income: 9200, expenses: 5200, netSavings: 4000 },
    { month: 'Jun', income: 9350, expenses: 4900, netSavings: 4450 },
    { month: 'Jul', income: 9450, expenses: 4830, netSavings: 4620 },
  ],
  year_to_date: DEMO_MONTHLY_CASH_FLOW,
};

export const DEMO_EXPENSE_CATEGORIES: ExpenseCategoryShare[] = [
  { name: 'Housing & Rent', value: 1850, color: '#8b5cf6', formattedAmount: '$1,850' }, // violet-500
  { name: 'Food & Dining', value: 890, color: '#6366f1', formattedAmount: '$890' },   // indigo-500
  { name: 'Technology & SaaS', value: 680, color: '#38bdf8', formattedAmount: '$680' }, // sky-400
  { name: 'Transportation', value: 520, color: '#ec4899', formattedAmount: '$520' },    // pink-500
  { name: 'Entertainment & Leisure', value: 460, color: '#f59e0b', formattedAmount: '$460' }, // amber-500
  { name: 'Utilities & Bills', value: 430, color: '#10b981', formattedAmount: '$430' },  // emerald-500
];

export const DEMO_HEALTH_METRICS: FinancialHealthMetrics = {
  score: 86,
  rating: 'Exceptional',
  savingsRatePercentage: 38.6,
  runwayMonths: 6.8,
  debtToIncomeRatio: 14.2,
  monthlySavingsTargetMet: true,
  actionableInsights: [
    {
      id: 'tip-1',
      title: 'Optimize Subscription Overlap',
      description: 'You have 4 active streaming services totaling $74/mo. Consolidating could save $38/mo.',
      impact: 'medium',
      category: 'Subscriptions',
    },
    {
      id: 'tip-2',
      title: 'High-Yield Cash Allocation',
      description: 'Moving $10,000 from checking to a 4.8% APY cash reserve generates ~$480/yr risk-free.',
      impact: 'high',
      category: 'Savings',
    },
    {
      id: 'tip-3',
      title: 'Dining Budget Velocity',
      description: 'Dining spend is tracking 8% lower than June. You are on pace for a record savings month.',
      impact: 'low',
      category: 'Budgeting',
    },
  ],
};

export const DEMO_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Emergency Fund (6 Months)',
    description: 'Liquid cash reserve for unexpected living expenses & medical emergencies',
    category: 'Emergency Fund',
    targetAmount: 25000,
    targetAmountInCents: 2500000,
    currentAmount: 21500,
    currentAmountInCents: 2150000,
    remainingAmount: 3500,
    remainingAmountInCents: 350000,
    progressPercentage: 86.0,
    currency: 'USD',
    startDate: '2026-01-01',
    deadline: '2026-12-31',
    status: 'in_progress',
    priority: 'urgent',
    color: '#8b5cf6',
    iconName: 'Shield',
    milestones: [
      { percentage: 25, achievedAt: '2026-03-15' },
      { percentage: 50, achievedAt: '2026-06-20' },
      { percentage: 75, achievedAt: '2026-09-30' },
    ],
    healthStatus: 'ahead',
    daysRemaining: 56,
    totalDays: 365,
    daysElapsed: 309,
    requiredMonthlySavings: 1750,
    requiredDailySavings: 62.5,
    averageMonthlyContribution: 2150,
    contributionCount: 5,
    isDemoRecord: true,
  },
  {
    id: 'goal-2',
    name: 'Home Down Payment',
    description: '20% down payment fund for future urban residential property acquisition',
    category: 'Real Estate',
    targetAmount: 60000,
    targetAmountInCents: 6000000,
    currentAmount: 32000,
    currentAmountInCents: 3200000,
    remainingAmount: 28000,
    remainingAmountInCents: 2800000,
    progressPercentage: 53.3,
    currency: 'USD',
    startDate: '2025-06-01',
    deadline: '2027-09-30',
    status: 'in_progress',
    priority: 'high',
    color: '#6366f1',
    iconName: 'Home',
    milestones: [
      { percentage: 25, achievedAt: '2025-12-10' },
      { percentage: 50, achievedAt: '2026-08-15' },
    ],
    healthStatus: 'on_track',
    daysRemaining: 329,
    totalDays: 851,
    daysElapsed: 522,
    requiredMonthlySavings: 2545,
    requiredDailySavings: 85.1,
    averageMonthlyContribution: 1882,
    contributionCount: 3,
    isDemoRecord: true,
  },
  {
    id: 'goal-3',
    name: 'Electric Vehicle Fund',
    description: 'Custom order reserve for next-gen dual motor EV performance vehicle',
    category: 'Vehicle',
    targetAmount: 18000,
    targetAmountInCents: 1800000,
    currentAmount: 11400,
    currentAmountInCents: 1140000,
    remainingAmount: 6600,
    remainingAmountInCents: 660000,
    progressPercentage: 63.3,
    currency: 'USD',
    startDate: '2026-01-15',
    deadline: '2027-08-31',
    status: 'in_progress',
    priority: 'medium',
    color: '#38bdf8',
    iconName: 'Zap',
    milestones: [
      { percentage: 25, achievedAt: '2026-04-12' },
      { percentage: 50, achievedAt: '2026-08-28' },
    ],
    healthStatus: 'on_track',
    daysRemaining: 299,
    totalDays: 593,
    daysElapsed: 294,
    requiredMonthlySavings: 660,
    requiredDailySavings: 22.0,
    averageMonthlyContribution: 1163,
    contributionCount: 2,
    isDemoRecord: true,
  },
  {
    id: 'goal-4',
    name: 'Alps Summer Expedition',
    description: 'Guided high-altitude alpine traverse and mountaineering equipment',
    category: 'Vacation & Travel',
    targetAmount: 4500,
    targetAmountInCents: 450000,
    currentAmount: 3900,
    currentAmountInCents: 390000,
    remainingAmount: 600,
    remainingAmountInCents: 60000,
    progressPercentage: 86.7,
    currency: 'USD',
    startDate: '2026-02-01',
    deadline: '2027-07-31',
    status: 'in_progress',
    priority: 'medium',
    color: '#10b981',
    iconName: 'Compass',
    milestones: [
      { percentage: 25, achievedAt: '2026-04-01' },
      { percentage: 50, achievedAt: '2026-06-15' },
      { percentage: 75, achievedAt: '2026-09-10' },
    ],
    healthStatus: 'ahead',
    daysRemaining: 268,
    totalDays: 546,
    daysElapsed: 278,
    requiredMonthlySavings: 67,
    requiredDailySavings: 2.2,
    averageMonthlyContribution: 425,
    contributionCount: 2,
    isDemoRecord: true,
  },
];

export const DEMO_GOAL_CONTRIBUTIONS: Record<string, GoalContribution[]> = {
  'goal-1': [
    { id: 'gc-101', goalId: 'goal-1', amount: 1500, type: 'deposit', contributionDate: '2026-10-25', notes: 'October recurring allocation' },
    { id: 'gc-102', goalId: 'goal-1', amount: 2000, type: 'deposit', contributionDate: '2026-09-28', notes: 'Quarterly bonus deposit' },
    { id: 'gc-103', goalId: 'goal-1', amount: 1200, type: 'deposit', contributionDate: '2026-08-30', notes: 'Monthly payroll transfer' },
    { id: 'gc-104', goalId: 'goal-1', amount: 500, type: 'withdrawal', contributionDate: '2026-08-10', notes: 'Minor appliance replacement' },
    { id: 'gc-105', goalId: 'goal-1', amount: 1500, type: 'deposit', contributionDate: '2026-07-28', notes: 'Monthly payroll transfer' },
  ],
  'goal-2': [
    { id: 'gc-201', goalId: 'goal-2', amount: 2500, type: 'deposit', contributionDate: '2026-10-20', notes: 'Real estate savings transfer' },
    { id: 'gc-202', goalId: 'goal-2', amount: 2500, type: 'deposit', contributionDate: '2026-09-20', notes: 'Monthly allocation' },
    { id: 'gc-203', goalId: 'goal-2', amount: 5000, type: 'deposit', contributionDate: '2026-08-15', notes: 'Stock option distribution' },
  ],
  'goal-3': [
    { id: 'gc-301', goalId: 'goal-3', amount: 1200, type: 'deposit', contributionDate: '2026-10-15', notes: 'EV down payment savings' },
    { id: 'gc-302', goalId: 'goal-3', amount: 1000, type: 'deposit', contributionDate: '2026-09-15', notes: 'Monthly transfer' },
  ],
  'goal-4': [
    { id: 'gc-401', goalId: 'goal-4', amount: 500, type: 'deposit', contributionDate: '2026-10-10', notes: 'Gear & mountain guide deposit' },
    { id: 'gc-402', goalId: 'goal-4', amount: 800, type: 'deposit', contributionDate: '2026-09-05', notes: 'Flight fund installment' },
  ],
};

export const DEMO_SAVINGS_OVERVIEW: SavingsOverview = {
  totalTargetAmount: 107500,
  totalSavedAmount: 68800,
  totalRemainingAmount: 38700,
  overallProgressPercentage: 64.0,
  activeGoalsCount: 4,
  completedGoalsCount: 0,
  totalMonthlyRequiredSavings: 5022,
  monthlySavingsCapacity: 5850,
  netSavingsPaceRatio: 1.16,
  recommendations: [
    {
      id: 'rec-1',
      type: 'feasibility',
      title: 'Sustainable Funding Trajectory',
      description: 'Your monthly cash flow capacity ($5,850/mo) safely covers your combined goal savings pace ($5,022/mo).',
      suggestedAction: 'Maintain current budget allocations to reach all milestones on schedule.',
      priority: 'low',
    },
    {
      id: 'rec-2',
      goalId: 'goal-1',
      goalName: 'Emergency Fund (6 Months)',
      type: 'milestone',
      title: 'Milestone in Reach: Emergency Fund',
      description: 'You are only $3,500 away from achieving 100% full funding for your 6-month safety net.',
      suggestedAction: 'Consider allocating November bonus to achieve complete financial peace of mind.',
      impactAmount: 3500,
      priority: 'high',
    },
    {
      id: 'rec-3',
      goalId: 'goal-4',
      goalName: 'Alps Summer Expedition',
      type: 'acceleration',
      title: 'Expedition Fund Ahead of Schedule',
      description: 'You have funded 86.7% of this goal with 268 days remaining.',
      suggestedAction: 'Lock in early booking discounts on alpine huts and equipment.',
      priority: 'medium',
    },
  ],
  topGoals: DEMO_SAVINGS_GOALS,
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    title: 'Enterprise Tech Payroll',
    category: 'Salary & Earnings',
    date: 'Today, 09:30 AM',
    amount: 4725.0,
    type: 'income',
    status: 'completed',
    account: 'Chase Premier Checking (...4821)',
    merchant: 'Anthropic Global Corp',
    isDemoRecord: true,
  },
  {
    id: 'tx-102',
    title: 'Whole Foods Market',
    category: 'Food & Dining',
    date: 'Yesterday, 06:15 PM',
    amount: 142.85,
    type: 'expense',
    status: 'completed',
    account: 'Apple Card (...1092)',
    merchant: 'Whole Foods Market',
    isDemoRecord: true,
  },
  {
    id: 'tx-103',
    title: 'AWS Cloud Services',
    category: 'Technology & SaaS',
    date: 'Nov 03, 2026',
    amount: 128.4,
    type: 'expense',
    status: 'completed',
    account: 'Chase Business Visa (...8812)',
    merchant: 'Amazon Web Services',
    isDemoRecord: true,
  },
  {
    id: 'tx-104',
    title: 'Vanguard Dividend Payment',
    category: 'Investments & Dividends',
    date: 'Nov 02, 2026',
    amount: 384.5,
    type: 'income',
    status: 'completed',
    account: 'Vanguard Brokerage (...9934)',
    merchant: 'Vanguard Group Inc',
    isDemoRecord: true,
  },
  {
    id: 'tx-105',
    title: 'Equinox Luxury Fitness',
    category: 'Healthcare & Wellness',
    date: 'Nov 01, 2026',
    amount: 280.0,
    type: 'expense',
    status: 'completed',
    account: 'Amex Platinum (...7710)',
    merchant: 'Equinox Holdings',
    isDemoRecord: true,
  },
  {
    id: 'tx-106',
    title: 'Metro Loft Residence',
    category: 'Housing & Rent',
    date: 'Nov 01, 2026',
    amount: 1850.0,
    type: 'expense',
    status: 'completed',
    account: 'Chase Premier Checking (...4821)',
    merchant: 'AvalonBay Communities',
    isDemoRecord: true,
  },
  {
    id: 'tx-107',
    title: 'Uber Black Ride',
    category: 'Transportation',
    date: 'Oct 30, 2026',
    amount: 48.2,
    type: 'expense',
    status: 'completed',
    account: 'Apple Card (...1092)',
    merchant: 'Uber Technologies',
    isDemoRecord: true,
  },
  {
    id: 'tx-108',
    title: 'Blue Bottle Coffee',
    category: 'Food & Dining',
    date: 'Oct 29, 2026',
    amount: 14.5,
    type: 'expense',
    status: 'completed',
    account: 'Apple Card (...1092)',
    merchant: 'Blue Bottle Coffee Inc',
    isDemoRecord: true,
  },
  {
    id: 'tx-109',
    title: 'GitHub Copilot Enterprise',
    category: 'Technology & SaaS',
    date: 'Oct 28, 2026',
    amount: 39.0,
    type: 'expense',
    status: 'completed',
    account: 'Chase Business Visa (...8812)',
    merchant: 'GitHub Inc',
    isDemoRecord: true,
  },
  {
    id: 'tx-110',
    title: 'Tesla Supercharging Network',
    category: 'Transportation',
    date: 'Oct 27, 2026',
    amount: 22.8,
    type: 'expense',
    status: 'completed',
    account: 'Apple Card (...1092)',
    merchant: 'Tesla Motors Inc',
    isDemoRecord: true,
  },
];

export const DEMO_BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'b-1', category: 'Housing & Rent', allocatedAmount: 2000, spentAmount: 1850, color: '#8b5cf6' },
  { id: 'b-2', category: 'Food & Dining', allocatedAmount: 1100, spentAmount: 890, color: '#6366f1' },
  { id: 'b-3', category: 'Technology & SaaS', allocatedAmount: 750, spentAmount: 680, color: '#38bdf8' },
  { id: 'b-4', category: 'Transportation', allocatedAmount: 600, spentAmount: 520, color: '#ec4899' },
  { id: 'b-5', category: 'Entertainment & Leisure', allocatedAmount: 500, spentAmount: 460, color: '#f59e0b' },
  { id: 'b-6', category: 'Utilities & Bills', allocatedAmount: 500, spentAmount: 430, color: '#10b981' },
];

export const DEMO_BUDGETS: Budget[] = [
  {
    id: 'demo-b-1',
    name: 'Housing & Rent Cap',
    period: 'monthly',
    category: 'Housing & Rent',
    limit: 2200,
    currency: 'USD',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    alertThresholds: [50, 75, 90, 100],
    isActive: true,
    actualSpent: 1850,
    remaining: 350,
    utilizationPercentage: 84.1,
    status: 'warning',
    transactionCount: 1,
    isDemoRecord: true,
  },
  {
    id: 'demo-b-2',
    name: 'Groceries & Dining Limit',
    period: 'monthly',
    category: 'Food & Dining',
    limit: 1100,
    currency: 'USD',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    alertThresholds: [50, 75, 90, 100],
    isActive: true,
    actualSpent: 742.85,
    remaining: 357.15,
    utilizationPercentage: 67.5,
    status: 'moderate',
    transactionCount: 3,
    isDemoRecord: true,
  },
  {
    id: 'demo-b-3',
    name: 'Cloud Software & SaaS',
    period: 'monthly',
    category: 'Technology & SaaS',
    limit: 650,
    currency: 'USD',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    alertThresholds: [50, 75, 90, 100],
    isActive: true,
    actualSpent: 599.0,
    remaining: 51.0,
    utilizationPercentage: 92.2,
    status: 'critical',
    transactionCount: 4,
    isDemoRecord: true,
  },
  {
    id: 'demo-b-4',
    name: 'Metro & Supercharging',
    period: 'monthly',
    category: 'Transportation',
    limit: 450,
    currency: 'USD',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    alertThresholds: [50, 75, 90, 100],
    isActive: true,
    actualSpent: 312.8,
    remaining: 137.2,
    utilizationPercentage: 69.5,
    status: 'moderate',
    transactionCount: 2,
    isDemoRecord: true,
  },
  {
    id: 'demo-b-5',
    name: 'Entertainment & Outings',
    period: 'monthly',
    category: 'Entertainment & Leisure',
    limit: 400,
    currency: 'USD',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    alertThresholds: [50, 75, 90, 100],
    isActive: true,
    actualSpent: 420.0,
    remaining: -20.0,
    utilizationPercentage: 105.0,
    status: 'exceeded',
    transactionCount: 3,
    isDemoRecord: true,
  },
  {
    id: 'demo-b-6',
    name: 'Utilities & Fiber Internet',
    period: 'monthly',
    category: 'Utilities & Bills',
    limit: 350,
    currency: 'USD',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    alertThresholds: [50, 75, 90, 100],
    isActive: true,
    actualSpent: 185.0,
    remaining: 165.0,
    utilizationPercentage: 52.9,
    status: 'moderate',
    transactionCount: 2,
    isDemoRecord: true,
  },
  {
    id: 'demo-b-7',
    name: 'Annual Travel & Vacation Fund',
    period: 'yearly',
    category: 'Entertainment & Leisure',
    limit: 5000,
    currency: 'USD',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    alertThresholds: [50, 75, 90, 100],
    isActive: true,
    actualSpent: 2150.0,
    remaining: 2850.0,
    utilizationPercentage: 43.0,
    status: 'normal',
    transactionCount: 5,
    isDemoRecord: true,
  },
];

export const enrichDemoBudgetsWithTransactions = (
  budgets: Budget[],
  transactions: Transaction[]
): Budget[] => {
  return budgets.map((b) => {
    const matching = transactions.filter((t) => {
      const isExp = t.type === 'expense';
      const isCat = t.category.toLowerCase() === b.category.toLowerCase();
      return isExp && isCat;
    });

    const actualSpent = matching.reduce((acc, t) => acc + t.amount, 0);
    const remaining = b.limit - actualSpent;
    const utilizationPercentage = b.limit > 0 ? Math.round((actualSpent / b.limit) * 1000) / 10 : 0;

    let status: BudgetStatus = 'normal';
    if (utilizationPercentage >= 100) status = 'exceeded';
    else if (utilizationPercentage >= 90) status = 'critical';
    else if (utilizationPercentage >= 75) status = 'warning';
    else if (utilizationPercentage >= 50) status = 'moderate';

    const alerts: BudgetAlert[] = [];
    if (utilizationPercentage >= 50) {
      alerts.push({
        budgetId: b.id,
        budgetName: b.name,
        category: b.category,
        threshold:
          utilizationPercentage >= 100
            ? 100
            : utilizationPercentage >= 90
            ? 90
            : utilizationPercentage >= 75
            ? 75
            : 50,
        level: status,
        message:
          utilizationPercentage >= 100
            ? `Budget for "${b.category}" exceeded by $${Math.abs(remaining).toFixed(2)}.`
            : `Budget for "${b.category}" has reached ${Math.round(utilizationPercentage)}% ($${remaining.toFixed(2)} remaining).`,
        utilizationPercentage,
        limit: b.limit,
        actualSpent: Math.round(actualSpent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      ...b,
      actualSpent: Math.round(actualSpent * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      utilizationPercentage,
      status,
      transactionCount: matching.length,
      alerts,
    };
  });
};

export const DEMO_BILL_PAYMENTS: BillPaymentItem[] = [
  {
    id: 'bill-1',
    title: 'High-Speed Fiber Internet',
    biller: 'AT&T Fiber 1Gbps',
    amount: 85.0,
    dueDate: 'Nov 12, 2026',
    isAutoPay: true,
    status: 'upcoming',
    category: 'Utilities',
  },
  {
    id: 'bill-2',
    title: 'Clean Energy Utility',
    biller: 'Pacific Gas & Electric',
    amount: 142.3,
    dueDate: 'Nov 16, 2026',
    isAutoPay: true,
    status: 'upcoming',
    category: 'Utilities',
  },
  {
    id: 'bill-3',
    title: 'Cybersecurity Cloud VPN',
    biller: 'Nord Security Corp',
    amount: 12.99,
    dueDate: 'Nov 20, 2026',
    isAutoPay: true,
    status: 'upcoming',
    category: 'Technology',
  },
  {
    id: 'bill-4',
    title: 'Health & Dental Premium',
    biller: 'Blue Shield California',
    amount: 340.0,
    dueDate: 'Nov 28, 2026',
    isAutoPay: false,
    status: 'upcoming',
    category: 'Healthcare',
  },
];

export const DEMO_AI_SUGGESTED_QUESTIONS = [
  'How much can I safely save this month?',
  'Analyze my dining & groceries spending',
  'What is my runway if income drops 15%?',
  'Am I on track for my Home Down Payment goal?',
];

export const DEMO_AI_PRECOMPUTED_ANSWERS: Record<string, string> = {
  'How much can I safely save this month?':
    'Based on your monthly income of $9,450.00 and average recurring expenses of $4,830.25, you have $4,619.75 in projected net cash flow. After allocating $1,500 across your active goals (Emergency Fund and Down Payment), you can safely allocate **$3,119.75** directly to discretionary savings or index fund investments.',
  'Analyze my dining & groceries spending':
    'Your dining and food expenditures currently total **$890.00** this month (18.4% of total expenses), which is 8% lower than your 3-month trailing average of $968. You have $210.00 remaining in your $1,100 dining budget, putting you in an optimal savings trajectory.',
  'What is my runway if income drops 15%?':
    'With your current liquid reserves of **$54,820.50** and essential monthly burn rate of ~$3,950, your baseline runway is **13.8 months**. A 15% decrease in income reduces monthly net cash flow from +$4,620 to +$3,200, which means your cash reserve remains non-depleting without dipping into principal.',
  'Am I on track for my Home Down Payment goal?':
    'Yes! You have reached **$32,000 of your $60,000 target** (53.3% completion). At your current contribution velocity of $1,200/month, you are projected to reach $60,000 by May 2028, 4 months ahead of your Q3 2027 milestone.',
};
