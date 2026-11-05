import {
  Transaction,
  ExpenseCategoryShare,
  MonthlyCashFlowPoint,
  SavingsGoal,
  FinancialHealthMetrics,
  BudgetCategory,
  BillPaymentItem,
  DateFilterOption,
} from '../types/finance';

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
    targetAmount: 25000,
    currentAmount: 21500,
    deadline: 'Dec 2026',
    category: 'Safety Net',
    color: '#8b5cf6',
    iconName: 'Shield',
    isDemoRecord: true,
  },
  {
    id: 'goal-2',
    name: 'Home Down Payment',
    targetAmount: 60000,
    currentAmount: 32000,
    deadline: 'Q3 2027',
    category: 'Real Estate',
    color: '#6366f1',
    iconName: 'Home',
    isDemoRecord: true,
  },
  {
    id: 'goal-3',
    name: 'Electric Vehicle Fund',
    targetAmount: 18000,
    currentAmount: 11400,
    deadline: 'Aug 2027',
    category: 'Automotive',
    color: '#38bdf8',
    iconName: 'Zap',
    isDemoRecord: true,
  },
  {
    id: 'goal-4',
    name: 'Alps Summer Expedition',
    targetAmount: 4500,
    currentAmount: 3900,
    deadline: 'Jul 2027',
    category: 'Travel',
    color: '#10b981',
    iconName: 'Compass',
    isDemoRecord: true,
  },
];

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
