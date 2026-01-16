import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '../../hooks/useApplications';
import { useApplicationsReport } from '../../hooks/useApplicationsReport';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatDate } from '../../lib/utils';
import { generateApplicationsPDFCompact, generateApplicationsPDFDetailed } from '../../lib/pdfUtils';
import { generateApplicationsExcel } from '../../lib/excelUtils';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../components/ui/ToastContainer';
import type { Application } from '../../lib/types';
import { Button, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';

export function ApplicationsList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const navigate = useNavigate();
  const toast = useToast();
  
  const { data, isLoading, error } = useApplications({
    page,
    itemsPerPage: 20,
    status: statusFilter || undefined,
  });
  
  const { data: reportData, isLoading: isGeneratingReport } = useApplicationsReport(
    statusFilter || undefined
  );

  const handleDownloadPDFCompact = () => {
    if (!reportData || reportData.length === 0) {
      toast.showToast('No applications data available for report', 'error');
      return;
    }
    
    try {
      generateApplicationsPDFCompact(reportData, statusFilter || undefined);
      toast.showToast('Compact PDF report generated successfully', 'success');
    } catch (error: any) {
      toast.showToast('Failed to generate PDF report', 'error');
      console.error('PDF generation error:', error);
    }
  };

  const handleDownloadPDFDetailed = () => {
    if (!reportData || reportData.length === 0) {
      toast.showToast('No applications data available for report', 'error');
      return;
    }
    
    try {
      generateApplicationsPDFDetailed(reportData, statusFilter || undefined);
      toast.showToast('Detailed PDF report generated successfully', 'success');
    } catch (error: any) {
      toast.showToast('Failed to generate PDF report', 'error');
      console.error('PDF generation error:', error);
    }
  };

  const handleDownloadExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast.showToast('No applications data available for report', 'error');
      return;
    }
    
    try {
      generateApplicationsExcel(reportData, statusFilter || undefined);
      toast.showToast('Excel report generated successfully', 'success');
    } catch (error: any) {
      toast.showToast('Failed to generate Excel report', 'error');
      console.error('Excel generation error:', error);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading applications. Please try again.</p>
      </div>
    );
  }

  const applications = data?.['hydra:member'] || [];
  const totalItems = data?.['hydra:totalItems'] || 0;
  const hasNext = data?.['hydra:view']?.['hydra:next'];
  const hasPrevious = data?.['hydra:view']?.['hydra:previous'];

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

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Application },
    { 
      header: 'Applicant', 
      accessor: (row: Application) => {
        const applicant = typeof row.applicant === 'object' ? row.applicant : null;
        return applicant ? `${applicant.first_name} ${applicant.last_name}` : 'N/A';
      }
    },
    { 
      header: 'Program', 
      accessor: (row: Application) => {
        const program = typeof row.program === 'object' ? row.program : null;
        return program ? (program.program_name || 'N/A') : 'N/A';
      }
    },
    { 
      header: 'Status', 
      accessor: (row: Application) => (
        <Badge variant={getStatusVariant(row.status) as any}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Created', 
      accessor: (row: Application) => formatDate(row.created_at)
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'compact-pdf',
                  label: 'Compact PDF',
                  icon: <FileTextOutlined />,
                  onClick: handleDownloadPDFCompact,
                  disabled: isGeneratingReport || !reportData || reportData.length === 0,
                },
                {
                  key: 'detailed-pdf',
                  label: 'Detailed PDF',
                  icon: <FilePdfOutlined />,
                  onClick: handleDownloadPDFDetailed,
                  disabled: isGeneratingReport || !reportData || reportData.length === 0,
                },
                {
                  key: 'excel',
                  label: 'Excel',
                  icon: <FileExcelOutlined />,
                  onClick: handleDownloadExcel,
                  disabled: isGeneratingReport || !reportData || reportData.length === 0,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              loading={isGeneratingReport}
              disabled={!reportData || reportData.length === 0}
            >
              Download Reports
            </Button>
          </Dropdown>
        </Space>
      </div>

      <div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
          <option value="ADMITTED">Admitted</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} columns={5} />
      ) : (
        <>
          <Table
            data={applications}
            columns={columns}
            onRowClick={(row) => navigate(`/applications/${row.id}`)}
          />

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {applications.length} of {totalItems} applications
            </div>
            <div className="flex gap-2">
              <button
                disabled={!hasPrevious || isLoading}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={!hasNext || isLoading}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

