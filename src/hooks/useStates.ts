import { useQuery } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import type { State, Lga } from '../lib/types';

export function useStates() {
  return useQuery({
    queryKey: ['states'],
    queryFn: () => hydraClient.getCollection<State>('/states'),
  });
}

export function useLgas(stateId?: number) {
  return useQuery({
    queryKey: ['lgas', stateId],
    queryFn: () => {
      const params = stateId ? { state: stateId } : {};
      return hydraClient.getCollection<Lga>('/lgas', params);
    },
    enabled: true,
  });
}

