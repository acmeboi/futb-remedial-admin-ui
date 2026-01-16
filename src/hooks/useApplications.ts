import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import type { Application } from '../lib/types';

export function useApplications(params?: {
  page?: number;
  itemsPerPage?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: async () => {
      const queryParams: Record<string, any> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.itemsPerPage) queryParams.itemsPerPage = params.itemsPerPage;
      if (params?.status) queryParams.status = params.status;
      
      return hydraClient.getCollection<Application>('/applications', queryParams);
    },
  });
}

export function useApplication(id: string | number) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => hydraClient.getItem<Application>(`/applications/${id}`),
    enabled: !!id,
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Application> }) =>
      hydraClient.patch<Application>(`/applications/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

