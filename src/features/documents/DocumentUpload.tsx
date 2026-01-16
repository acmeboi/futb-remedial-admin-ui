import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDocument, useDocumentTypes } from '../../hooks/useDocuments';
import { Button } from 'antd';
import { Card } from '../../components/ui/Card';
import { getResourceIri } from '../../lib/apiUtils';
import { UploadOutlined } from '@ant-design/icons';

const documentSchema = z.object({
  document_type: z.string().min(1, 'Document type is required'),
  application: z.string().min(1, 'Application is required'),
  documentFile: z.instanceof(FileList).refine(files => files.length > 0, 'File is required'),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentUploadProps {
  applicationId: number;
  onSuccess?: () => void;
}

export function DocumentUpload({ applicationId, onSuccess }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { data: documentTypesData } = useDocumentTypes();
  const createDocument = useCreateDocument();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      application: getResourceIri('applications', applicationId),
    },
  });

  const documentTypes = documentTypesData?.['hydra:member'] || [];

  const onSubmit = async (data: DocumentFormData) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('documentFile', data.documentFile[0]);
      formData.append('document', getResourceIri('document_types', data.document_type));
      formData.append('application', getResourceIri('applications', applicationId));

      await createDocument.mutateAsync(formData);
      reset();
      onSuccess?.();
    } catch (error: any) {
      alert(error?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card title="Upload Document">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            {...register('document_type')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select document type</option>
            {documentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.document_type && (
            <p className="mt-1 text-sm text-red-600">{errors.document_type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document File
          </label>
          <input
            type="file"
            {...register('documentFile')}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {errors.documentFile && (
            <p className="mt-1 text-sm text-red-600">{errors.documentFile.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="primary" htmlType="submit" loading={isUploading} icon={<UploadOutlined />}>
            Upload Document
          </Button>
        </div>
      </form>
    </Card>
  );
}

