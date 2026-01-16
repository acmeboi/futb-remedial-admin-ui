export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://remedialapi.futb.edu.ng/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Remedial Portal Admin';

export const APPLICATION_STATUSES = [
  'PENDING',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
] as const;

export const PAYMENT_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
] as const;

export const GENDERS = ['male', 'female', 'other'] as const;

