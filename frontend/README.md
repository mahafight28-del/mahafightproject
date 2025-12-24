# MAHA FIGHT - Frontend

Minimal Vite + React + TypeScript scaffold for the MAHA FIGHT Dealer & Franchise Management frontend.

Quick start (from repository root):

```powershell
cd frontend
npm install
npm run dev
```

Main files:
- [frontend](frontend)
  - [src/routes/AppRoutes.tsx](frontend/src/routes/AppRoutes.tsx) - route config
  - [src/context/AuthContext.tsx](frontend/src/context/AuthContext.tsx) - auth provider and hook
  - [src/components/RequireAuth.tsx](frontend/src/components/RequireAuth.tsx) - auth guard
  - [src/services/api.ts](frontend/src/services/api.ts) - axios instance
  - Dealers: [src/pages/Dealers](frontend/src/pages/Dealers) - `/dealers`, `/dealers/:id`
  - Franchises: [src/pages/Franchises](frontend/src/pages/Franchises) - `/franchises`, `/franchises/:id`
    - Create/Edit routes available: `/dealers/new`, `/dealers/:id/edit`, same pattern for products, invoices, sales, users, commissions.
