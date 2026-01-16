import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import { API_BASE_URL } from '../lib/constants';
import axios from 'axios';
import type { User, Applicant } from '../lib/types';

// Use applicants endpoint to get users (applicants have user relationship)
// Filter only ROLE_ADMIN users and fetch all without pagination
export function useUsers(params?: {
  page?: number;
  itemsPerPage?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const queryParams: Record<string, any> = {};
      // Fetch all applicants without pagination - use a very large itemsPerPage
      queryParams.itemsPerPage = 10000;
      if (params?.search) queryParams.search = params.search;
      
      // Get all applicants and map to user-like structure
      const applicantsData = await hydraClient.getCollection<Applicant>('/applicants', queryParams);
      
      // Transform applicants to user format and filter only ROLE_ADMIN
      const allUsers = (applicantsData['hydra:member'] || []).map((applicant) => {
        const user = applicant.user;
        const roles = typeof user === 'object' ? (user?.roles || []) : [];
        return {
          id: applicant.id,
          email: applicant.email || (typeof user === 'object' ? user?.email : null),
          roles: roles,
          applicant: applicant, // Keep reference to full applicant data
        } as User;
      });
      
      // Filter only users with ROLE_ADMIN role
      const adminUsers = allUsers.filter((user) => 
        user.roles && Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN')
      );
      
      return {
        ...applicantsData,
        'hydra:member': adminUsers,
        'hydra:totalItems': adminUsers.length,
        'hydra:view': undefined, // Remove pagination view since we're showing all
      };
    },
  });
}

export function useUser(id: string | number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      // Get applicant and extract user info
      const applicant = await hydraClient.getItem<Applicant>(`/applicants/${id}`);
      const user = applicant.user;
      return {
        id: applicant.id,
        email: applicant.email || (typeof user === 'object' ? user?.email : null),
        roles: typeof user === 'object' ? (user?.roles || []) : [],
        applicant: applicant,
      } as User;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { email: string; password: string; roles?: string[]; first_name?: string; last_name?: string }) => {
      // Use create-account endpoint
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('first_name', data.first_name || data.email.split('@')[0]);
      formData.append('last_name', data.last_name || 'User');
      
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE_URL}/create-account`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<User> }) => {
      // Update the applicant (which contains the user)
      const applicant = await hydraClient.getItem<Applicant>(`/applicants/${id}`);
      
      // If we need to update user roles, we'd need a separate endpoint
      // For now, we'll update the applicant email if provided
      const updateData: Partial<Applicant> = {};
      if (data.email) {
        updateData.email = data.email;
      }
      
      if (Object.keys(updateData).length > 0) {
        return hydraClient.patch<Applicant>(`/applicants/${id}`, updateData);
      }
      
      return applicant;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
    },
  });
}

