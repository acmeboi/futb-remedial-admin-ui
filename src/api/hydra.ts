import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { clearAuthData, isTokenExpired } from '../lib/authUtils';
import { API_BASE_URL } from '../lib/constants';
import { normalizeHydraResponse } from '../lib/hydraUtils';

export interface HydraCollection<T> {
  '@context': string;
  '@id': string;
  '@type': 'hydra:Collection';
  'hydra:member': T[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    '@type': string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:previous'?: string;
    'hydra:next'?: string;
  };
}

export interface HydraItem {
  '@context': string;
  '@id': string;
  '@type': string;
  [key: string]: any;
}

class HydraClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      
      // Check if token is expired before using it
      if (token) {
        if (isTokenExpired(token)) {
          // Token expired, clear it
          clearAuthData();
          return Promise.reject(new Error('Token expired'));
        }
        
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    });

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Attempt token refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry original request
            const token = localStorage.getItem('access_token');
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client.request(originalRequest);
          }
          
          // Redirect to login if refresh fails
          clearAuthData();
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await axios.post(`${this.baseURL}/token/refresh`, {
        refresh_token: refreshToken,
      });
      
      if (response.data.token) {
        localStorage.setItem('access_token', response.data.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getCollection<T>(endpoint: string, params?: Record<string, any>): Promise<HydraCollection<T>> {
    const response = await this.client.get(endpoint, { params });
    const data = response.data;
    
    // Normalize the response to ensure consistent format
    const normalized = normalizeHydraResponse<T>(data) as HydraCollection<T>;
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.log(`[HydraClient] GET ${endpoint}`, {
        params,
        originalKeys: data ? Object.keys(data) : [],
        hasMembers: !!(normalized['hydra:member']),
        memberCount: normalized['hydra:member']?.length || 0,
        totalItems: normalized['hydra:totalItems'] || 0,
        originalData: data, // Log original response
        normalizedData: normalized, // Log normalized response
      });
    }
    
    return normalized;
  }

  async getItem<T>(endpoint: string): Promise<T & HydraItem> {
    const response = await this.client.get(endpoint);
    return response.data;
  }

  async post<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T & HydraItem> {
    const response = await this.client.post(endpoint, data, config);
    return response.data;
  }

  async patch<T>(endpoint: string, data: any): Promise<T & HydraItem> {
    // PATCH requests require application/merge-patch+json Content-Type
    const response = await this.client.patch(endpoint, data, {
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/ld+json',
      },
    });
    return response.data;
  }

  async delete(endpoint: string): Promise<void> {
    await this.client.delete(endpoint);
  }
}

export const hydraClient = new HydraClient(API_BASE_URL);

