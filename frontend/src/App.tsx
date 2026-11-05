import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { EditTransactionModal } from './components/modals/EditTransactionModal';
import { DeleteTransactionModal } from './components/modals/DeleteTransactionModal';
import { AddGoalModal } from './components/modals/AddGoalModal';
import { SystemStatusModal } from './components/modals/SystemStatusModal';
import {
  NavigationTab,
  DateFilterOption,
  Transaction,
  SavingsGoal,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionSummary,
} from './types/finance';
import {
  DEMO_TRANSACTIONS,
  DEMO_SAVINGS_GOALS,
  DEMO_SUMMARIES_BY_DATE_FILTER,
  DEMO_FINANCIAL_SUMMARY,
} from './data/mockFinanceData';
import { transactionService } from './services/transactions';

const MainDashboardLayout: React.FC = () => {
  const { user, isGuestMode } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('this_month');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isEditTxOpen, setIsEditTxOpen] = useState(false);
  const [isDeleteTxOpen, setIsDeleteTxOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Live transactions & summary state
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [liveSummary, setLiveSummary] = useState<TransactionSummary | null>(null);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [dbUnconfiguredWarning, setDbUnconfiguredWarning] = useState(false);

  // Live savings goals state
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(DEMO_SAVINGS_GOALS);

  // Fetch live transactions and summary when user is authenticated (not guest mode)
  const fetchLedger = useCallback(async () => {
    if (isGuestMode) {
      setDbUnconfiguredWarning(false);
      return;
    }

    setIsLoadingTx(true);
    try {
      const [txRes, summaryRes] = await Promise.all([
        transactionService.getTransactions({ dateFilter }),
        transactionService.getTransactionSummary(dateFilter),
      ]);

      setTransactions(txRes.transactions);
      setLiveSummary(summaryRes);
      setDbUnconfiguredWarning(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Database is unconfigured') || msg.includes('503')) {
        setDbUnconfiguredWarning(true);
      }
    } finally {
      setIsLoadingTx(false);
    }
  }, [isGuestMode, dateFilter]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // Dynamically compute financial summary based on period, live summary or demo data
  const dynamicSummary = useMemo(() => {
    if (liveSummary && !isGuestMode && !dbUnconfiguredWarning) {
      const initials = user?.fullName
        ? user.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'AM';

      return {
        totalBalance: liveSummary.netBalance,
        monthlyIncome: liveSummary.totalIncome,
        monthlyExpenses: liveSummary.totalExpenses,
        totalSavings: liveSummary.totalSavings,
        balanceChangePercentage: 4.8,
        incomeChangePercentage: 2.1,
        expensesChangePercentage: -5.4,
        savingsRatePercentage: liveSummary.savingsRatePercentage,
        currencySymbol: '$',
        currencyCode: 'USD',
        userProfile: {
          name: user?.fullName || 'Alex Morgan',
          email: user?.email || 'alex.morgan@artha.ai',
          tier: 'ArthaAI Pro',
          avatarInitials: initials,
        },
      };
    }

    // Guest demo mode dynamic calculation
    const base = DEMO_SUMMARIES_BY_DATE_FILTER[dateFilter] || DEMO_FINANCIAL_SUMMARY;
    const userAdded = transactions.filter((t) => !t.id.startsWith('tx-1'));
    const addedIncome = userAdded.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const addedExpense = userAdded.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    return {
      ...base,
      totalBalance: base.totalBalance + addedIncome - addedExpense,
      monthlyIncome: base.monthlyIncome + addedIncome,
      monthlyExpenses: base.monthlyExpenses + addedExpense,
      totalSavings: base.totalSavings + Math.max(0, addedIncome - addedExpense),
      userProfile: {
        ...base.userProfile,
        name: user?.fullName || base.userProfile.name,
        email: user?.email || base.userProfile.email,
      },
    };
  }, [liveSummary, isGuestMode, dbUnconfiguredWarning, transactions, dateFilter, user]);

  // Handle adding a transaction
  const handleAddTransaction = async (input: CreateTransactionInput): Promise<boolean> => {
    if (isGuestMode || dbUnconfiguredWarning) {
      const newTx: Transaction = {
        id: `tx-user-${Date.now()}`,
        title: input.title,
        amount: input.amount,
        type: input.type,
        category: input.category,
        merchant: input.merchant || input.title,
        date: 'Today',
        status: 'completed',
        account: input.account || 'Primary Checking',
        notes: input.notes,
        isDemoRecord: true,
      };
      setTransactions((prev) => [newTx, ...prev]);
      return true;
    }

    try {
      const created = await transactionService.createTransaction(input);
      setTransactions((prev) => [created, ...prev]);
      // Refresh summary
      transactionService.getTransactionSummary(dateFilter).then((s) => setLiveSummary(s)).catch(() => {});
      return true;
    } catch (err: unknown) {
      // If DB error, throw for modal to display
      throw err;
    }
  };

  // Handle updating a transaction
  const handleUpdateTransaction = async (id: string, updates: UpdateTransactionInput): Promise<boolean> => {
    if (isGuestMode || dbUnconfiguredWarning) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      return true;
    }

    try {
      const updated = await transactionService.updateTransaction(id, updates);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      transactionService.getTransactionSummary(dateFilter).then((s) => setLiveSummary(s)).catch(() => {});
      return true;
    } catch {
      return false;
    }
  };

  // Handle deleting a transaction
  const handleDeleteTransaction = async (id: string): Promise<boolean> => {
    if (isGuestMode || dbUnconfiguredWarning) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return true;
    }

    try {
      await transactionService.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      transactionService.getTransactionSummary(dateFilter).then((s) => setLiveSummary(s)).catch(() => {});
      return true;
    } catch {
      return false;
    }
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
            isLive={!isGuestMode && !dbUnconfiguredWarning}
            cashFlow={liveSummary?.monthlyCashFlow}
            categoryBreakdown={liveSummary?.categoryBreakdown}
          />
        );
      case 'transactions':
        return (
          <TransactionsView
            transactions={transactions}
            isLoading={isLoadingTx}
            onOpenAddTransaction={() => setIsAddTxOpen(true)}
            onEditTransaction={(tx) => {
              setSelectedTx(tx);
              setIsEditTxOpen(true);
            }}
            onDeleteTransaction={(tx) => {
              setSelectedTx(tx);
              setIsDeleteTxOpen(true);
            }}
            onRefresh={fetchLedger}
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
            isLive={!isGuestMode && !dbUnconfiguredWarning}
            cashFlow={liveSummary?.monthlyCashFlow}
            categoryBreakdown={liveSummary?.categoryBreakdown}
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
        transactionCount={transactions.length}
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

        {/* Informational banner if backend MongoDB is unconfigured */}
        {dbUnconfiguredWarning && !isGuestMode && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
            <span>
              <strong>Advisory:</strong> MongoDB Atlas is currently unconfigured in <code>backend/.env</code>. Ledger operations are utilizing isolated demo storage.
            </span>
            <button
              onClick={() => setIsSystemStatusOpen(true)}
              className="text-amber-200 underline hover:text-white font-medium"
            >
              View System Status
            </button>
          </div>
        )}

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

      <EditTransactionModal
        isOpen={isEditTxOpen}
        onClose={() => {
          setIsEditTxOpen(false);
          setSelectedTx(null);
        }}
        transaction={selectedTx}
        onUpdateTransaction={handleUpdateTransaction}
      />

      <DeleteTransactionModal
        isOpen={isDeleteTxOpen}
        onClose={() => {
          setIsDeleteTxOpen(false);
          setSelectedTx(null);
        }}
        transaction={selectedTx}
        onConfirmDelete={handleDeleteTransaction}
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
