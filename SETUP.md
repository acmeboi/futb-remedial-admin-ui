# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd hydra-admin
npm install
```

## Step 2: Configure Environment

The `.env.development` file is already created with default values. If you need to change the API URL, create a `.env.local` file:

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Remedial Portal Admin
```

## Step 3: Start Development

### Terminal 1: Start Symfony Backend
```bash
# From the parent directory (remedial-portal-api)
symfony server:start
```

### Terminal 2: Start Vite Dev Server
```bash
# From hydra-admin directory
npm run dev
```

## Step 4: Access the Dashboard

Open your browser and navigate to:
- **Admin Dashboard**: http://localhost:5173
- **API**: http://localhost:8000

## Login Credentials

Use the credentials from your Symfony backend. The login endpoint is `/api/login` and expects:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

## Troubleshooting

### CORS Issues
- Ensure `nelmio_cors.yaml` is configured in Symfony
- Check that the API URL in `.env.local` matches your backend

### Authentication Issues
- Verify JWT tokens are being generated correctly
- Check browser console for token storage
- Ensure the API login endpoint returns `access_token` and `refresh_token`

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Next Steps

1. Test the login functionality
2. Explore the dashboard
3. View applicants and applications
4. Customize the UI as needed

