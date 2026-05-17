// src/lib/api-client.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
    if (response.url.includes('/api/v1/auth/refresh')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isOnboarded');
        window.location.href = '/login';
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Session expired.');
    }

    if (typeof window !== 'undefined') {
      const hasSession = localStorage.getItem('user') || localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (hasSession && refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const newAccessToken = refreshData.data?.accessToken || refreshData.accessToken;
            if (newAccessToken) {
              localStorage.setItem('token', newAccessToken);
              if (requestFn) {
                const retriedResponse = await requestFn();
                return handleResponse<T>(retriedResponse);
              }
            }
          }
        } catch (refreshErr) {
          console.error('Error refreshing token:', refreshErr);
        }

        // If refresh fails, clear session and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isOnboarded');
        window.location.href = '/login';
        // Return a never-resolving promise — the page is navigating away
        return new Promise(() => { }) as Promise<T>;
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
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

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

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
      cache: 'no-store',
      ...options,
      method: 'GET',
      headers: this.getHeaders(options),
    });
    const response = await execute();
    return handleResponse<T>(response, execute);
  },

  async post<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
    const execute = () => fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
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
      headers: this.getHeaders(options),
    });
    const response = await execute();
    return handleResponse<T>(response, execute);
  },
};

