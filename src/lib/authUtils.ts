/**
 * Authentication utility functions
 */

/**
 * Decode JWT token without verification (for client-side expiry check)
 */
export function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expiryTime = decoded.exp * 1000;
  const now = Date.now();
  
  // Add 5 second buffer to account for clock skew
  return now >= (expiryTime - 5000);
}

/**
 * Check if token exists and is valid
 */
export function isTokenValid(): boolean {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  return !isTokenExpired(token);
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  // Clear any other auth-related data
  sessionStorage.clear();
}

