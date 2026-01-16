import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicants } from '../../hooks/useApplicants';
import { useDebounce } from '../../hooks/useDebounce';
import { Table } from '../../components/ui/Table';
import { Button } from 'antd';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatDate } from '../../lib/utils';
import type { Applicant } from '../../lib/types';
import { PlusOutlined } from '@ant-design/icons';

export function ApplicantsList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useApplicants({
    page,
    itemsPerPage: 20,
    search: debouncedSearch || undefined,
  });

  // Reset to page 1 when debounced search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Debug logging
  if (data && import.meta.env.DEV) {
    console.log('[ApplicantsList] Data received:', {
      hasData: !!data,
      hasMembers: !!(data['hydra:member']),
      memberCount: data['hydra:member']?.length || 0,
      totalItems: data['hydra:totalItems'] || 0,
      dataKeys: Object.keys(data || {}),
      fullData: data, // Log full response
    });
  }

  const applicants = data?.['hydra:member'] || [];
  const totalItems = data?.['hydra:totalItems'] || 0;
  const hasNext = data?.['hydra:view']?.['hydra:next'];
  const hasPrevious = data?.['hydra:view']?.['hydra:previous'];

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Applicant },
    { 
      header: 'Name', 
      accessor: (row: Applicant) => 
        `${row.first_name} ${row.last_name}${row.orther_names ? ` ${row.orther_names}` : ''}` 
    },
    { header: 'Email', accessor: 'email' as keyof Applicant },
    { header: 'Phone', accessor: 'phone_number' as keyof Applicant },
    { header: 'Gender', accessor: 'gender' as keyof Applicant },
    { 
      header: 'Created', 
      accessor: (row: Applicant) => formatDate(row.created_at)
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/applicants/new')}>
          Add Applicant
        </Button>
      </div>

      {/* Search Section - Fixed at top */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search applicants by name, email, or phone..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {searchInput && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchInput('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>
        {debouncedSearch && (
          <p className="text-sm text-gray-500 mt-2">
            Searching for: <span className="font-medium">"{debouncedSearch}"</span>
          </p>
        )}
      </Card>

      {/* Table Section - Separate from search */}
      <div>
        {error ? (
          <Card className="p-6">
            <div className="text-center">
              <p className="text-red-600">Error loading applicants. Please try again.</p>
              {error instanceof Error && (
                <p className="text-sm text-gray-500 mt-2">{error.message}</p>
              )}
            </div>
          </Card>
        ) : isLoading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : (
          <>
            <Table
              data={applicants}
              columns={columns}
              onRowClick={(row) => navigate(`/applicants/${row.id}`)}
            />

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {applicants.length} of {totalItems} applicants
                {debouncedSearch && ` matching "${debouncedSearch}"`}
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={!hasPrevious || isLoading}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  disabled={!hasNext || isLoading}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

