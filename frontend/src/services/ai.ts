import {
  ChatResponse,
  AIConversationSummary,
  AIConversationDetail,
  FinancialInsightsData,
  FinancialContextStatus,
} from '../types/ai';
import { buildApiUrl } from './apiConfig';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

class AIService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = buildApiUrl(endpoint);
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Includes HttpOnly cookies
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data.data as T;
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('Network error. Unable to connect to ArthaAI backend service.');
      }
      throw err;
    }
  }

  /**
   * Send financial query to AI assistant
   */
  public async sendMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }

  /**
   * Fetch paginated list of AI conversations
   */
  public async getConversations(
    page = 1,
    limit = 10
  ): Promise<{
    conversations: AIConversationSummary[];
    pagination: { total: number; page: number; limit: number; totalPages: number; hasMore: boolean };
  }> {
    return this.request<{
      conversations: AIConversationSummary[];
      pagination: { total: number; page: number; limit: number; totalPages: number; hasMore: boolean };
    }>(`/api/ai/conversations?page=${page}&limit=${limit}`);
  }

  /**
   * Get specific conversation by ID
   */
  public async getConversation(id: string): Promise<AIConversationDetail> {
    return this.request<AIConversationDetail>(`/api/ai/conversations/${id}`);
  }

  /**
   * Delete specific conversation
   */
  public async deleteConversation(id: string): Promise<void> {
    await this.request<void>(`/api/ai/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Clear all AI conversation history for authenticated user
   */
  public async clearAllConversations(): Promise<void> {
    await this.request<void>('/api/ai/conversations', {
      method: 'DELETE',
    });
  }

  /**
   * Retrieve calculated deterministic financial insights
   */
  public async getFinancialInsights(): Promise<FinancialInsightsData> {
    return this.request<FinancialInsightsData>('/api/ai/insights');
  }

  /**
   * Retrieve financial context module status
   */
  public async getContextStatus(): Promise<FinancialContextStatus> {
    return this.request<FinancialContextStatus>('/api/ai/context');
  }
}

export const aiService = new AIService();
