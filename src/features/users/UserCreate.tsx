import { ArrowLeftOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'antd';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useCreateUser } from '../../hooks/useUsers';

const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserCreate() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await createUser.mutateAsync({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      navigate('/users');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create user';
      alert(errorMessage);
    }
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex items-center">
        <Button
          type="text"
          onClick={() => navigate('/users')}
          className="mr-2 sm:mr-4 flex-shrink-0"
          icon={<ArrowLeftOutlined />}
        >
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Create New User</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="space-y-4">
            <Input
              label="First Name"
              {...register('first_name')}
              error={errors.first_name?.message}
            />
            <Input
              label="Last Name"
              {...register('last_name')}
              error={errors.last_name?.message}
            />
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
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
            <Button
              onClick={() => navigate('/users')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isSubmitting}
              className="w-full sm:w-auto"
            >
              Create User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

