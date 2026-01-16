import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useUpdateUser } from '../../hooks/useUsers';
import { Card } from '../../components/ui/Card';
import { Button } from 'antd';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const userUpdateSchema = z.object({
  email: z.string().email('Invalid email address'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(id || '');
  const updateUser = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UserUpdateFormData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      email: user?.email || '',
      roles: user?.roles || [],
    },
  });

  const availableRoles = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'];
  const selectedRoles = watch('roles') || [];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading user...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading user.</p>
        <Button className="mt-4" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: UserUpdateFormData) => {
    try {
      await updateUser.mutateAsync({
        id: id!,
        data: {
          email: data.email,
          roles: data.roles,
        },
      });
      setIsEditing(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const toggleRole = (role: string) => {
    const currentRoles = selectedRoles;
    if (currentRoles.includes(role)) {
      setValue('roles', currentRoles.filter(r => r !== role));
    } else {
      setValue('roles', [...currentRoles, role]);
    }
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center flex-1 min-w-0">
        <Button
          type="text"
          onClick={() => navigate('/users')}
          className="mr-2 sm:mr-4 flex-shrink-0"
          icon={<ArrowLeftOutlined />}
        >
          <span className="hidden sm:inline">Back</span>
        </Button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">User Details</h1>
        </div>
        {!isEditing && (
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Edit User</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles
              </label>
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">{role}</span>
                  </label>
                ))}
              </div>
              {errors.roles && (
                <p className="mt-1 text-sm text-red-600">{errors.roles.message}</p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setValue('email', user.email);
                  setValue('roles', user.roles || []);
                }}
                icon={<CloseOutlined />}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isSubmitting} 
                icon={<SaveOutlined />}
                className="w-full sm:w-auto"
              >
                Update User
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card title="User Information">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900">#{user.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Roles</dt>
              <dd className="mt-1">
                <div className="flex gap-2">
                  {user.roles?.map((role, idx) => (
                    <Badge key={idx} variant="info">{role}</Badge>
                  ))}
                </div>
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}

