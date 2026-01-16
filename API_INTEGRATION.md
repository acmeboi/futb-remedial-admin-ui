# API Integration Guide

## Overview

The Hydra Admin Dashboard integrates with the Symfony API Platform backend using the Hydra JSON-LD format.

## Authentication

### Login Flow

```typescript
POST /api/login
Body: { email: string, password: string }
Response: {
  access_token: string,
  refresh_token: string,
  id: number,
  email: string,
  roles: string[]
}
```

### Token Refresh

```typescript
POST /api/token/refresh
Body: { refresh_token: string }
Response: { token: string }
```

Tokens are automatically refreshed when expired via axios interceptors.

## API Endpoints

### Applicants

- `GET /api/applicants` - List applicants (supports pagination, search)
- `GET /api/applicants/{id}` - Get applicant detail
- `POST /api/applicants` - Create applicant
- `PATCH /api/applicants/{id}` - Update applicant

### Applications

- `GET /api/applications` - List applications (supports status filter)
- `GET /api/applications/{id}` - Get application detail
- `PATCH /api/applications/{id}` - Update application status

### Payments

- `GET /api/payments` - List payments
- `GET /api/payments/{id}` - Get payment detail

### Users

- `GET /api/users` - List users
- `GET /api/users/{id}` - Get user detail
- `POST /api/users` - Create user
- `PATCH /api/users/{id}` - Update user

### Documents

- `GET /api/application_documents` - List documents (supports application filter)
- `POST /api/application_documents` - Upload document (multipart/form-data)
- `DELETE /api/application_documents/{id}` - Delete document

### Programs

- `GET /api/programs` - List programs
- `POST /api/programs` - Create program
- `PATCH /api/programs/{id}` - Update program
- `DELETE /api/programs/{id}` - Delete program

### States & LGAs

- `GET /api/states` - List states
- `GET /api/lgas` - List LGAs (supports state filter)

## Hydra Format

All responses follow the Hydra JSON-LD format:

```json
{
  "@context": "/api/contexts/Applicant",
  "@id": "/api/applicants",
  "@type": "hydra:Collection",
  "hydra:member": [...],
  "hydra:totalItems": 100,
  "hydra:view": {
    "@id": "/api/applicants?page=2",
    "hydra:next": "/api/applicants?page=3"
  }
}
```

## React Query Integration

The app uses React Query for data fetching:

```typescript
const { data, isLoading, error } = useApplicants({
  page: 1,
  itemsPerPage: 20,
  search: 'john'
});
```

## Error Handling

- 401 errors trigger automatic token refresh
- Failed refresh redirects to login
- Network errors show toast notifications
- Error boundaries catch React errors

## Request Headers

All authenticated requests include:
```
Authorization: Bearer {access_token}
Accept: application/ld+json
Content-Type: application/ld+json
```

## Pagination

Pagination is handled via Hydra view links:
- `hydra:first` - First page
- `hydra:last` - Last page
- `hydra:previous` - Previous page
- `hydra:next` - Next page

## Filtering

Filters are passed as query parameters:
- `?status=pending` - Filter by status
- `?name=john` - Search by name
- `?application.id=123` - Filter by application

