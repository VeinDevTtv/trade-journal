interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP ${response.status}`,
          response.status,
          data.details
        );
      }

      if (!data.success) {
        throw new ApiError(
          data.error || 'API request failed',
          response.status,
          data.details
        );
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      const apiError = new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
      
      // Log error for debugging
      console.error('API request failed:', {
        url,
        error,
        options
      });
      
      throw apiError;
    }
  }

  // Authentication methods
  async login(token: string) {
    this.setToken(token);
    return this.getProfile();
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  async checkAuthStatus() {
    return this.request<{ authenticated: boolean; user: any }>('/auth/status');
  }

  // Trades methods
  async getTrades(params: {
    page?: number;
    limit?: number;
    symbol?: string;
    is_win?: boolean;
    account_id?: number;
    date_from?: string;
    date_to?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `/trades${searchParams.toString() ? `?${searchParams}` : ''}`;
    return this.request<PaginatedResponse<any>>(endpoint);
  }

  async getTrade(id: number) {
    return this.request<any>(`/trades/${id}`);
  }

  async createTrade(tradeData: FormData) {
    return this.request<{ id: number }>('/trades', {
      method: 'POST',
      body: tradeData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async updateTrade(id: number, tradeData: FormData) {
    return this.request<any>(`/trades/${id}`, {
      method: 'PUT',
      body: tradeData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async deleteTrade(id: number) {
    return this.request<void>(`/trades/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics methods
  async getAnalytics(params: {
    date_from?: string;
    date_to?: string;
    account_id?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const endpoint = `/analytics${searchParams.toString() ? `?${searchParams}` : ''}`;
    return this.request<any>(endpoint);
  }

  async getAnalyticsSummary() {
    return this.request<any>('/analytics/summary');
  }

  async getCalendarData(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const endpoint = `/analytics/calendar${params.toString() ? `?${params}` : ''}`;
    return this.request<any[]>(endpoint);
  }

  async getPerformanceBySymbol() {
    return this.request<any[]>('/analytics/performance-by-symbol');
  }

  async getRiskMetrics() {
    return this.request<any>('/analytics/risk-metrics');
  }

  // Accounts methods
  async getAccounts() {
    return this.request<any[]>('/accounts');
  }

  async createAccount(accountData: {
    name: string;
    type: string;
    balance: number;
    currency: string;
  }) {
    return this.request<{ id: number }>('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async updateAccount(id: number, accountData: Partial<{
    name: string;
    type: string;
    balance: number;
    currency: string;
    is_active: boolean;
  }>) {
    return this.request<any>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
  }

  async deleteAccount(id: number) {
    return this.request<void>(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings methods
  async getSettings() {
    return this.request<any>('/settings');
  }

  async updateSettings(settings: any) {
    return this.request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async resetSettings() {
    return this.request<any>('/settings/reset', {
      method: 'POST',
    });
  }

  async exportSettings() {
    return this.request<any>('/settings/export');
  }

  async importSettings(settings: any) {
    return this.request<any>('/settings/import', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export types
export type { ApiResponse, PaginatedResponse, ApiError }; 