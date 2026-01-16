import { useParams, useNavigate } from 'react-router-dom';
import { useApplicant } from '../../hooks/useApplicants';
import { Card } from '../../components/ui/Card';
import { formatDate, formatDateTime } from '../../lib/utils';
import { getFileUrl } from '../../lib/apiUtils';
import { Button, Dropdown, Space } from 'antd';
import { DownloadOutlined, FileExcelOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export function ApplicantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: applicant, isLoading, error } = useApplicant(id || '');

  const handleExport = () => {
    // Simple CSV export
    if (!applicant) return;
    
    const csv = [
      ['Field', 'Value'],
      ['ID', applicant.id],
      ['First Name', applicant.first_name],
      ['Last Name', applicant.last_name],
      ['Other Names', applicant.orther_names || ''],
      ['Email', applicant.email],
      ['Phone', applicant.phone_number],
      ['Gender', applicant.gender],
      ['Date of Birth', applicant.date_of_birth],
      ['Nationality', applicant.nationality],
      ['Address', applicant.address || ''],
      ['Created At', applicant.created_at],
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicant-${applicant.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading applicant...</p>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading applicant.</p>
        <Button className="mt-4" onClick={() => navigate('/applicants')}>
          Back to Applicants
        </Button>
      </div>
    );
  }

  const lga = typeof applicant.lga === 'object' ? applicant.lga : null;
  const state = lga && typeof lga.state === 'object' ? lga.state : null;

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center flex-1 min-w-0">
          <Button
            type="text"
            onClick={() => navigate('/applicants')}
            className="mr-2 sm:mr-4 flex-shrink-0"
            icon={<ArrowLeftOutlined />}
          >
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
            {applicant.first_name} {applicant.last_name}
          </h1>
        </div>
        <Space className="w-full sm:w-auto">
          <Dropdown
            menu={{
              items: [
                {
                  key: 'export-csv',
                  label: 'Export CSV',
                  icon: <FileExcelOutlined />,
                  onClick: handleExport,
                },
              ],
            }}
            trigger={['click']}
            className="w-full sm:w-auto"
          >
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              className="w-full sm:w-auto"
            >
              Export
            </Button>
          </Dropdown>
        </Space>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card title="Personal Information">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {applicant.first_name} {applicant.last_name}
                {applicant.orther_names && ` ${applicant.orther_names}`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{applicant.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{applicant.phone_number}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{applicant.gender}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(applicant.date_of_birth)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Nationality</dt>
              <dd className="mt-1 text-sm text-gray-900">{applicant.nationality}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Location Information">
          <dl className="space-y-4">
            {state && (
              <div>
                <dt className="text-sm font-medium text-gray-500">State</dt>
                <dd className="mt-1 text-sm text-gray-900">{state.name}</dd>
              </div>
            )}
            {lga && (
              <div>
                <dt className="text-sm font-medium text-gray-500">LGA</dt>
                <dd className="mt-1 text-sm text-gray-900">{lga.name}</dd>
              </div>
            )}
            {applicant.address && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{applicant.address}</dd>
              </div>
            )}
            {applicant.passport_url && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Passport Photo</dt>
                <dd className="mt-1">
                  <img
                    src={getFileUrl(applicant.passport_url)}
                    alt="Passport"
                    className="h-32 w-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    onClick={() => window.open(getFileUrl(applicant.passport_url), '_blank')}
                  />
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Account Information">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateTime(applicant.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateTime(applicant.updated_at)}</dd>
            </div>
          </dl>
        </Card>

        {applicant.applications && applicant.applications.length > 0 && (
          <Card title="Applications">
            <div className="space-y-2">
              {applicant.applications.map((app: any) => {
                const application = typeof app === 'object' ? app : null;
                if (!application) return null;
                return (
                  <div
                    key={application.id}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => navigate(`/applications/${application.id}`)}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Application #{application.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Status: {application.status} | Created: {formatDate(application.created_at)}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
