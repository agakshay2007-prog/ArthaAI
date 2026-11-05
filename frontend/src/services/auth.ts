import {
  User,
  RegisterPayload,
  LoginPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  AuthResponse,
  AuthSuccessData,
} from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class AuthService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<AuthResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Include HttpOnly cookies in CORS/same-site requests
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      let responseData: AuthResponse<T>;
      try {
        responseData = await response.json();
      } catch {
        responseData = {
          success: false,
          message: response.ok ? 'Unexpected response format' : `Server returned status ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }

      if (!response.ok) {
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }

      return responseData;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('An unexpected network error occurred');
    }
  }

  /**
   * Register a new user account
   */
  async register(payload: RegisterPayload): Promise<AuthResponse<AuthSuccessData>> {
    return this.request<AuthSuccessData>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Authenticate user with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse<AuthSuccessData>> {
    return this.request<AuthSuccessData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Clear session and log out
   */
  async logout(): Promise<AuthResponse<null>> {
    return this.request<null>('/api/auth/logout', {
      method: 'POST',
    });
  }

  /**
   * Fetch current authenticated user session
   */
  async getMe(): Promise<AuthResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/auth/me', {
      method: 'GET',
    });
  }

  /**
   * Update current user profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Change current user password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<AuthResponse<null>> {
    return this.request<null>('/api/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }
}

export const authService = new AuthService();
