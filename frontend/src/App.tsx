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
import { AddBudgetModal } from './components/budgets/AddBudgetModal';
import { EditBudgetModal } from './components/budgets/EditBudgetModal';
import { DeleteBudgetModal } from './components/budgets/DeleteBudgetModal';
import { BudgetAnalyticsModal } from './components/budgets/BudgetAnalyticsModal';
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
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetOverview,
} from './types/budget';
import {
  DEMO_TRANSACTIONS,
  DEMO_SAVINGS_GOALS,
  DEMO_SUMMARIES_BY_DATE_FILTER,
  DEMO_FINANCIAL_SUMMARY,
  DEMO_BUDGETS,
  enrichDemoBudgetsWithTransactions,
} from './data/mockFinanceData';
import { transactionService } from './services/transactions';
import { budgetService } from './services/budgets';

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

  // Budget Modals state
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isDeleteBudgetOpen, setIsDeleteBudgetOpen] = useState(false);
  const [isBudgetAnalyticsOpen, setIsBudgetAnalyticsOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Live transactions & summary state
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [liveSummary, setLiveSummary] = useState<TransactionSummary | null>(null);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [dbUnconfiguredWarning, setDbUnconfiguredWarning] = useState(false);

  // Live savings goals state
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(DEMO_SAVINGS_GOALS);

  // Budgets state
  const [rawBudgets, setRawBudgets] = useState<Budget[]>(DEMO_BUDGETS);
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview | null>(null);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);

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

  // Fetch budgets and overview
  const fetchBudgets = useCallback(async () => {
    if (isGuestMode || dbUnconfiguredWarning) {
      return;
    }

    setIsLoadingBudgets(true);
    try {
      const [budgetsRes, overviewRes] = await Promise.all([
        budgetService.getBudgets(),
        budgetService.getBudgetOverview(),
      ]);
      setRawBudgets(budgetsRes.budgets);
      setBudgetOverview(overviewRes);
    } catch {
      // Degrade gracefully
    } finally {
      setIsLoadingBudgets(false);
    }
  }, [isGuestMode, dbUnconfiguredWarning]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Compute enriched budgets dynamically (for guest mode or local live sync)
  const budgets = useMemo(() => {
    if (isGuestMode || dbUnconfiguredWarning) {
      return enrichDemoBudgetsWithTransactions(rawBudgets, transactions);
    }
    return rawBudgets;
  }, [rawBudgets, transactions, isGuestMode, dbUnconfiguredWarning]);

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
        date: new Date().toISOString(),
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
      transactionService.getTransactionSummary(dateFilter).then((s) => setLiveSummary(s)).catch(() => {});
      fetchBudgets();
      return true;
    } catch (err: unknown) {
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
      fetchBudgets();
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
      fetchBudgets();
      return true;
    } catch {
      return false;
    }
  };

  // Handle adding a budget
  const handleAddBudget = async (input: CreateBudgetInput): Promise<boolean> => {
    if (isGuestMode || dbUnconfiguredWarning) {
      const newBudget: Budget = {
        id: `bgt-user-${Date.now()}`,
        name: input.name,
        category: input.category,
        period: input.period,
        limit: input.limit,
        limitInCents: Math.round(input.limit * 100),
        currency: input.currency || 'USD',
        startDate: input.startDate,
        endDate: input.endDate,
        alertThresholds: input.alertThresholds || [50, 75, 90, 100],
        isActive: true,
        actualSpent: 0,
        actualSpentInCents: 0,
        remaining: input.limit,
        remainingInCents: Math.round(input.limit * 100),
        utilizationPercentage: 0,
        status: 'normal',
        description: input.description,
        isDemoRecord: true,
      };
      setRawBudgets((prev) => [newBudget, ...prev]);
      return true;
    }

    try {
      const created = await budgetService.createBudget(input);
      setRawBudgets((prev) => [created, ...prev]);
      budgetService.getBudgetOverview().then((o) => setBudgetOverview(o)).catch(() => {});
      return true;
    } catch (err: unknown) {
      throw err;
    }
  };

  // Handle updating a budget
  const handleUpdateBudget = async (id: string, updates: UpdateBudgetInput): Promise<boolean> => {
    if (isGuestMode || dbUnconfiguredWarning) {
      setRawBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
      return true;
    }

    try {
      const updated = await budgetService.updateBudget(id, updates);
      setRawBudgets((prev) => prev.map((b) => (b.id === id ? updated : b)));
      budgetService.getBudgetOverview().then((o) => setBudgetOverview(o)).catch(() => {});
      return true;
    } catch {
      return false;
    }
  };

  // Handle deleting a budget
  const handleDeleteBudget = async (id: string): Promise<boolean> => {
    if (isGuestMode || dbUnconfiguredWarning) {
      setRawBudgets((prev) => prev.filter((b) => b.id !== id));
      return true;
    }

    try {
      await budgetService.deleteBudget(id);
      setRawBudgets((prev) => prev.filter((b) => b.id !== id));
      budgetService.getBudgetOverview().then((o) => setBudgetOverview(o)).catch(() => {});
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
            budgets={budgets}
            budgetOverview={budgetOverview}
            onViewAllTransactions={() => setCurrentTab('transactions')}
            onOpenNewGoal={() => setIsAddGoalOpen(true)}
            onNavigateToBudgets={() => setCurrentTab('budgeting')}
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
        return (
          <BudgetingView
            budgets={budgets}
            overview={budgetOverview}
            isLoading={isLoadingBudgets}
            onOpenAddBudget={() => setIsAddBudgetOpen(true)}
            onEditBudget={(b) => {
              setSelectedBudget(b);
              setIsEditBudgetOpen(true);
            }}
            onDeleteBudget={(b) => {
              setSelectedBudget(b);
              setIsDeleteBudgetOpen(true);
            }}
            onViewAnalytics={(b) => {
              setSelectedBudget(b);
              setIsBudgetAnalyticsOpen(true);
            }}
            onRefresh={fetchBudgets}
          />
        );
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
            budgets={budgets}
            budgetOverview={budgetOverview}
            onViewAllTransactions={() => setCurrentTab('transactions')}
            onOpenNewGoal={() => setIsAddGoalOpen(true)}
            onNavigateToBudgets={() => setCurrentTab('budgeting')}
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

      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        onAddBudget={handleAddBudget}
      />

      <EditBudgetModal
        isOpen={isEditBudgetOpen}
        budget={selectedBudget}
        onClose={() => {
          setIsEditBudgetOpen(false);
          setSelectedBudget(null);
        }}
        onUpdateBudget={handleUpdateBudget}
      />

      <DeleteBudgetModal
        isOpen={isDeleteBudgetOpen}
        budget={selectedBudget}
        onClose={() => {
          setIsDeleteBudgetOpen(false);
          setSelectedBudget(null);
        }}
        onConfirmDelete={handleDeleteBudget}
      />

      <BudgetAnalyticsModal
        isOpen={isBudgetAnalyticsOpen}
        budget={selectedBudget}
        transactions={transactions}
        onClose={() => {
          setIsBudgetAnalyticsOpen(false);
          setSelectedBudget(null);
        }}
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
