export type GoalCategory =
  | 'Emergency Fund'
  | 'Real Estate & Housing'
  | 'Vehicle & Auto'
  | 'Travel & Adventure'
  | 'Retirement & Wealth'
  | 'Education'
  | 'Investments'
  | 'Tech & Gadgets'
  | 'Family & Life'
  | 'Other';

export type GoalStatus = 'in_progress' | 'completed' | 'paused' | 'cancelled';
export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';
export type GoalHealthStatus = 'ahead' | 'on_track' | 'behind' | 'at_risk' | 'completed';

export interface GoalMilestone {
  percentage: number;
  achievedAt: string;
}

export interface GoalContribution {
  id: string;
  userId?: string;
  goalId: string;
  amount: number;
  amountInCents?: number;
  type: 'deposit' | 'withdrawal';
  contributionDate: string;
  notes?: string;
  transactionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavingsGoal {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  category: GoalCategory | string;
  targetAmount: number;
  targetAmountInCents?: number;
  currentAmount: number;
  currentAmountInCents?: number;
  remainingAmount: number;
  remainingAmountInCents?: number;
  progressPercentage: number;
  currency: string;
  startDate: string;
  deadline: string;
  status: GoalStatus;
  priority: GoalPriority;
  color: string;
  iconName: string;
  completedAt?: string;
  milestones: GoalMilestone[];
  healthStatus: GoalHealthStatus;
  daysRemaining: number;
  totalDays: number;
  daysElapsed: number;
  requiredMonthlySavings: number;
  requiredDailySavings: number;
  averageMonthlyContribution: number;
  projectedCompletionDate?: string;
  contributionCount?: number;
  recentContributions?: GoalContribution[];
  isDemoRecord?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalInput {
  name: string;
  description?: string;
  category: string;
  targetAmount: number;
  currentAmount?: number;
  deadline: string;
  startDate?: string;
  priority?: GoalPriority;
  color?: string;
  iconName?: string;
  currency?: string;
}

export interface UpdateGoalInput {
  name?: string;
  description?: string;
  category?: string;
  targetAmount?: number;
  deadline?: string;
  priority?: GoalPriority;
  status?: GoalStatus;
  color?: string;
  iconName?: string;
}

export interface AddContributionInput {
  amount: number;
  type: 'deposit' | 'withdrawal';
  notes?: string;
  contributionDate?: string;
  transactionId?: string;
}

export interface SavingsRecommendation {
  id: string;
  goalId?: string;
  goalName?: string;
  type: 'acceleration' | 'feasibility' | 'milestone' | 'warning' | 'optimization';
  title: string;
  description: string;
  suggestedAction: string;
  impactAmount?: number;
  priority: 'low' | 'medium' | 'high';
}

export interface SavingsOverview {
  totalTargetAmount: number;
  totalSavedAmount: number;
  totalRemainingAmount: number;
  overallProgressPercentage: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  totalMonthlyRequiredSavings: number;
  monthlySavingsCapacity: number;
  netSavingsPaceRatio: number;
  recommendations: SavingsRecommendation[];
  topGoals: SavingsGoal[];
}

export interface GoalAnalytics {
  goal: SavingsGoal;
  contributionTimeline: {
    date: string;
    amount: number;
    cumulativeSaved: number;
    targetProgress: number;
  }[];
  monthlyRunRate: {
    month: string;
    contributed: number;
    targetMonthly: number;
  }[];
  velocity: {
    dailyAverage: number;
    monthlyAverage: number;
    monthsRemaining: number;
    projectedMonthsToFinish: number;
    isFeasibleByDeadline: boolean;
    deficitOrSurplusPace: number;
  };
  milestonesStatus: {
    percentage: number;
    isAchieved: boolean;
    achievedAt?: string;
  }[];
}
