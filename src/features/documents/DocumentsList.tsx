import { useState } from 'react';
import { useDocuments, useDeleteDocument } from '../../hooks/useDocuments';
import { Table } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/ToastContainer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../lib/utils';
import { getFileUrl } from '../../lib/apiUtils';
import type { ApplicationDocument } from '../../lib/types';
import { TrashIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface DocumentsListProps {
  applicationId?: number;
}

export function DocumentsList({ applicationId }: DocumentsListProps) {
  const { data, isLoading, error } = useDocuments(applicationId);
  const deleteDocument = useDeleteDocument();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setShowConfirm(true);
  };

  const handleDownload = (doc: ApplicationDocument) => {
    try {
      const fileUrl = getFileUrl(doc.document_url);
      if (!fileUrl) {
        toast.showToast('Document URL not available', 'error');
        return;
      }

      // Get the document type name for the filename
      const docTypeField = (doc as any).document || doc.document_type;
      const docType = typeof docTypeField === 'object' ? docTypeField : null;
      const docTypeName = docType?.name || 'document';
      
      // Extract file extension from URL or use a default
      const urlParts = doc.document_url.split('.');
      const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1] : 'pdf';
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${docTypeName}-${doc.id}.${extension}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.showToast('Download started', 'success');
    } catch (error: any) {
      toast.showToast('Failed to download document', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await deleteDocument.mutateAsync(deletingId);
      toast.showToast('Document deleted successfully', 'success');
      setShowConfirm(false);
      setDeletingId(null);
    } catch (error: any) {
      toast.showToast(error?.message || 'Failed to delete document', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading documents..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading documents. Please try again.</p>
      </div>
    );
  }

  const documents = data?.['hydra:member'] || [];

  if (documents.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No documents found</p>
      </Card>
    );
  }

  const columns = [
    { header: 'ID', accessor: 'id' as keyof ApplicationDocument },
    { 
      header: 'Document Type', 
      accessor: (row: ApplicationDocument) => {
        // Check both 'document' and 'document_type' fields (API uses 'document')
        const docTypeField = (row as any).document || row.document_type;
        const docType = typeof docTypeField === 'object' ? docTypeField : null;
        return docType?.name || 'Unknown';
      }
    },
    { 
      header: 'Created', 
      accessor: (row: ApplicationDocument) => formatDate(row.created_at)
    },
    {
      header: 'Actions',
      accessor: (row: ApplicationDocument) => (
        <div className="flex gap-2">
          <a
            href={getFileUrl(row.document_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700"
            title="View document"
          >
            <EyeIcon className="h-5 w-5" />
          </a>
          <button
            onClick={() => handleDownload(row)}
            className="text-blue-600 hover:text-blue-700"
            title="Download document"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(row.id!)}
            disabled={deletingId === row.id}
            className="text-red-600 hover:text-red-700 disabled:opacity-50"
            title="Delete document"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table data={documents} columns={columns} />
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteDocument.isPending}
      />
    </div>
  );
}

