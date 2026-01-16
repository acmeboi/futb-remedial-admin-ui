/**
 * Utility functions for handling Hydra JSON-LD responses
 */

export interface HydraCollection<T> {
  '@context'?: string;
  '@id'?: string;
  '@type'?: string;
  'hydra:member'?: T[];
  'hydra:totalItems'?: number;
  'hydra:view'?: {
    '@id'?: string;
    '@type'?: string;
    'hydra:first'?: string;
    'hydra:last'?: string;
    'hydra:previous'?: string;
    'hydra:next'?: string;
  };
  [key: string]: any;
}

/**
 * Normalize Hydra response - handles different response formats
 */
export function normalizeHydraResponse<T>(data: any): HydraCollection<T> {
  if (!data) {
    return {
      '@context': '/api/contexts/Collection',
      '@id': '/api',
      '@type': 'hydra:Collection',
      'hydra:member': [],
      'hydra:totalItems': 0,
    };
  }

  // If it's already a proper Hydra collection with hydra: prefix
  if (data['hydra:member'] !== undefined) {
    return data as HydraCollection<T>;
  }

  // Handle simplified Hydra format (without hydra: prefix)
  // API returns: { member: [...], totalItems: 35, view: {...} }
  if (data.member !== undefined && Array.isArray(data.member)) {
    return {
      '@context': data['@context'] || '/api/contexts/Collection',
      '@id': data['@id'] || '/api',
      '@type': data['@type'] || 'hydra:Collection',
      'hydra:member': data.member,
      'hydra:totalItems': data.totalItems || data['hydra:totalItems'] || data.member.length,
      'hydra:view': data.view ? {
        '@id': data.view['@id'],
        '@type': data.view['@type'],
        'hydra:first': data.view.first,
        'hydra:last': data.view.last,
        'hydra:previous': data.view.previous,
        'hydra:next': data.view.next,
      } : data['hydra:view'],
    };
  }

  // If data is an array, wrap it
  if (Array.isArray(data)) {
    return {
      '@context': '/api/contexts/Collection',
      '@id': '/api',
      '@type': 'hydra:Collection',
      'hydra:member': data,
      'hydra:totalItems': data.length,
    };
  }

  // Check for alternative key formats
  const memberKey = Object.keys(data).find(
    (key) => (key.includes('member') || key.includes('items') || key.includes('data')) && Array.isArray(data[key])
  );

  if (memberKey && Array.isArray(data[memberKey])) {
    return {
      '@context': data['@context'] || '/api/contexts/Collection',
      '@id': data['@id'] || '/api',
      '@type': data['@type'] || 'hydra:Collection',
      'hydra:member': data[memberKey],
      'hydra:totalItems': data['hydra:totalItems'] || data['totalItems'] || data[memberKey].length,
      'hydra:view': data['hydra:view'] || data['view'],
    };
  }

  // If it's a single item, wrap it in a collection
  if (data.id || data['@id']) {
    return {
      '@context': data['@context'] || '/api/contexts/Collection',
      '@id': data['@id'] || '/api',
      '@type': 'hydra:Collection',
      'hydra:member': [data],
      'hydra:totalItems': 1,
    };
  }

  // Default: return empty collection
  return {
    '@context': '/api/contexts/Collection',
    '@id': '/api',
    '@type': 'hydra:Collection',
    'hydra:member': [],
    'hydra:totalItems': 0,
  };
}

/**
 * Extract members from Hydra collection
 */
export function getHydraMembers<T>(data: any): T[] {
  const normalized = normalizeHydraResponse<T>(data);
  return normalized['hydra:member'] || [];
}

/**
 * Get total items count from Hydra collection
 */
export function getHydraTotalItems(data: any): number {
  if (!data) return 0;
  return data['hydra:totalItems'] || data['totalItems'] || 0;
}

