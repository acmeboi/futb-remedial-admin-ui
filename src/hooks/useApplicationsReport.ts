import { useQuery } from '@tanstack/react-query';
import { hydraClient } from '../api/hydra';
import type { Application, OLevelResult } from '../lib/types';

interface ApplicationWithResults extends Application {
  oLevelResults?: OLevelResult[];
}

export function useApplicationsReport(statusFilter?: string) {
  return useQuery({
    queryKey: ['applicationsReport', statusFilter],
    queryFn: async () => {
      // Fetch all applications (no pagination for report)
      const queryParams: Record<string, any> = {
        itemsPerPage: 1000, // Get all applications
      };
      if (statusFilter) {
        queryParams.status = statusFilter;
      }
      
      const applicationsData = await hydraClient.getCollection<Application>('/applications', queryParams);
      const applications = applicationsData?.['hydra:member'] || [];
      
      // Fetch all O-Level results
      const oLevelResultsData = await hydraClient.getCollection<OLevelResult>('/o_level_results', {
        itemsPerPage: 1000,
      });
      const allOLevelResults = oLevelResultsData?.['hydra:member'] || [];
      
      // Map O-Level results to applications
      const applicationsWithResults: ApplicationWithResults[] = applications.map((app) => {
        const appId = app.id;
        const appOLevelResults = allOLevelResults.filter((result: any) => {
          const resultApp = result.application;
          
          // Check if application is an object with id
          if (typeof resultApp === 'object' && resultApp !== null && resultApp.id) {
            return resultApp.id === appId;
          }
          
          // Check if application is a string IRI
          if (typeof resultApp === 'string') {
            return resultApp.includes(`/applications/${appId}`) || resultApp.endsWith(`/applications/${appId}`);
          }
          
          return false;
        });
        
        return {
          ...app,
          oLevelResults: appOLevelResults,
        };
      });
      
      return applicationsWithResults;
    },
    enabled: true,
  });
}

