# Component Documentation

## UI Components

### Button

A versatile button component with multiple variants.

```tsx
<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `disabled`: boolean
- `onClick`: () => void
- All standard button HTML attributes

### Input

Form input with label and error display.

```tsx
<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  {...register('email')}
/>
```

**Props:**
- `label`: string
- `error`: string
- All standard input HTML attributes

### Table

Data table with customizable columns.

```tsx
<Table
  data={items}
  columns={columns}
  onRowClick={(row) => navigate(`/items/${row.id}`)}
/>
```

**Props:**
- `data`: T[] - Array of data objects
- `columns`: Column<T>[] - Column definitions
- `onRowClick?`: (row: T) => void
- `keyExtractor?`: (row: T) => string | number

### Card

Container component for content sections.

```tsx
<Card title="Title" actions={<Button>Action</Button>}>
  Content here
</Card>
```

**Props:**
- `title?`: string
- `actions?`: ReactNode
- `className?`: string
- `children`: ReactNode

### Badge

Status badge with color variants.

```tsx
<Badge variant="success">Approved</Badge>
```

**Props:**
- `variant`: 'success' | 'warning' | 'error' | 'info' | 'default'
- `children`: ReactNode

### LoadingSpinner

Loading indicator component.

```tsx
<LoadingSpinner size="lg" text="Loading..." fullScreen />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg'
- `text?`: string
- `fullScreen?`: boolean

### ErrorBoundary

Catches React errors and displays fallback UI.

```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### ConfirmDialog

Confirmation dialog for destructive actions.

```tsx
<ConfirmDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleConfirm}
  title="Delete Item"
  message="Are you sure?"
  variant="danger"
/>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `onConfirm`: () => void
- `title`: string
- `message`: string
- `confirmText?`: string
- `cancelText?`: string
- `variant?`: 'danger' | 'warning' | 'info'
- `isLoading?`: boolean

### Toast Notifications

Show toast notifications using the `useToast` hook.

```tsx
const toast = useToast();

toast.showToast('Success!', 'success');
toast.showToast('Error occurred', 'error');
```

**Types:**
- 'success' | 'error' | 'warning' | 'info'

## Layout Components

### Layout

Main application layout with sidebar and header.

```tsx
<Layout>
  <YourContent />
</Layout>
```

### Sidebar

Navigation sidebar component.

### Header

Top header with user menu.

### ProtectedRoute

Route wrapper that requires authentication.

```tsx
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

## Hooks

### useToast

Display toast notifications.

```tsx
const toast = useToast();
toast.showToast('Message', 'success', 5000);
```

### useKeyboardShortcuts

Add keyboard shortcuts to components.

```tsx
useKeyboardShortcuts([
  {
    key: 's',
    ctrl: true,
    action: () => save(),
    description: 'Save'
  }
]);
```

### useGlobalShortcuts

Global keyboard shortcuts (Ctrl+D for dashboard, etc.)

```tsx
useGlobalShortcuts();
```

## Data Hooks

All data hooks follow React Query patterns:

- `useApplicants(params?)` - Fetch applicants
- `useApplicant(id)` - Fetch single applicant
- `useCreateApplicant()` - Create applicant mutation
- `useUpdateApplicant()` - Update applicant mutation
- `useApplications(params?)` - Fetch applications
- `useApplication(id)` - Fetch single application
- `useUpdateApplication()` - Update application mutation
- `usePayments(params?)` - Fetch payments
- `usePayment(id)` - Fetch single payment
- `useUsers(params?)` - Fetch users
- `useUser(id)` - Fetch single user
- `useCreateUser()` - Create user mutation
- `useUpdateUser()` - Update user mutation
- `usePrograms()` - Fetch programs
- `useStates()` - Fetch states
- `useLgas(stateId?)` - Fetch LGAs
- `useDocuments(applicationId?)` - Fetch documents
- `useDocumentTypes()` - Fetch document types

