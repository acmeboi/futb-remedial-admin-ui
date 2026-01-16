import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import type { Program } from '../lib/types';

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => hydraClient.getCollection<Program>('/programs'),
  });
}

export function useProgram(id: string | number) {
  return useQuery({
    queryKey: ['program', id],
    queryFn: () => hydraClient.getItem<Program>(`/programs/${id}`),
    enabled: !!id,
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Program>) => 
      hydraClient.post<Program>('/programs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Program> }) =>
      hydraClient.patch<Program>(`/programs/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['program', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) =>
      hydraClient.delete(`/programs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

