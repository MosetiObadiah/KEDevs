// src/lib/api-client.ts
// Auth tokens are now httpOnly cookies — the browser sends them automatically.
// All fetch calls include credentials: 'include' so cookies cross the origin boundary.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

async function handleResponse<T>(response: Response, requestFn?: () => Promise<Response>): Promise<T> {
  if (response.status === 401 || response.status === 403) {
    // If the refresh endpoint itself returned 401/403, the session is fully expired.
    if (response.url.includes('/api/v1/auth/refresh')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('isOnboarded');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Session expired.');
    }

    // Otherwise attempt a silent token refresh.
    // No body needed — the browser sends the refresh_token cookie automatically.
    if (typeof window !== 'undefined') {
      const hasSession = !!localStorage.getItem('user');
      if (hasSession) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshResponse.ok && requestFn) {
            // New access_token cookie set by server — retry original request
            const retriedResponse = await requestFn();
            return handleResponse<T>(retriedResponse);
          }
        } catch (refreshErr) {
          console.error('Error refreshing token:', refreshErr);
        }

        // Refresh failed — clear local state and redirect
        localStorage.removeItem('user');
        localStorage.removeItem('isOnboarded');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Session expired. Redirecting to login.')) as Promise<T>;
      } else {
        // No session stored locally, meaning the user is already logged out.
        // Don't try to refresh, just redirect if they are on a protected route
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && !window.location.pathname.startsWith('/onboarding') && window.location.pathname !== '/') {
           window.location.href = '/login';
        }
        return Promise.reject(new Error('Unauthorized.'));
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    (error as any).data = errorData?.data;
    (error as any).status = response.status;
    throw error;
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'success' in data && data.success === false) {
    throw new Error(data.message || 'API reported a failure despite 200 status');
  }

  return data;
}

export const apiClient = {
  getHeaders(options: RequestInit = {}, body?: any): HeadersInit {
    const headers: Record<string, string> = {};
    // No Authorization header — access_token cookie is sent automatically via credentials: 'include'
    const contentType = options.headers && (options.headers as any)['Content-Type'];
    if (!contentType && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    return {
      ...headers,
      ...options.headers,
    };
  },

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const execute = () => fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      credentials: 'include',
      headers: this.getHeaders(options),
    });
    const response = await execute();
    return handleResponse<T>(response, execute);
  },

  async post<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    const execute = () => fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      credentials: 'include',
      headers: this.getHeaders(options, body),
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    const response = await execute();
    return handleResponse<T>(response, execute);
  },

  async put<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    const execute = () => fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      credentials: 'include',
      headers: this.getHeaders(options, body),
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    const response = await execute();
    return handleResponse<T>(response, execute);
  },

  async patch<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    const execute = () => fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PATCH',
      credentials: 'include',
      headers: this.getHeaders(options, body),
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    const response = await execute();
    return handleResponse<T>(response, execute);
  },

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const execute = () => fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      credentials: 'include',
      headers: this.getHeaders(options),
    });
    const response = await execute();
    return handleResponse<T>(response, execute);
  },
};
