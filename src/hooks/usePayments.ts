import { useQuery } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import type { Payment } from '../lib/types';

export function usePayments(params?: {
  page?: number;
  itemsPerPage?: number;
}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      const queryParams: Record<string, any> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.itemsPerPage) queryParams.itemsPerPage = params.itemsPerPage;
      
      return hydraClient.getCollection<Payment>('/payments', queryParams);
    },
  });
}

export function usePayment(id: string | number) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => hydraClient.getItem<Payment>(`/payments/${id}`),
    enabled: !!id,
  });
}

