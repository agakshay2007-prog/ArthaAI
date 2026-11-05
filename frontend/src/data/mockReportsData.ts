import { ComprehensiveFinancialReport, ReportFilterPreset } from '../types/reports';

export function getDemoFinancialReport(preset: ReportFilterPreset = 'this_month'): ComprehensiveFinancialReport {
  const isAnnual = preset === 'this_year' || preset === 'last_year';
  const isQuarterly = preset === 'this_quarter' || preset === 'last_quarter';
  const multiplier = isAnnual ? 12 : isQuarterly ? 3 : 1;

  const baseIncome = 9450 * multiplier;
  const baseExpenses = 4830 * multiplier;
  const baseNet = baseIncome - baseExpenses;
  const savingsRate = Math.round((baseNet / baseIncome) * 100);

  const prevIncome = (9000 + Math.random() * 200) * multiplier;
  const prevExpenses = (4950 + Math.random() * 100) * multiplier;
  const prevNet = prevIncome - prevExpenses;
  const prevSavingsRate = Math.round((prevNet / prevIncome) * 100);

  const periodLabelMap: Record<ReportFilterPreset, { label: string; prevLabel: string; type: 'monthly' | 'quarterly' | 'annual' | 'custom' }> = {
    this_month: { label: 'March 2026', prevLabel: 'February 2026', type: 'monthly' },
    last_month: { label: 'February 2026', prevLabel: 'January 2026', type: 'monthly' },
    this_quarter: { label: 'Q1 2026', prevLabel: 'Q4 2025', type: 'quarterly' },
    last_quarter: { label: 'Q4 2025', prevLabel: 'Q3 2025', type: 'quarterly' },
    this_year: { label: 'FY 2026', prevLabel: 'FY 2025', type: 'annual' },
    last_year: { label: 'FY 2025', prevLabel: 'FY 2024', type: 'annual' },
    custom: { label: 'Custom Period', prevLabel: 'Prior Period', type: 'custom' },
  };

  const periodMeta = periodLabelMap[preset] || periodLabelMap.this_month;

  return {
    period: {
      type: periodMeta.type,
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T23:59:59.999Z',
      label: periodMeta.label,
      currency: 'USD',
      generatedAt: new Date().toISOString(),
    },
    summary: {
      totalIncome: baseIncome,
      totalExpenses: baseExpenses,
      netCashFlow: baseNet,
      savingsRatePercentage: savingsRate,
      transactionCount: 38 * multiplier,
      incomeTransactionCount: 4 * multiplier,
      expenseTransactionCount: 34 * multiplier,
      highestSpendingCategory: {
        category: 'Housing & Rent',
        amount: 1850 * multiplier,
        percentage: Math.round(((1850 * multiplier) / baseExpenses) * 100),
      },
      lowestSpendingCategory: {
        category: 'Utilities & Bills',
        amount: 430 * multiplier,
      },
      budgetUtilization: {
        totalLimit: 5200 * multiplier,
        totalSpent: baseExpenses,
        utilizationPercentage: Math.round((baseExpenses / (5200 * multiplier)) * 100),
        activeBudgetCount: 6,
        exceededCount: 0,
      },
      savingsProgress: {
        totalSaved: 32150,
        totalTarget: 75000,
        overallProgressPercentage: 43,
        periodContributions: 1250 * multiplier,
      },
      billsSummary: {
        totalPaidInPeriod: 1420 * multiplier,
        pendingCommitments: 280,
        overdueCount: 0,
        overdueAmount: 0,
      },
      netWorthNote: 'Net worth unavailable — additional asset and liability information is required.',
    },
    comparison: {
      income: {
        current: baseIncome,
        previous: prevIncome,
        delta: baseIncome - prevIncome,
        percentageChange: Number((((baseIncome - prevIncome) / prevIncome) * 100).toFixed(1)),
      },
      expenses: {
        current: baseExpenses,
        previous: prevExpenses,
        delta: baseExpenses - prevExpenses,
        percentageChange: Number((((baseExpenses - prevExpenses) / prevExpenses) * 100).toFixed(1)),
      },
      netCashFlow: {
        current: baseNet,
        previous: prevNet,
        delta: baseNet - prevNet,
        percentageChange: Number((((baseNet - prevNet) / prevNet) * 100).toFixed(1)),
      },
      savingsRate: {
        current: savingsRate,
        previous: prevSavingsRate,
        delta: savingsRate - prevSavingsRate,
        percentageChange: Number((((savingsRate - prevSavingsRate) / prevSavingsRate) * 100).toFixed(1)),
      },
      previousPeriodLabel: periodMeta.prevLabel,
    },
    categories: [
      {
        category: 'Housing & Rent',
        amount: 1850 * multiplier,
        percentage: 38.3,
        transactionCount: 1 * multiplier,
        previousAmount: 1850 * multiplier,
        changePercentage: 0,
      },
      {
        category: 'Food & Dining',
        amount: 890 * multiplier,
        percentage: 18.4,
        transactionCount: 14 * multiplier,
        previousAmount: 940 * multiplier,
        changePercentage: -5.3,
      },
      {
        category: 'Technology & SaaS',
        amount: 680 * multiplier,
        percentage: 14.1,
        transactionCount: 6 * multiplier,
        previousAmount: 620 * multiplier,
        changePercentage: 9.7,
      },
      {
        category: 'Transportation',
        amount: 520 * multiplier,
        percentage: 10.8,
        transactionCount: 5 * multiplier,
        previousAmount: 560 * multiplier,
        changePercentage: -7.1,
      },
      {
        category: 'Entertainment',
        amount: 460 * multiplier,
        percentage: 9.5,
        transactionCount: 4 * multiplier,
        previousAmount: 510 * multiplier,
        changePercentage: -9.8,
      },
      {
        category: 'Utilities & Bills',
        amount: 430 * multiplier,
        percentage: 8.9,
        transactionCount: 4 * multiplier,
        previousAmount: 470 * multiplier,
        changePercentage: -8.5,
      },
    ],
    cashFlowTrend: isAnnual
      ? [
          { date: 'Jan', income: 8400, expenses: 5100, netCashFlow: 3300 },
          { date: 'Feb', income: 8600, expenses: 4950, netCashFlow: 3650 },
          { date: 'Mar', income: 8900, expenses: 5400, netCashFlow: 3500 },
          { date: 'Apr', income: 9100, expenses: 4700, netCashFlow: 4400 },
          { date: 'May', income: 9200, expenses: 5200, netCashFlow: 4000 },
          { date: 'Jun', income: 9350, expenses: 4900, netCashFlow: 4450 },
          { date: 'Jul', income: 9450, expenses: 4830, netCashFlow: 4620 },
        ]
      : isQuarterly
      ? [
          { date: 'Month 1', income: 9100, expenses: 4700, netCashFlow: 4400 },
          { date: 'Month 2', income: 9200, expenses: 5200, netCashFlow: 4000 },
          { date: 'Month 3', income: 9450, expenses: 4830, netCashFlow: 4620 },
        ]
      : [
          { date: 'Week 1', income: 2400, expenses: 1200, netCashFlow: 1200 },
          { date: 'Week 2', income: 2350, expenses: 1150, netCashFlow: 1200 },
          { date: 'Week 3', income: 2350, expenses: 1280, netCashFlow: 1070 },
          { date: 'Week 4', income: 2350, expenses: 1200, netCashFlow: 1150 },
        ],
    budgetPerformance: [
      {
        name: 'Housing & Accommodation',
        category: 'Housing',
        limit: 2000 * multiplier,
        spent: 1850 * multiplier,
        remaining: 150 * multiplier,
        utilizationPercentage: 92,
        status: 'healthy',
      },
      {
        name: 'Dining & Provisions',
        category: 'Dining',
        limit: 1000 * multiplier,
        spent: 890 * multiplier,
        remaining: 110 * multiplier,
        utilizationPercentage: 89,
        status: 'warning',
      },
      {
        name: 'Cloud & Developer Tooling',
        category: 'Software',
        limit: 800 * multiplier,
        spent: 680 * multiplier,
        remaining: 120 * multiplier,
        utilizationPercentage: 85,
        status: 'healthy',
      },
      {
        name: 'Commute & Travel',
        category: 'Transportation',
        limit: 600 * multiplier,
        spent: 520 * multiplier,
        remaining: 80 * multiplier,
        utilizationPercentage: 86,
        status: 'healthy',
      },
      {
        name: 'Entertainment & Recharging',
        category: 'Entertainment',
        limit: 500 * multiplier,
        spent: 460 * multiplier,
        remaining: 40 * multiplier,
        utilizationPercentage: 92,
        status: 'warning',
      },
    ],
    savingsPerformance: [
      {
        name: 'Emergency Buffer Fund',
        category: 'Safety Net',
        targetAmount: 25000,
        currentAmount: 18500,
        progressPercentage: 74,
        periodContributions: 500 * multiplier,
        status: 'on_track',
      },
      {
        name: 'Index Fund Investment',
        category: 'Wealth Growth',
        targetAmount: 30000,
        currentAmount: 10200,
        progressPercentage: 34,
        periodContributions: 500 * multiplier,
        status: 'on_track',
      },
      {
        name: 'Workspace Hardware Upgrade',
        category: 'Capital Equipment',
        targetAmount: 5000,
        currentAmount: 3450,
        progressPercentage: 69,
        periodContributions: 250 * multiplier,
        status: 'on_track',
      },
    ],
    billsAnalysis: [
      {
        name: 'Fiber Broadband High-Speed',
        category: 'Utilities',
        amount: 85,
        dueDate: '2026-03-12',
        frequency: 'monthly',
        status: 'paid',
        paymentStatus: 'paid',
      },
      {
        name: 'Cloud Infrastructure Cluster',
        category: 'Technology',
        amount: 145,
        dueDate: '2026-03-15',
        frequency: 'monthly',
        status: 'paid',
        paymentStatus: 'paid',
      },
      {
        name: 'Health & Dental Premium',
        category: 'Insurance',
        amount: 220,
        dueDate: '2026-03-25',
        frequency: 'monthly',
        status: 'pending',
        paymentStatus: 'pending',
      },
    ],
    aiAnalysis:
      'Executive Financial Evaluation: Cash-flow generation remains stable with strong positive operational surplus across this reporting interval. Operational burn rate is disciplined across core overheads, with discretionary spend contained under established budgetary limits. Allocation toward high-yield savings assets meets your target threshold.',
  };
}

