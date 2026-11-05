import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { BudgetingView } from './components/views/BudgetingView';
import { SavingsGoalsView } from './components/views/SavingsGoalsView';
import { BillsPaymentsView } from './components/views/BillsPaymentsView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { ReportsAnalyticsView } from './components/views/ReportsAnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { AddGoalModal } from './components/modals/AddGoalModal';
import { SystemStatusModal } from './components/modals/SystemStatusModal';
import { NavigationTab, DateFilterOption, Transaction, SavingsGoal } from './types/finance';
import {
  DEMO_TRANSACTIONS,
  DEMO_SAVINGS_GOALS,
  DEMO_SUMMARIES_BY_DATE_FILTER,
  DEMO_FINANCIAL_SUMMARY,
} from './data/mockFinanceData';

const MainDashboardLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('this_month');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Live transactions ledger state
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);

  // Live savings goals state
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(DEMO_SAVINGS_GOALS);

  // Dynamically compute financial summary based on selected period & added transactions
  const dynamicSummary = useMemo(() => {
    const base = DEMO_SUMMARIES_BY_DATE_FILTER[dateFilter] || DEMO_FINANCIAL_SUMMARY;
    // Calculate delta from user-added transactions
    const userAdded = transactions.filter((t) => !t.id.startsWith('tx-1'));
    const addedIncome = userAdded.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const addedExpense = userAdded.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    return {
      ...base,
      totalBalance: base.totalBalance + addedIncome - addedExpense,
      monthlyIncome: base.monthlyIncome + addedIncome,
      monthlyExpenses: base.monthlyExpenses + addedExpense,
      totalSavings: base.totalSavings + Math.max(0, addedIncome - addedExpense),
    };
  }, [dateFilter, transactions]);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleAddGoal = (newGoal: SavingsGoal) => {
    setSavingsGoals((prev) => [newGoal, ...prev]);
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            transactions={transactions}
            summary={dynamicSummary}
            dateFilter={dateFilter}
            goals={savingsGoals}
            onViewAllTransactions={() => setCurrentTab('transactions')}
            onOpenNewGoal={() => setIsAddGoalOpen(true)}
          />
        );
      case 'transactions':
        return (
          <TransactionsView
            transactions={transactions}
            onOpenAddTransaction={() => setIsAddTxOpen(true)}
          />
        );
      case 'budgeting':
        return <BudgetingView />;
      case 'savings':
        return (
          <SavingsGoalsView
            goals={savingsGoals}
            onOpenNewGoal={() => setIsAddGoalOpen(true)}
          />
        );
      case 'bills':
        return <BillsPaymentsView />;
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'settings':
        return (
          <SettingsView
            onOpenSystemStatus={() => setIsSystemStatusOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        );
      default:
        return (
          <DashboardView
            transactions={transactions}
            summary={dynamicSummary}
            dateFilter={dateFilter}
            goals={savingsGoals}
            onViewAllTransactions={() => setCurrentTab('transactions')}
            onOpenNewGoal={() => setIsAddGoalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950 text-slate-100 font-sans">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsedDesktop={isCollapsedDesktop}
        onToggleCollapseDesktop={() => setIsCollapsedDesktop(!isCollapsedDesktop)}
        onOpenSystemStatus={() => setIsSystemStatusOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
          dateFilter={dateFilter}
          onChangeDateFilter={(df) => setDateFilter(df)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* View Content Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAddGoal={handleAddGoal}
      />

      <SystemStatusModal
        isOpen={isSystemStatusOpen}
        onClose={() => setIsSystemStatusOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-glow-violet animate-pulse">
          <span className="font-extrabold text-white text-xl">A</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Securing session credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? (
          <LoginView
            onSwitchToRegister={() => setAuthView('register')}
            onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
          />
        ) : (
          <RegisterView
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />
      </>
    );
  }

  return <MainDashboardLayout />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
