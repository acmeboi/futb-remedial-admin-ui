import { useParams, useNavigate } from 'react-router-dom';
import { useApplication, useUpdateApplication } from '../../hooks/useApplications';
import { useOLevelResults } from '../../hooks/useOLevelResults';
import { Card } from '../../components/ui/Card';
import { Button } from 'antd';
import { Badge } from '../../components/ui/Badge';
import { formatDateTime } from '../../lib/utils';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { DocumentsList } from '../documents/DocumentsList';
import { DocumentUpload } from '../documents/DocumentUpload';

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: application, isLoading, error } = useApplication(id || '');
  const { data: oLevelResultsData, isLoading: isLoadingResults } = useOLevelResults(id);
  const updateApplication = useUpdateApplication();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading || isLoadingResults) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading application...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading application.</p>
        <Button className="mt-4" onClick={() => navigate('/applications')}>
          Back to Applications
        </Button>
      </div>
    );
  }

  const applicant = typeof application.applicant === 'object' ? application.applicant : null;
  const program = typeof application.program === 'object' ? application.program : null;
  
  // Get O-Level results from separate query or from application data
  const oLevelResultsFromQuery = oLevelResultsData?.['hydra:member'] || [];
  const oLevelResultsFromApp = application.oLevelResults || [];
  const oLevelResults = oLevelResultsFromQuery.length > 0 ? oLevelResultsFromQuery : oLevelResultsFromApp;

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'submitted':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    setIsUpdating(true);
    try {
      await updateApplication.mutateAsync({
        id: id!,
        data: { status: newStatus },
      });
      setShowStatusModal(false);
      setNewStatus('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            type="text"
            onClick={() => navigate('/applications')}
            className="mr-4"
            icon={<ArrowLeftOutlined />}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={getStatusVariant(application.status) as any}>
            {application.status}
          </Badge>
          <Button type="primary" onClick={() => setShowStatusModal(true)}>
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Application Information */}
        <Card title="Application Information">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Application ID</dt>
              <dd className="mt-1 text-sm text-gray-900">#{application.id}</dd>
            </div>
            {applicant && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Applicant</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {applicant.first_name} {applicant.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{applicant.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{applicant.phone_number}</dd>
                </div>
              </>
            )}
            {program && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Program</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {typeof program === 'object' ? program.program_name : program}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge variant={getStatusVariant(application.status) as any}>
                  {application.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateTime(application.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateTime(application.updated_at)}</dd>
            </div>
          </dl>
        </Card>

        {/* O-Level Results */}
        <Card title="O-Level Results">
          {oLevelResults.length === 0 ? (
            <p className="text-sm text-gray-500">No O-Level results available</p>
          ) : (
            <div className="space-y-4">
              {oLevelResults.map((result: any) => {
                // Check if this is the new format with oLevelSubjects array
                if (result.oLevelSubjects && Array.isArray(result.oLevelSubjects) && result.oLevelSubjects.length > 0) {
                  return (
                    <div key={result.id} className="border rounded-lg p-4 bg-gray-50">
                      {result.exam_type && (
                        <div className="mb-3 pb-2 border-b">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {result.exam_type}
                              {result.exam_year && ` - ${result.exam_year}`}
                            </span>
                            {result.exam_number && (
                              <span className="text-xs text-gray-500">Exam No: {result.exam_number}</span>
                            )}
                          </div>
                          {result.center_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              {result.center_name}
                              {result.center_number && ` (${result.center_number})`}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="space-y-2">
                        {result.oLevelSubjects.map((subject: any) => {
                          const subjectName = subject.subject_name || subject.name || 'Unknown';
                          return (
                            <div key={subject.id} className="flex justify-between items-center p-2 bg-white rounded">
                              <span className="text-sm font-medium text-gray-900">{subjectName}</span>
                              <Badge variant="info">{subject.grade}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                
                // Legacy format: single oLevelSubject
                const subject = typeof result.oLevelSubject === 'object' 
                  ? result.oLevelSubject 
                  : null;
                const subjectName = subject && typeof subject.subject === 'object'
                  ? subject.subject.name
                  : subject?.subject_name || subject?.name || 'Unknown';
                const grade = result.grade || subject?.grade || 'N/A';
                
                return (
                  <div key={result.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">{subjectName}</span>
                    <Badge variant="info">{grade}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Documents */}
        <Card title="Documents" className="lg:col-span-2">
          <div className="space-y-4">
            <DocumentsList applicationId={parseInt(id || '0')} />
            <DocumentUpload 
              applicationId={parseInt(id || '0')} 
              onSuccess={() => window.location.reload()}
            />
          </div>
        </Card>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowStatusModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Application Status</h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm mb-4"
              >
                <option value="">Select status</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setShowStatusModal(false)}>
                  Cancel
                </Button>
                <Button type="primary" onClick={handleStatusUpdate} disabled={!newStatus || isUpdating} loading={isUpdating}>
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

