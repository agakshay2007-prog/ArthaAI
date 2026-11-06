import {
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetOverview,
  BudgetAnalytics,
  BudgetPeriod,
} from '../types/budget';
import { buildApiUrl } from './apiConfig';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

class BudgetService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = buildApiUrl(endpoint);
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
   * Fetch paginated user budgets with spending & alert calculations
   */
  async getBudgets(params: {
    period?: BudgetPeriod;
    category?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ budgets: Budget[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params.period) query.append('period', params.period);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.isActive !== undefined) query.append('isActive', String(params.isActive));
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{
      budgets: Budget[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/api/budgets${queryString}`, { method: 'GET' });
  }

  /**
   * Retrieve budget overview metrics across active budgets
   */
  async getBudgetOverview(period?: BudgetPeriod): Promise<BudgetOverview> {
    const query = period ? `?period=${period}` : '';
    return this.request<BudgetOverview>(`/api/budgets/overview${query}`, { method: 'GET' });
  }

  /**
   * Retrieve historical and completed budgets
   */
  async getBudgetHistory(params: { page?: number; limit?: number } = {}): Promise<{
    budgets: Budget[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{
      budgets: Budget[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/api/budgets/history${queryString}`, { method: 'GET' });
  }

  /**
   * Retrieve single budget by ID with calculated metrics
   */
  async getBudgetById(id: string): Promise<Budget> {
    return this.request<Budget>(`/api/budgets/${id}`, { method: 'GET' });
  }

  /**
   * Retrieve spending velocity and daily trend analytics for a budget
   */
  async getBudgetAnalytics(id: string): Promise<BudgetAnalytics> {
    return this.request<BudgetAnalytics>(`/api/budgets/${id}/analytics`, { method: 'GET' });
  }

  /**
   * Create a new budget
   */
  async createBudget(payload: CreateBudgetInput): Promise<Budget> {
    return this.request<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Update an existing budget
   */
  async updateBudget(id: string, payload: UpdateBudgetInput): Promise<Budget> {
    return this.request<Budget>(`/api/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Delete a budget (preserves transactions)
   */
  async deleteBudget(id: string): Promise<void> {
    await this.request<null>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  }
}

export const budgetService = new BudgetService();
