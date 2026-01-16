# Hydra Admin Dashboard

A modern, feature-rich admin dashboard for the Remedial Portal API built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- 🔐 **JWT Authentication** with automatic token refresh
- 📊 **Dashboard** with statistics and charts
- 👥 **Applicant Management** (List, View, Create, Edit, Export)
- 📝 **Application Management** with status tracking and O-Level results
- 💳 **Payment Management** with reporting
- 👤 **User Management** with role assignment
- 📄 **Document Management** with upload/viewer
- 📈 **Reports & Analytics** with charts and exports
- ⚙️ **Settings** for programs, states, LGAs, and document types
- 🎨 **Modern UI** with Tailwind CSS
- 📱 **Responsive Design**
- ⚡ **Performance Optimized** with code splitting and lazy loading
- 🎯 **UX Enhanced** with loading states, error boundaries, toasts, and keyboard shortcuts

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** for server state management
- **React Router** for routing
- **React Hook Form** + **Zod** for form validation
- **Headless UI** for accessible components
- **Heroicons** for icons
- **Recharts** for data visualization
- **Vitest** + **React Testing Library** for testing

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## 🔧 Configuration

### Environment Variables

Create `.env.development` or `.env.local`:

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Remedial Portal Admin
```

### API Backend

Ensure your Symfony backend is running on `http://localhost:8000` (or update `VITE_API_URL`).

## 📚 Documentation

- [Component Documentation](./COMPONENT_DOCS.md) - UI components and hooks
- [API Integration Guide](./API_INTEGRATION.md) - API endpoints and integration
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Configuration Check](./CONFIGURATION_CHECK.md) - Configuration verification

## 🎯 Project Structure

```
hydra-admin/
├── src/
│   ├── api/              # API client and Hydra integration
│   ├── components/       # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Base UI components
│   ├── features/        # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── applicants/  # Applicant management
│   │   ├── applications/# Application management
│   │   ├── payments/    # Payment management
│   │   ├── users/       # User management
│   │   ├── documents/   # Document management
│   │   ├── reports/     # Reports & Analytics
│   │   ├── settings/    # Settings
│   │   └── dashboard/   # Dashboard
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and types
│   ├── styles/          # Global styles
│   └── test/            # Test setup
├── public/              # Static assets
└── dist/                # Build output
```

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + D` - Go to Dashboard
- `Ctrl/Cmd + A` - Go to Applicants
- `Ctrl/Cmd + P` - Go to Payments
- `Ctrl/Cmd + R` - Go to Reports
- `Ctrl/Cmd + S` - Go to Settings

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📝 Development

### Adding a New Feature

1. Create feature folder in `src/features/`
2. Add route in `src/App.tsx` (lazy-loaded)
3. Add navigation item in `src/components/layout/Sidebar.tsx`
4. Create hooks in `src/hooks/` if needed
5. Add tests in `src/components/` or `src/features/`

### Code Style

- TypeScript strict mode enabled
- ESLint configured
- Prefer functional components
- Use React Query for data fetching
- Use React Hook Form for forms
- Use Tailwind CSS for styling

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy options:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **Docker**: See deployment guide

## 📄 License

Proprietary

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [API Platform](https://api-platform.com/)
