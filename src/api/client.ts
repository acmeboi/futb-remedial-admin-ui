import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { clearAuthData, isTokenExpired } from '../lib/authUtils';
import { API_BASE_URL } from '../lib/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Don't add token for login or token refresh endpoints
  const isAuthEndpoint = config.url?.includes('/login') || config.url?.includes('/token/refresh');
  
  if (isAuthEndpoint) {
    return config;
  }
  
  const token = localStorage.getItem('access_token');
  
  // Check if token is expired before using it
  if (token) {
    if (isTokenExpired(token)) {
      // Token expired, clear it and let the response interceptor handle redirect
      clearAuthData();
      return Promise.reject(new Error('Token expired'));
    }
    
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post<{ token: string }>(`${API_BASE_URL}/token/refresh`, {
          refresh_token: refreshToken,
        });
        
        if (response.data.token) {
          localStorage.setItem('access_token', response.data.token);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          }
          return apiClient.request(originalRequest);
        }
      } catch {
        // Clear all auth data and redirect to login
        clearAuthData();
        // Use window.location to force a full page reload and clear React state
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

