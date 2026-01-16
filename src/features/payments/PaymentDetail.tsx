import { useParams, useNavigate } from 'react-router-dom';
import { usePayment } from '../../hooks/usePayments';
import { Card } from '../../components/ui/Card';
import { Button } from 'antd';
import { formatDateTime } from '../../lib/utils';
import { ArrowLeftOutlined } from '@ant-design/icons';

export function PaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: payment, isLoading, error } = usePayment(id || '');

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading payment...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading payment.</p>
        <Button className="mt-4" onClick={() => navigate('/payments')}>
          Back to Payments
        </Button>
      </div>
    );
  }

  const applicant = typeof payment.applicant === 'object' ? payment.applicant : null;

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          type="text"
          onClick={() => navigate('/payments')}
          className="mr-4"
          icon={<ArrowLeftOutlined />}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Payment Information">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
              <dd className="mt-1 text-sm text-gray-900">#{payment.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Transaction Reference</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {payment.transaction_reference || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                ₦{parseFloat(payment.amount || '0').toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateTime(payment.created_at)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateTime(payment.updated_at)}</dd>
            </div>
          </dl>
        </Card>

        {applicant && (
          <Card title="Applicant Information">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Applicant Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {applicant.first_name} {applicant.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{applicant.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{applicant.phone_number}</dd>
              </div>
              <div className="pt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/applicants/${applicant.id}`)}
                >
                  View Applicant Details
                </Button>
              </div>
            </dl>
          </Card>
        )}
      </div>
    </div>
  );
}

