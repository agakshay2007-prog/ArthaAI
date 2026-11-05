import React from 'react';
import { MetricCards } from '../dashboard/MetricCards';
import { FinancialCharts } from '../dashboard/FinancialCharts';
import { FinancialHealthCard } from '../dashboard/FinancialHealthCard';
import { SavingsGoalsCard } from '../dashboard/SavingsGoalsCard';
import { RecentTransactionsCard } from '../dashboard/RecentTransactionsCard';
import { AIAssistantCard } from '../dashboard/AIAssistantCard';
import { BudgetOverviewCard } from '../dashboard/BudgetOverviewCard';
import {
  Transaction,
  DateFilterOption,
  SavingsGoal,
  MonthlyCashFlowPoint,
  CategoryExpenseBreakdown,
} from '../../types/finance';
import { Budget, BudgetOverview } from '../../types/budget';
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
          <SavingsGoalsCard goals={goals} onOpenNewGoal={onOpenNewGoal} />
        </div>

        {/* Right Column: Budget Discipline, Financial Health & AI Assistant */}
        <div className="space-y-6">
          <BudgetOverviewCard
            overview={budgetOverview}
            budgets={budgets}
            onNavigateToBudgets={onNavigateToBudgets}
          />
          <FinancialHealthCard />
          <AIAssistantCard />
        </div>
      </div>
    </div>
  );
};
