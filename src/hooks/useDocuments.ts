import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import type { ApplicationDocument, DocumentType } from '../lib/types';

export function useDocuments(applicationId?: number) {
  return useQuery({
    queryKey: ['documents', applicationId],
    queryFn: async () => {
      const params = applicationId ? { 'application.id': applicationId } : {};
      return hydraClient.getCollection<ApplicationDocument>('/application_documents', params);
    },
    enabled: !!applicationId,
  });
}

export function useDocument(id: string | number) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => hydraClient.getItem<ApplicationDocument>(`/application_documents/${id}`),
    enabled: !!id,
  });
}

export function useDocumentTypes() {
  return useQuery({
    queryKey: ['documentTypes'],
    queryFn: () => hydraClient.getCollection<DocumentType>('/document_types'),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FormData) => {
      // Use apiClient for multipart uploads
      const token = localStorage.getItem('access_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://remedialapi.futb.edu.ng/api';
      return fetch(`${apiUrl}/application_documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) =>
      hydraClient.delete(`/application_documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

