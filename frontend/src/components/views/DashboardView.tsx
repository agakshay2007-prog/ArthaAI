import React from 'react';
import { MetricCards } from '../dashboard/MetricCards';
import { FinancialCharts } from '../dashboard/FinancialCharts';
import { FinancialHealthCard } from '../dashboard/FinancialHealthCard';
import { SavingsGoalsCard } from '../dashboard/SavingsGoalsCard';
import { RecentTransactionsCard } from '../dashboard/RecentTransactionsCard';
import { AIAssistantCard } from '../dashboard/AIAssistantCard';
import { BudgetOverviewCard } from '../dashboard/BudgetOverviewCard';
import { UpcomingBillsCard } from '../dashboard/UpcomingBillsCard';
import {
  Transaction,
  DateFilterOption,
  SavingsGoal,
  MonthlyCashFlowPoint,
  CategoryExpenseBreakdown,
} from '../../types/finance';
import { Budget, BudgetOverview } from '../../types/budget';
import { Bill, BillOverview } from '../../types/bill';
import { DEMO_FINANCIAL_SUMMARY } from '../../data/mockFinanceData';

interface DashboardViewProps {
  transactions: Transaction[];
  summary: typeof DEMO_FINANCIAL_SUMMARY;
  dateFilter: DateFilterOption;
  goals?: SavingsGoal[];
  budgets?: Budget[];
  budgetOverview?: BudgetOverview | null;
  onViewAllTransactions: () => void;
  onOpenNewGoal: () => void;
  onNavigateToBudgets?: () => void;
  onNavigateToSavings?: () => void;
  bills?: Bill[];
  billsOverview?: BillOverview | null;
  onNavigateToBills?: () => void;
  onQuickPayBill?: (bill: Bill) => void;
  isLive?: boolean;
  cashFlow?: MonthlyCashFlowPoint[];
  categoryBreakdown?: CategoryExpenseBreakdown[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  summary,
  dateFilter,
  goals,
  budgets = [],
  budgetOverview = null,
  onViewAllTransactions,
  onOpenNewGoal,
  onNavigateToBudgets = () => {},
  onNavigateToSavings = () => {},
  bills = [],
  billsOverview = null,
  onNavigateToBills = () => {},
  onQuickPayBill = () => {},
  isLive = false,
  cashFlow,
  categoryBreakdown,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Metric Overview Cards */}
      <MetricCards summary={summary} />

      {/* 2. Financial Analytics Charts (Area + Donut) */}
      <FinancialCharts
        dateFilter={dateFilter}
        cashFlow={cashFlow}
        categoryBreakdown={categoryBreakdown}
      />

      {/* 3. Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Transactions & Savings Goals */}
        <div className="space-y-6">
          <RecentTransactionsCard
            transactions={transactions}
            onViewAll={onViewAllTransactions}
            isLive={isLive}
          />
          <SavingsGoalsCard
            goals={goals}
            onOpenNewGoal={onOpenNewGoal}
            onNavigateToSavings={onNavigateToSavings}
          />
        </div>

        {/* Right Column: Budget Discipline, Financial Health & AI Assistant */}
        <div className="space-y-6">
          <BudgetOverviewCard
            overview={budgetOverview}
            budgets={budgets}
            onNavigateToBudgets={onNavigateToBudgets}
          />
          <UpcomingBillsCard
            bills={bills}
            overview={billsOverview}
            onNavigateToBills={onNavigateToBills}
            onQuickPay={onQuickPayBill}
          />
          <FinancialHealthCard />
          <AIAssistantCard />
        </div>
      </div>
    </div>
  );
};
