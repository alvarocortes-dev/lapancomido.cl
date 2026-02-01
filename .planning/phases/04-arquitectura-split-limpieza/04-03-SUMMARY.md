# 04-03 Summary: Vercel Subdomain Configuration

**Status:** Ready for Deploy  
**Date:** 2026-02-01

## What was done

### Task 1: Configured CORS for subdomain architecture
Updated `apps/api/src/server.js` with dynamic CORS configuration:

**Production origins:**
- `https://lapancomido.cl`
- `https://www.lapancomido.cl`
- `https://admin.lapancomido.cl`

**Development origins:**
- `http://localhost:3001` (web)
- `http://localhost:3002` (admin)
- `http://localhost:5173` (vite default)

### Task 2: Created Vercel configurations

**apps/web/vercel.json:**
- Framework: Vite
- Build command: Monorepo workspace build
- SPA rewrites configured

**apps/admin/vercel.json:**
- Framework: Vite
- Build command: Monorepo workspace build
- SPA rewrites configured

**apps/api/vercel.json:**
- Uses @vercel/node for serverless functions
- All routes directed to server.js

### Task 3: Improved admin shell
- Updated `apps/admin/index.html` with proper title
- Updated `apps/admin/src/main.jsx` with branded placeholder
- Created `apps/admin/.env.example`

### Task 4: Environment configuration
- Updated `apps/web/.env.example` with API URL pattern
- Created `apps/admin/.env.example` with API URL pattern

## Verification Results
- All builds pass (web, admin, api)
- CORS configuration in place
- All vercel.json files created
- Admin shell renders with placeholder

## Pending: Manual Vercel Setup

The following requires manual configuration in Vercel Dashboard:

### 1. Create API project
- Import `apps/api` from repository
- Set root directory: `apps/api`
- Assign domain: `api.lapancomido.cl`
- Set environment variables:
  - `DATABASE_URL` (copy from existing project)
  - `DIRECT_URL` (copy from existing project)
  - `NODE_ENV=production`

### 2. Create Admin project
- Import `apps/admin` from repository
- Set root directory: `apps/admin`
- Assign domain: `admin.lapancomido.cl`
- Set environment variables:
  - `VITE_API_URL=https://api.lapancomido.cl`

### 3. Update Web project
- Verify existing project uses `apps/web` as root
- Verify domain: `lapancomido.cl`
- Set environment variables:
  - `VITE_API_URL=https://api.lapancomido.cl`

### Verification checklist post-deploy:
- [ ] `https://lapancomido.cl` loads catalog
- [ ] `https://admin.lapancomido.cl` shows placeholder
- [ ] `https://api.lapancomido.cl/api/test` returns JSON
- [ ] Catalog can load products (CORS works)
