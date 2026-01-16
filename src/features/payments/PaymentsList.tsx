import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayments } from '../../hooks/usePayments';
import { Table } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { formatDate, formatDateTime } from '../../lib/utils';
import type { Payment } from '../../lib/types';
import { Button, Dropdown, Space } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';

export function PaymentsList() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const navigate = useNavigate();
  
  const { data, isLoading, error } = usePayments({
    page,
    itemsPerPage: 20,
  });

  const handleExport = () => {
    if (!data) return;
    
    const payments = data?.['hydra:member'] || [];
    const csv = [
      ['ID', 'Transaction Reference', 'Amount', 'Applicant', 'Date'],
      ...payments.map((payment: Payment) => {
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
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading payments. Please try again.</p>
      </div>
    );
  }

  const payments = data?.['hydra:member'] || [];
  const totalItems = data?.['hydra:totalItems'] || 0;
  const hasNext = data?.['hydra:view']?.['hydra:next'];
  const hasPrevious = data?.['hydra:view']?.['hydra:previous'];

  // Calculate total amount
  const totalAmount = payments.reduce((sum: number, payment: Payment) => {
    return sum + parseFloat(payment.amount || '0');
  }, 0);

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Payment },
    { 
      header: 'Transaction Reference', 
      accessor: 'transaction_reference' as keyof Payment 
    },
    { 
      header: 'Amount', 
      accessor: (row: Payment) => `₦${parseFloat(row.amount || '0').toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    },
    { 
      header: 'Applicant', 
      accessor: (row: Payment) => {
        const applicant = typeof row.applicant === 'object' ? row.applicant : null;
        return applicant ? `${applicant.first_name} ${applicant.last_name}` : 'N/A';
      }
    },
    { 
      header: 'Date', 
      accessor: (row: Payment) => formatDateTime(row.created_at)
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <Space>
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
          >
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
            >
              Export
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-6">
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Total Payments</p>
          <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Total Amount</p>
          <p className="text-2xl font-semibold text-gray-900">
            ₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-600">Average Payment</p>
          <p className="text-2xl font-semibold text-gray-900">
            ₦{totalItems > 0 ? (totalAmount / totalItems).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4 p-4">
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

      <Table
        data={payments}
        columns={columns}
        onRowClick={(row) => navigate(`/payments/${row.id}`)}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {payments.length} of {totalItems} payments
        </div>
        <div className="flex gap-2">
          <Button
            disabled={!hasPrevious}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            disabled={!hasNext}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

