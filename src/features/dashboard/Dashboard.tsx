import { useNavigate } from 'react-router-dom';
import { useApplicants } from '../../hooks/useApplicants';
import { useApplications } from '../../hooks/useApplications';
import { usePayments } from '../../hooks/usePayments';
import { Card } from '../../components/ui/Card';
import {
  StatCardSkeleton,
  ChartSkeleton,
  ListItemSkeleton,
} from '../../components/ui/Skeleton';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  CreditCardIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { PlusOutlined } from '@ant-design/icons';
import { formatDate } from '../../lib/utils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { generateDashboardPDF } from '../../lib/reportPdfUtils';
import { getHydraTotalItems } from '../../lib/hydraUtils';
import { Button, Dropdown, Space } from 'antd';
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Dashboard() {
  const navigate = useNavigate();
  const { data: applicantsData, isLoading: isLoadingApplicants } = useApplicants({ itemsPerPage: 1 });
  const { data: applicationsData, isLoading: isLoadingApplications } = useApplications({ itemsPerPage: 10 });
  const { data: paymentsData, isLoading: isLoadingPayments } = usePayments({ itemsPerPage: 1 });
  
  // Get status counts
  const { data: pendingApps, isLoading: isLoadingPending } = useApplications({ status: 'PENDING', itemsPerPage: 1 });
  const { data: approvedApps, isLoading: isLoadingApproved } = useApplications({ status: 'APPROVED', itemsPerPage: 1 });
  const { data: rejectedApps, isLoading: isLoadingRejected } = useApplications({ status: 'REJECTED', itemsPerPage: 1 });
  
  // Check if any data is still loading
  const isLoading = isLoadingApplicants || isLoadingApplications || isLoadingPayments || 
                    isLoadingPending || isLoadingApproved || isLoadingRejected;
  
  const totalApplicants = getHydraTotalItems(applicantsData);
  const totalApplications = getHydraTotalItems(applicationsData);
  const totalPayments = getHydraTotalItems(paymentsData);
  
  const pendingCount = pendingApps?.['hydra:totalItems'] || 0;
  const approvedCount = approvedApps?.['hydra:totalItems'] || 0;
  const rejectedCount = rejectedApps?.['hydra:totalItems'] || 0;

  // Recent applications
  const recentApplications = applicationsData?.['hydra:member']?.slice(0, 5) || [];

  // Chart data
  const applicationStatusData = [
    { name: 'Pending', value: pendingCount },
    { name: 'Approved', value: approvedCount },
    { name: 'Rejected', value: rejectedCount },
  ];

  const stats = [
    {
      name: 'Total Applicants',
      value: totalApplicants,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      href: '/applicants',
    },
    {
      name: 'Total Applications',
      value: totalApplications,
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      href: '/applications',
    },
    {
      name: 'Pending Applications',
      value: pendingCount,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      href: '/applications?status=PENDING',
    },
    {
      name: 'Total Payments',
      value: totalPayments,
      icon: CreditCardIcon,
      color: 'bg-purple-500',
      href: '/payments',
    },
  ];

  const handleDownloadReport = async () => {
    try {
      await generateDashboardPDF('dashboard-content');
    } catch (error: any) {
      console.error('Failed to generate dashboard report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'pdf-report',
                  label: 'PDF Report',
                  icon: <FilePdfOutlined />,
                  onClick: handleDownloadReport,
                  disabled: isLoading,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              loading={isLoading}
            >
              Download Report
            </Button>
          </Dropdown>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/applicants/new')}>
            New Applicant
          </Button>
        </Space>
      </div>
      
      <div id="dashboard-content">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          stats.map((stat) => (
            <div
              key={stat.name}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white shadow rounded-lg"
              onClick={() => navigate(stat.href)}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Application Status Chart */}
        {isLoading ? (
          <ChartSkeleton height={300} />
        ) : (
          <Card title="Application Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {applicationStatusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Recent Activity */}
        {isLoading ? (
          <div className="p-6 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <Card title="Recent Applications" actions={
            <Button type="text" onClick={() => navigate('/applications')}>
              View All
            </Button>
          }>
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent applications</p>
              ) : (
                recentApplications.map((app) => {
                  const applicant = typeof app.applicant === 'object' ? app.applicant : null;
                  const program = typeof app.program === 'object' ? app.program : null;
                  return (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => navigate(`/applications/${app.id}`)}>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {applicant ? `${applicant.first_name} ${applicant.last_name}` : 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">{program ? (typeof program === 'object' ? program.program_name : program) : 'No program'}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(app.created_at)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        app.status?.toUpperCase() === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        app.status?.toUpperCase() === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}

