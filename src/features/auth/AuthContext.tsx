import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../../api/client';
import type { User } from '../../lib/types';
import { isTokenValid, isTokenExpired, clearAuthData, decodeJWT } from '../../lib/authUtils';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('access_token');
    
    // Check if token exists and is valid (not expired)
    if (token && isTokenValid()) {
      loadUser();
    } else {
      // Token is missing or expired, clear it and set loading to false
      if (token) {
        clearAuthData();
      }
      setIsLoading(false);
    }

    // Set up interval to check token expiry every minute
    const expiryCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem('access_token');
      if (currentToken && isTokenExpired(currentToken)) {
        // Token expired, logout
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(expiryCheckInterval);
  }, []);

  async function loadUser() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || !isTokenValid()) {
        clearAuthData();
        setIsLoading(false);
        return;
      }

      // Decode JWT to get user info
      const payload = decodeJWT(token);
      if (payload) {
        setUser({
          id: payload.id || 0,
          email: payload.username || payload.email || '',
          roles: payload.roles || [],
        });
      }
      setIsLoading(false);
    } catch {
      clearAuthData();
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await apiClient.post('/login', { email, password });
    const { access_token, refresh_token, id, email: userEmail, roles, info } = response.data;
    
    localStorage.setItem('access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
    
    setUser({ 
      id, 
      email: userEmail, 
      roles: roles || [],
      info: info || undefined,
    });
  }

  function logout() {
    clearAuthData();
    setUser(null);
    // Redirect will be handled by ProtectedRoute
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

