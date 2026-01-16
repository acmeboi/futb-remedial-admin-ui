import { useQuery } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import type { OLevelResult } from '../lib/types';

export function useOLevelResults(applicationId?: string | number) {
  return useQuery({
    queryKey: ['oLevelResults', applicationId],
    queryFn: async () => {
      if (!applicationId) return null;
      
      // Fetch all results and filter client-side since API filter doesn't work reliably
      const data = await hydraClient.getCollection<OLevelResult>('/o_level_results', {});
      
      // Client-side filtering to ensure we only get results for this application
      if (data && data['hydra:member']) {
        const appIdNum = Number(applicationId);
        const filteredMembers = data['hydra:member'].filter((result: any) => {
          const app = result.application;
          
          // Check if application is an object with id
          if (typeof app === 'object' && app !== null && app.id) {
            return app.id === appIdNum;
          }
          
          // Check if application is a string IRI
          if (typeof app === 'string') {
            return app.includes(`/applications/${applicationId}`) || app.endsWith(`/applications/${applicationId}`);
          }
          
          return false;
        });
        
        if (import.meta.env.DEV) {
          console.log(`[useOLevelResults] Filtered results for application ${applicationId}:`, {
            totalFetched: data['hydra:member'].length,
            filtered: filteredMembers.length,
            sampleAppIds: data['hydra:member'].slice(0, 3).map((r: any) => {
              const app = r.application;
              return typeof app === 'object' ? app.id : app;
            }),
          });
        }
        
        return {
          ...data,
          'hydra:member': filteredMembers,
          'hydra:totalItems': filteredMembers.length,
        };
      }
      
      return data;
    },
    enabled: !!applicationId,
  });
}
