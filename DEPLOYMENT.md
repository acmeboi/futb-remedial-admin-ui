# Deployment Guide

## Production Build

### 1. Build the Application

```bash
cd hydra-admin
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 2. Environment Variables

Create a `.env.production` file or set environment variables:

```bash
VITE_API_URL=https://api.remedial-portal.com
VITE_APP_NAME=Remedial Portal Admin
```

### 3. Deployment Options

#### Option A: Static Hosting (Vercel, Netlify, etc.)

1. **Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **GitHub Pages**:
   - Update `vite.config.ts` to set `base: '/your-repo-name/'`
   - Build and push `dist/` to `gh-pages` branch

#### Option B: Nginx/Apache

1. Copy `dist/` contents to web server directory
2. Configure Nginx:

```nginx
server {
    listen 80;
    server_name admin.remedial-portal.com;
    root /var/www/hydra-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Option C: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t hydra-admin .
docker run -p 80:80 hydra-admin
```

## Performance Optimization

### Code Splitting
- Routes are lazy-loaded automatically
- Large dependencies are code-split

### Caching
- API responses cached for 5 minutes
- Static assets cached by CDN

### Image Optimization
- Use WebP format where possible
- Implement lazy loading for images

## Security

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure backend CORS properly
4. **Token Storage**: Consider httpOnly cookies for production

## Monitoring

- Set up error tracking (Sentry, etc.)
- Monitor API response times
- Track user analytics

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run build`
- Verify all dependencies installed
- Check Node.js version (18+)

### API Connection Issues
- Verify `VITE_API_URL` is correct
- Check CORS configuration
- Verify JWT token handling

### Routing Issues
- Ensure server configured for SPA routing
- Check `base` path in `vite.config.ts`

