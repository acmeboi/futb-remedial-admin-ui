import { useState } from 'react';
import { useApplicants } from '../../hooks/useApplicants';
import { useApplications } from '../../hooks/useApplications';
import { usePayments } from '../../hooks/usePayments';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import {
  StatCardSkeleton,
  ChartSkeleton,
  CardSkeleton,
} from '../../components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatDate } from '../../lib/utils';
import { generateReportsPDF } from '../../lib/reportPdfUtils';
import { generateTableReportPDF } from '../../lib/tableReportPdfUtils';
import { getHydraTotalItems } from '../../lib/hydraUtils';
import { Button, Dropdown, Space } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileTextOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

export function Reports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { data: applicantsData, isLoading: isLoadingApplicants } = useApplicants({ itemsPerPage: 1000 });
  const { data: applicationsData, isLoading: isLoadingApplications } = useApplications({ itemsPerPage: 1000 });
  const { data: paymentsData, isLoading: isLoadingPayments } = usePayments({ itemsPerPage: 1000 });
  
  const isLoading = isLoadingApplicants || isLoadingApplications || isLoadingPayments;

  const handleExportApplications = () => {
    if (!applicationsData) return;
    
    const applications = applicationsData?.['hydra:member'] || [];
    const csv = [
      ['ID', 'Applicant', 'Program', 'Status', 'Created Date'],
      ...applications.map((app: any) => {
        const applicant = typeof app.applicant === 'object' ? app.applicant : null;
        const program = typeof app.program === 'object' ? app.program : null;
        return [
          app.id,
          applicant ? `${applicant.first_name} ${applicant.last_name}` : 'N/A',
          program?.name || 'N/A',
          app.status,
          formatDate(app.created_at),
        ];
      }),
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPayments = () => {
    if (!paymentsData) return;
    
    const payments = paymentsData?.['hydra:member'] || [];
    const csv = [
      ['ID', 'Transaction Reference', 'Amount', 'Applicant', 'Date'],
      ...payments.map((payment: any) => {
        const applicant = typeof payment.applicant === 'object' ? payment.applicant : null;
        return [
          payment.id,
          payment.transaction_reference || '',
          payment.amount || '0',
          applicant ? `${applicant.first_name} ${applicant.last_name}` : 'N/A',
          formatDate(payment.created_at),
        ];
      }),
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const applications = applicationsData?.['hydra:member'] || [];
  const payments = paymentsData?.['hydra:member'] || [];

  // Application status distribution
  const statusData = applications.reduce((acc: any, app: any) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value,
  }));

  // Monthly applications
  const monthlyData = applications.reduce((acc: any, app: any) => {
    const month = new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const monthlyChartData = Object.entries(monthlyData)
    .map(([name, value]) => ({ name, applications: value }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  // Payment amounts by month
  const paymentMonthlyData = payments.reduce((acc: any, payment: any) => {
    const month = new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += parseFloat(payment.amount || '0');
    return acc;
  }, {});

  const paymentChartData = Object.entries(paymentMonthlyData)
    .map(([name, value]) => ({ name, amount: value }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  const handleDownloadPDFReport = async () => {
    try {
      await generateReportsPDF('reports-content');
    } catch (error: any) {
      console.error('Failed to generate reports PDF:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleDownloadTableReport = () => {
    try {
      const applications = applicationsData?.['hydra:member'] || [];
      const payments = paymentsData?.['hydra:member'] || [];
      const applicants = applicantsData?.['hydra:member'] || [];
      const totalRevenue = payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0);
      
      generateTableReportPDF({
        applications,
        payments,
        applicants,
        totalApplicants: getHydraTotalItems(applicantsData),
        totalApplications: getHydraTotalItems(applicationsData),
        totalPayments: getHydraTotalItems(paymentsData),
        totalRevenue,
        statusChartData,
        monthlyChartData,
        paymentChartData,
      });
    } catch (error: any) {
      console.error('Failed to generate table report:', error);
      alert('Failed to generate table report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'pdf-report',
                  label: 'PDF Report (Screenshot)',
                  icon: <FilePdfOutlined />,
                  onClick: handleDownloadPDFReport,
                  disabled: isLoading,
                },
                {
                  key: 'table-report',
                  label: 'Table Report (PDF)',
                  icon: <FileTextOutlined />,
                  onClick: handleDownloadTableReport,
                  disabled: isLoading,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'export-applications',
                  label: 'Export Applications (CSV)',
                  icon: <FileExcelOutlined />,
                  onClick: handleExportApplications,
                },
                {
                  key: 'export-payments',
                  label: 'Export Payments (CSV)',
                  icon: <FileExcelOutlined />,
                  onClick: handleExportPayments,
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
              Download Reports
            </Button>
          </Dropdown>
        </Space>
      </div>

      <div id="reports-content">
      {/* Date Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            type="date"
            label="From Date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            label="To Date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600">Total Applicants</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getHydraTotalItems(applicantsData)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getHydraTotalItems(applicationsData)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getHydraTotalItems(paymentsData)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₦{payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isLoading ? (
          <>
            <ChartSkeleton height={300} />
            <ChartSkeleton height={300} />
            <ChartSkeleton height={300} className="lg:col-span-2" />
          </>
        ) : (
          <>
            <Card title="Application Status Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Applications Over Time">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="applications" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Payment Revenue Over Time" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₦${parseFloat(value as string).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Bar dataKey="amount" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}
      </div>
      </div>
    </div>
  );
}

