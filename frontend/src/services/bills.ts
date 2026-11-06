import {
  Bill,
  BillPayment,
  BillOverview,
  BillAnalytics,
  CreateBillInput,
  UpdateBillInput,
  RecordPaymentInput,
} from '../types/bill';
import { buildApiUrl } from './apiConfig';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

interface PaginatedBillsResult {
  bills: Bill[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PaginatedPaymentsResult {
  payments: BillPayment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class BillService {
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
      throw new Error('An unexpected error occurred while processing bills request');
    }
  }

  /**
   * GET /api/bills - Fetch paginated list of bills with filters
   */
  public async getBills(params?: {
    status?: string;
    category?: string;
    frequency?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedBillsResult> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.frequency) query.append('frequency', params.frequency);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return this.request<PaginatedBillsResult>(`/api/bills${qs ? `?${qs}` : ''}`);
  }

  /**
   * GET /api/bills/overview - High-level metrics and reminders
   */
  public async getBillOverview(): Promise<BillOverview> {
    return this.request<BillOverview>('/api/bills/overview');
  }

  /**
   * GET /api/bills/upcoming - Chronological upcoming bills
   */
  public async getUpcomingBills(days = 30): Promise<Bill[]> {
    return this.request<Bill[]>(`/api/bills/upcoming?days=${days}`);
  }

  /**
   * GET /api/bills/:id - Fetch single bill details
   */
  public async getBillById(id: string): Promise<Bill> {
    return this.request<Bill>(`/api/bills/${id}`);
  }

  /**
   * POST /api/bills - Create new bill
   */
  public async createBill(input: CreateBillInput): Promise<Bill> {
    return this.request<Bill>('/api/bills', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /**
   * PATCH /api/bills/:id - Update existing bill
   */
  public async updateBill(id: string, input: UpdateBillInput): Promise<Bill> {
    return this.request<Bill>(`/api/bills/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  /**
   * DELETE /api/bills/:id - Delete or archive bill
   */
  public async deleteBill(id: string, archive = false): Promise<{ id: string }> {
    return this.request<{ id: string }>(`/api/bills/${id}?archive=${archive}`, {
      method: 'DELETE',
    });
  }

  /**
   * POST /api/bills/:id/payments - Record a payment
   */
  public async recordPayment(
    id: string,
    input: RecordPaymentInput
  ): Promise<{ payment: BillPayment; bill: Bill }> {
    return this.request<{ payment: BillPayment; bill: Bill }>(`/api/bills/${id}/payments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /**
   * GET /api/bills/:id/payments - Retrieve paginated payments for bill
   */
  public async getBillPayments(id: string, page = 1, limit = 20): Promise<PaginatedPaymentsResult> {
    return this.request<PaginatedPaymentsResult>(
      `/api/bills/${id}/payments?page=${page}&limit=${limit}`
    );
  }

  /**
   * DELETE /api/bills/:id/payments/:paymentId - Revert a payment
   */
  public async revertPayment(id: string, paymentId: string): Promise<Bill> {
    return this.request<Bill>(`/api/bills/${id}/payments/${paymentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * GET /api/bills/:id/analytics - Retrieve analytics and monthly trend
   */
  public async getBillAnalytics(id: string): Promise<BillAnalytics> {
    return this.request<BillAnalytics>(`/api/bills/${id}/analytics`);
  }
}

export const billService = new BillService();
