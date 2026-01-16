import { ArrowLeftOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'antd';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useCreateUser } from '../../hooks/useUsers';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

type UserFormData = z.infer<typeof userSchema>;

const availableRoles = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'];

export function UserCreate() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['ROLE_USER']);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      roles: ['ROLE_USER'],
    },
  });

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      await createUser.mutateAsync({
        email: data.email,
        password: data.password,
        roles: selectedRoles,
      } as any); // Password is handled server-side
      navigate('/users');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          type="text"
          onClick={() => navigate('/users')}
          className="mr-4"
          icon={<ArrowLeftOutlined />}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />
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
              {selectedRoles.length === 0 && (
                <p className="mt-1 text-sm text-red-600">At least one role is required</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={selectedRoles.length === 0}>
              Create User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

