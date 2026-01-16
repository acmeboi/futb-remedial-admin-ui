import { useDocumentTypes } from '../../hooks/useDocuments';
import { Table } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import type { DocumentType } from '../../lib/types';

export function DocumentTypesManagement() {
  const { data, isLoading } = useDocumentTypes();

  const documentTypes = data?.['hydra:member'] || [];

  const columns = [
    { header: 'ID', accessor: 'id' as keyof DocumentType },
    { header: 'Name', accessor: 'name' as keyof DocumentType },
    {
      header: 'Required',
      accessor: (row: DocumentType) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.required ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.required ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Document Types Management</h2>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <Card>
          <Table data={documentTypes} columns={columns} />
        </Card>
      )}
    </div>
  );
}

