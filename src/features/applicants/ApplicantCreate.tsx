import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateApplicant } from '../../hooks/useApplicants';
import { useStates, useLgas } from '../../hooks/useStates';
import { getResourceIri } from '../../lib/apiUtils';
import { Button } from 'antd';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useState } from 'react';

const applicantSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  orther_names: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  gender: z.enum(['male', 'female', 'other']),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  lga: z.string().min(1, 'LGA is required'),
  address: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type ApplicantFormData = z.infer<typeof applicantSchema>;

export function ApplicantCreate() {
  const navigate = useNavigate();
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const { data: statesData } = useStates();
  const { data: lgasData } = useLgas(selectedStateId || undefined);
  const createApplicant = useCreateApplicant();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicantFormData>({
    resolver: zodResolver(applicantSchema),
  });

  const states = statesData?.['hydra:member'] || [];
  const lgas = lgasData?.['hydra:member'] || [];

  const onSubmit = async (data: ApplicantFormData) => {
    try {
      // Find the LGA object
      const selectedLga = lgas.find(lga => lga.id.toString() === data.lga);
      if (!selectedLga) {
        alert('Please select a valid LGA');
        return;
      }

      await createApplicant.mutateAsync({
        ...data,
        lga: getResourceIri('lgas', selectedLga.id),
      });
      navigate('/applicants');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create applicant');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          type="text"
          onClick={() => navigate('/applicants')}
          className="mr-4"
          icon={<ArrowLeftOutlined />}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Applicant</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
              label="Other Names (Optional)"
              {...register('orther_names')}
              error={errors.orther_names?.message}
            />
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Phone Number"
              {...register('phone_number')}
              error={errors.phone_number?.message}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register('gender')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
            <Input
              label="Date of Birth"
              type="date"
              {...register('date_of_birth')}
              error={errors.date_of_birth?.message}
            />
            <Input
              label="Nationality"
              {...register('nationality')}
              error={errors.nationality?.message}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                onChange={(e) => {
                  const stateId = parseInt(e.target.value);
                  setSelectedStateId(stateId || null);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select state</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LGA
              </label>
              <select
                {...register('lga')}
                disabled={!selectedStateId}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">Select LGA</option>
                {lgas.map((lga) => (
                  <option key={lga.id} value={lga.id}>
                    {lga.name}
                  </option>
                ))}
              </select>
              {errors.lga && (
                <p className="mt-1 text-sm text-red-600">{errors.lga.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Input
                label="Address (Optional)"
                {...register('address')}
                error={errors.address?.message}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              onClick={() => navigate('/applicants')}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Create Applicant
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

