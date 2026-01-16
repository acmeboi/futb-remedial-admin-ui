import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Space } from 'antd';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { useCreateProgram, useDeleteProgram, usePrograms, useUpdateProgram } from '../../hooks/usePrograms';
import type { Program } from '../../lib/types';

const programSchema = z.object({
  program_name: z.string().min(1, 'Program name is required'),
  duration: z.number().min(1, 'Duration is required'),
  description: z.string().optional(),
});

type ProgramFormData = z.infer<typeof programSchema>;

export function ProgramsManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data, isLoading } = usePrograms();
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
  });

  const programs = data?.['hydra:member'] || [];

  const onSubmit = async (data: ProgramFormData) => {
    try {
      if (editingId) {
        await updateProgram.mutateAsync({ id: editingId, data });
        setEditingId(null);
      } else {
        await createProgram.mutateAsync(data);
        setIsCreating(false);
      }
      reset();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save program');
    }
  };

  const handleEdit = (program: Program) => {
    setEditingId(program.id!);
    setValue('program_name', program.program_name || '');
    setValue('duration', program.duration || 0);
    setValue('description', program.description || '');
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await deleteProgram.mutateAsync(id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete program');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as keyof Program },
    { header: 'Program Name', accessor: 'program_name' as keyof Program },
    { header: 'Duration (years)', accessor: 'duration' as keyof Program },
    { header: 'Description', accessor: 'description' as keyof Program },
    {
      header: 'Actions',
      accessor: (row: Program) => (
        <Space>
          <Button
            type="text"
            onClick={() => handleEdit(row)}
            icon={<EditOutlined />}
          />
          <Button
            type="primary"
            danger
            onClick={() => handleDelete(row.id!)}
            icon={<DeleteOutlined />}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Program Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : 'Add Program'}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
            <Input
              label="Program Name"
              {...register('program_name')}
              error={errors.program_name?.message}
            />
            <Input
              label="Duration (years)"
              type="number"
              {...register('duration', { valueAsNumber: true })}
              error={errors.duration?.message}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {editingId ? 'Update' : 'Create'}
            </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : (
        <Card>
          <Table data={programs} columns={columns} />
        </Card>
      )}
    </div>
  );
}

