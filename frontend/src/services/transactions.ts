import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQueryParams,
  PaginationData,
  TransactionSummary,
  DateFilterOption,
} from '../types/finance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

class TransactionService {
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
   * Helper to format transaction document from backend to frontend interface
   */
  private formatTransaction(raw: any): Transaction {
    const dateStr = raw.transactionDate
      ? new Date(raw.transactionDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : raw.date || 'Today';

    return {
      ...raw,
      date: dateStr,
      isDemoRecord: false,
    };
  }

  /**
   * Fetch paginated list of transactions
   */
  async getTransactions(
    params: TransactionQueryParams = {}
  ): Promise<{ transactions: Transaction[]; pagination: PaginationData }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.dateFilter) query.append('dateFilter', params.dateFilter);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await this.request<{
      transactions: any[];
      pagination: PaginationData;
    }>(`/api/transactions${queryString}`, { method: 'GET' });

    return {
      transactions: (res.transactions || []).map((t) => this.formatTransaction(t)),
      pagination: res.pagination,
    };
  }

  /**
   * Get single transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction> {
    const res = await this.request<any>(`/api/transactions/${id}`, { method: 'GET' });
    return this.formatTransaction(res);
  }

  /**
   * Create a new transaction
   */
  async createTransaction(payload: CreateTransactionInput): Promise<Transaction> {
    const res = await this.request<any>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return this.formatTransaction(res);
  }

  /**
   * Update an existing transaction
   */
  async updateTransaction(id: string, payload: UpdateTransactionInput): Promise<Transaction> {
    const res = await this.request<any>(`/api/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return this.formatTransaction(res);
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(id: string): Promise<void> {
    await this.request<null>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get financial calculation summary for date filter
   */
  async getTransactionSummary(
    dateFilter: DateFilterOption = 'this_month',
    startDate?: string,
    endDate?: string
  ): Promise<TransactionSummary> {
    const query = new URLSearchParams();
    query.append('dateFilter', dateFilter);
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);

    return this.request<TransactionSummary>(`/api/transactions/summary?${query.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * Get all distinct categories
   */
  async getCategories(): Promise<string[]> {
    const res = await this.request<{ categories: string[] }>('/api/transactions/categories', {
      method: 'GET',
    });
    return res.categories || [];
  }
}

export const transactionService = new TransactionService();
