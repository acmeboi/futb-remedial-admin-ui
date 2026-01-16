import { API_BASE_URL } from './constants';

/**
 * Get full URL for a file path
 * Handles both absolute URLs and relative paths
 */
export function getFileUrl(path?: string | null): string {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove /api from base URL for file serving
  const baseUrl = API_BASE_URL.replace('/api', '');
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Get API resource IRI for Hydra format
 */
export function getResourceIri(resource: string, id?: string | number): string {
  const baseUrl = API_BASE_URL;
  if (id) {
    return `${baseUrl}/${resource}/${id}`;
  }
  return `${baseUrl}/${resource}`;
}

