import {
  SavingsGoal,
  CreateGoalInput,
  UpdateGoalInput,
  AddContributionInput,
  GoalContribution,
  SavingsOverview,
  GoalAnalytics,
  GoalStatus,
} from '../types/savings';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

class SavingsService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      let json: ApiResponse<T>;
      try {
        json = await response.json();
      } catch {
        throw new Error(
          response.ok ? 'Invalid response format from server' : `Server returned status ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(json.message || `Request failed with status ${response.status}`);
      }

      if (json.data === undefined) {
        return (null as unknown) as T;
      }

      return json.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('An unexpected network error occurred');
    }
  }

  /**
   * Retrieves user's savings goals with optional status, category, or search filters
   */
  async getGoals(params?: {
    status?: GoalStatus | 'all';
    category?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ goals: SavingsGoal[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ goals: SavingsGoal[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/savings-goals${qs}`
    );
  }

  /**
   * Retrieves overall portfolio savings metrics, cash flow capacity, and recommendations
   */
  async getSavingsOverview(): Promise<SavingsOverview> {
    return this.request<SavingsOverview>('/api/savings-goals/overview');
  }

  /**
   * Retrieves single savings goal details
   */
  async getGoalById(id: string): Promise<SavingsGoal> {
    return this.request<SavingsGoal>(`/api/savings-goals/${id}`);
  }

  /**
   * Creates a new savings goal
   */
  async createGoal(input: CreateGoalInput): Promise<SavingsGoal> {
    return this.request<SavingsGoal>('/api/savings-goals', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /**
   * Updates an existing savings goal
   */
  async updateGoal(id: string, updates: UpdateGoalInput): Promise<SavingsGoal> {
    return this.request<SavingsGoal>(`/api/savings-goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deletes a savings goal and its contribution ledger.
   * Note: Financial transactions are completely preserved!
   */
  async deleteGoal(id: string): Promise<{ id: string; message: string }> {
    return this.request<{ id: string; message: string }>(`/api/savings-goals/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Records a deposit or withdrawal contribution towards a goal
   */
  async addContribution(
    goalId: string,
    input: AddContributionInput
  ): Promise<{ contribution: GoalContribution; goal: SavingsGoal }> {
    return this.request<{ contribution: GoalContribution; goal: SavingsGoal }>(
      `/api/savings-goals/${goalId}/contributions`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    );
  }

  /**
   * Retrieves paginated contribution history for a goal
   */
  async getGoalContributions(
    goalId: string,
    page = 1,
    limit = 20
  ): Promise<{ contributions: GoalContribution[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    return this.request<{ contributions: GoalContribution[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/api/savings-goals/${goalId}/contributions?page=${page}&limit=${limit}`
    );
  }

  /**
   * Deletes a contribution record and reverts its balance on the goal
   */
  async deleteContribution(goalId: string, contributionId: string): Promise<SavingsGoal> {
    return this.request<SavingsGoal>(`/api/savings-goals/${goalId}/contributions/${contributionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Retrieves predictive velocity modeling, run-rate, and milestone progression
   */
  async getGoalAnalytics(goalId: string): Promise<GoalAnalytics> {
    return this.request<GoalAnalytics>(`/api/savings-goals/${goalId}/analytics`);
  }
}

export const savingsService = new SavingsService();
