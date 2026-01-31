# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Los clientes pueden seleccionar productos del catálogo y enviar una consulta estructurada por WhatsApp al dueño en menos de 30 segundos.
**Current focus:** Phase 4 - Arquitectura Split (next up)

## Current Position

Phase: 3 of 8 (Mobile-First Responsive) - COMPLETE ✓
Next: Phase 4 - Arquitectura Split
Status: Ready for Phase 4

Progress: [█████████░░░░░░░░░░░] 45%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: ~8 min
- Total execution time: ~80 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 3 | 15 min | 5 min |
| 02 | 4 | 50 min | 12.5 min |
| 03 | 3 | 15 min | 5 min |

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

**Phase 1:**
- [01-01]: npm workspaces con * en lugar de workspace:* (compatibilidad npm)
- [01-01]: Puertos asignados: web=3001, admin=3002, api=3000
- [01-02]: Manual schema creation instead of introspection (no DB credentials)
- [01-02]: Dual CJS/ESM exports for database package (API is CommonJS)
- [01-02]: Deprecated db.js instead of deleting (safer migration)
- [01-03]: Permissive lint thresholds for Phase 1 (warnings allowed, will tighten later)
- [01-03]: ESLint 9 flat config for all workspaces
- [01-03]: Lighthouse thresholds: 80% perf (warn), 90% accessibility (error)

**Phase 2:**
- [02-01]: No migration created - schema synced manually on production
- [02-01]: Default store config auto-creation on first access
- [02-02]: sessionStorage instead of localStorage for selection (clears on tab close)
- [02-02]: Context + hook separation pattern for reusability
- [02-03]: QuantityControl reusable across ProductCard and SelectionBar
- [02-03]: Store config props flow from CatalogPage to child components
- [02-04]: Migrated product.controller.js to Prisma (was blocking)
- [02-04]: Migrated categories.controller.js to Prisma (was blocking)
- [02-04]: Added missing Prisma models for images and categories
- [02-04]: Used Supabase production database directly (no local DB)
- [02-04]: Removed Login/Cart buttons (not needed per requirements)
- [02-04]: SelectionBar uses brand colors (#F5E1A4, #262011)
- [02-04]: Sticky SelectionBar between pagination and footer
- [02-04]: Header simplified: Logo | Search | Inicio | Catálogo | Contacto

**Phase 3:**
- [03-01]: Header hamburger menu with drawer from right
- [03-01]: Footer stacks vertically on mobile, horizontal on desktop
- [03-01]: SearchBar width: w-full md:w-80 (was fixed w-80)
- [03-01]: MainLayout padding: px-3 sm:px-4 py-4
- [03-02]: HomePage BentoGrid replaced with responsive grid (2-3-4 cols)
- [03-02]: HomePage Elígenos section: video first on mobile, text first on desktop
- [03-02]: HomePage slider height responsive: h-48 sm:h-64 md:h-80 lg:h-96
- [03-02]: ProductPage image removed 38rem fixed size, now aspect-square
- [03-02]: ProductPage thumbnails scrollable horizontally on mobile
- [03-02]: CatalogPage pagination with min-h-[44px] touch targets
- [03-03]: All inputs now 16px font-size (prevents iOS zoom)
- [03-03]: All inputs/buttons now min-h-[44px] for touch targets
- [03-03]: LoginPage/RegisterPage removed calc() fixed heights
- [03-03]: ContactPage form fully responsive

**Phase 3 - UI Polish (additional):**
- Header: sticky/fixed on mobile, static on desktop
- Header: "Panadería de Masa Madre" single line text in mobile
- Footer: no top margin on mobile (md:mt-8 only desktop)
- HomePage: removed "Productos" title
- HomePage: BentoGrid dynamic with 10s interval, 3s crossfade transitions
- HomePage: grid full width (removed max-w-7xl)
- HomePage: consistent mb-8 spacing between sections on mobile
- HomePage: slider object-contain on desktop, no top margin (sm:mt-0)
- CatalogPage: products count + sort button inline on mobile

### What's Working

- ✅ Catálogo de productos con imágenes y precios
- ✅ Filtro por categorías funcional
- ✅ Selección de productos con controles +/-
- ✅ Barra de selección flotante con sticky behavior
- ✅ Modal de cotización con formulario
- ✅ Generación de link WhatsApp con mensaje estructurado
- ✅ Guardado de leads (email/teléfono) en BD
- ✅ Header con menú hamburguesa en móvil (sticky/fixed)
- ✅ Footer responsive (stack en móvil)
- ✅ HomePage responsive (slider, grid dinámico con crossfade, elígenos)
- ✅ ProductPage responsive
- ✅ CatalogPage responsive (inline count + sort)
- ✅ Forms con touch targets 44px y font-size 16px
- ✅ Conexión directa a Supabase

### Blockers/Concerns

None.

**Research flags from research/SUMMARY.md:**
- Phase 5 (OTP): Device fingerprinting libraries may need evaluation
- Lighthouse 100/100/100/100: May need to accept 95+ if Ant Design tree-shaking insufficient
- Quotation history retention: Schema design needs decision during Phase 7

**Lint cleanup needed:**
- 78 lint errors in web app (pre-existing)
- 10 warnings in api app (pre-existing)
- Should be addressed in future code quality phase

## What's Next

### Phase 4: Arquitectura Split + Limpieza
- Plan 04-01: Limpieza frontend (auth/cart/checkout legacy)
- Plan 04-02: Limpieza API (rutas y controladores no usados)
- Plan 04-03: Configuración Vercel subdominios + CORS

**Código legacy a eliminar:**

Frontend (apps/web):
- `pages/DashboardPage.jsx` - No usado
- `pages/ForgotPasswordPage.jsx` - No usado
- `components/admin/*` - 6 archivos (mover a apps/admin después)
- `components/customer/*` - 5 archivos (eliminar, no hay clientes)
- `components/LoginForm.jsx`, `RegisterForm.jsx` - No usados
- `hooks/useEncrypt.jsx`, `useProductImages.jsx`, `useStorage.jsx` - Revisar uso

API (apps/api):
- `controllers/address.controller.js` - Direcciones de clientes
- `controllers/auth.controller.js` - Auth de clientes
- `controllers/favorites.controller.js` - Favoritos de clientes
- `controllers/gateways.controller.js` - Pasarelas de pago
- `controllers/location.controller.js` - Ubicación
- `controllers/order.controller.js` - Órdenes/pedidos
- `controllers/user.controller.js` - Usuarios clientes
- Rutas correspondientes a eliminar

### Upcoming Phases Summary
| Phase | Focus | Estimated Plans |
|-------|-------|-----------------|
| 4 | Limpieza + Subdominios | 3 |
| 5 | Auth OTP | 3 |
| 6 | Admin Panel | 3 |
| 7 | Historial | 2 |
| 8 | SEO/Perf | 2 |

## Session Continuity

Last session: 2026-01-31
Stopped at: Ajustes UI (toastify, márgenes, header padding)
Resume file: None
Next action: Begin Phase 4 - Plan 04-01 (Limpieza frontend)

---
*State initialized: 2026-01-30*
*Last updated: 2026-01-31*
