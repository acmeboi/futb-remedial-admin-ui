import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ToastProvider } from './components/ui/ToastContainer';
import { useGlobalShortcuts } from './hooks/useKeyboardShortcuts';
import { isTokenValid } from './lib/authUtils';

// Lazy load routes for code splitting
const Login = lazy(() => import('./features/auth/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const ApplicantsList = lazy(() => import('./features/applicants/ApplicantsList').then(m => ({ default: m.ApplicantsList })));
const ApplicantDetail = lazy(() => import('./features/applicants/ApplicantDetail').then(m => ({ default: m.ApplicantDetail })));
const ApplicantCreate = lazy(() => import('./features/applicants/ApplicantCreate').then(m => ({ default: m.ApplicantCreate })));
const ApplicationsList = lazy(() => import('./features/applications/ApplicationsList').then(m => ({ default: m.ApplicationsList })));
const ApplicationDetail = lazy(() => import('./features/applications/ApplicationDetail').then(m => ({ default: m.ApplicationDetail })));
const UsersList = lazy(() => import('./features/users/UsersList').then(m => ({ default: m.UsersList })));
const UserDetail = lazy(() => import('./features/users/UserDetail').then(m => ({ default: m.UserDetail })));
const UserCreate = lazy(() => import('./features/users/UserCreate').then(m => ({ default: m.UserCreate })));
const PaymentsList = lazy(() => import('./features/payments/PaymentsList').then(m => ({ default: m.PaymentsList })));
const PaymentDetail = lazy(() => import('./features/payments/PaymentDetail').then(m => ({ default: m.PaymentDetail })));
const Reports = lazy(() => import('./features/reports/Reports').then(m => ({ default: m.Reports })));
const Settings = lazy(() => import('./features/settings/Settings').then(m => ({ default: m.Settings })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes - cache API responses
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
    },
  },
});

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  useGlobalShortcuts();

  // Check if user should be redirected from login page
  const shouldRedirectFromLogin = isAuthenticated && isTokenValid();

  return (
    <Routes>
      <Route
        path="/login"
        element={shouldRedirectFromLogin ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applicants"
        element={
          <ProtectedRoute>
            <Layout>
              <ApplicantsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applicants/new"
        element={
          <ProtectedRoute>
            <Layout>
              <ApplicantCreate />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applicants/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ApplicantDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Layout>
              <ApplicationsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ApplicationDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Layout>
              <PaymentsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <PaymentDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <UsersList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute>
            <Layout>
              <UserCreate />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <UserDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <AppRoutes />
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

