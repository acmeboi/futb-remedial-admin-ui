import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import type { User } from '../lib/types';

export function useUsers(params?: {
  page?: number;
  itemsPerPage?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const queryParams: Record<string, any> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.itemsPerPage) queryParams.itemsPerPage = params.itemsPerPage;
      if (params?.search) queryParams.email = params.search;
      
      return hydraClient.getCollection<User>('/users', queryParams);
    },
  });
}

export function useUser(id: string | number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => hydraClient.getItem<User>(`/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<User>) => 
      hydraClient.post<User>('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<User> }) =>
      hydraClient.patch<User>(`/users/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

