import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { Table } from '../../components/ui/Table';
import { Button } from 'antd';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import type { User } from '../../lib/types';
import { PlusOutlined } from '@ant-design/icons';

export function UsersList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useUsers({
    page,
    itemsPerPage: 20,
    search: search || undefined,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading users. Please try again.</p>
      </div>
    );
  }

  const users = data?.['hydra:member'] || [];
  const totalItems = data?.['hydra:totalItems'] || 0;
  const hasNext = data?.['hydra:view']?.['hydra:next'];
  const hasPrevious = data?.['hydra:view']?.['hydra:previous'];

  const columns = [
    { header: 'ID', accessor: 'id' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { 
      header: 'Roles', 
      accessor: (row: User) => (
        <div className="flex gap-1">
          {row.roles?.map((role, idx) => (
            <Badge key={idx} variant="info">{role}</Badge>
          ))}
        </div>
      )
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/users/new')}>
          Add User
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search users by email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-md"
        />
      </div>

      <Table
        data={users}
        columns={columns}
        onRowClick={(row) => navigate(`/users/${row.id}`)}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {users.length} of {totalItems} users
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

