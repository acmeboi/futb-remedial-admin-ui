import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import type { Applicant } from '../lib/types';

export function useApplicants(params?: {
  page?: number;
  itemsPerPage?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['applicants', params],
    queryFn: async () => {
      const queryParams: Record<string, any> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.itemsPerPage) queryParams.itemsPerPage = params.itemsPerPage;
      if (params?.search) queryParams.search = params.search;
      
      return hydraClient.getCollection<Applicant>('/applicants', queryParams);
    },
  });
}

export function useApplicant(id: string | number) {
  return useQuery({
    queryKey: ['applicant', id],
    queryFn: () => hydraClient.getItem<Applicant>(`/applicants/${id}`),
    enabled: !!id,
  });
}

export function useCreateApplicant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Applicant>) => 
      hydraClient.post<Applicant>('/applicants', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
    },
  });
}

export function useUpdateApplicant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Applicant> }) =>
      hydraClient.patch<Applicant>(`/applicants/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applicant', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
    },
  });
}

