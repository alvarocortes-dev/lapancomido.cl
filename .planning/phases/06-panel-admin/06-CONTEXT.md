# Phase 6: Panel Admin - Context

## Phase Goal

Admin puede gestionar productos, categorías y contenido del sitio desde admin.lapancomido.cl

## Dependencies

- Phase 5 complete (auth system with OTP, device trust, JWT)
- Admin frontend has login UI, AuthContext, navigation shell
- API has admin routes for products (legacy raw SQL - needs migration to Prisma)
- Database schema has products, categories, images, stock, store_config tables

## Success Criteria

1. Admin puede crear, editar, eliminar y habilitar/deshabilitar productos
2. Admin puede marcar productos como "agotado" (toggle available)
3. Admin puede subir/cambiar imágenes de productos vía Cloudinary
4. Admin puede crear, editar, eliminar categorías y asignarlas a productos
5. Admin puede editar contenido del Home (textos, imágenes, info contacto)
6. Admin puede configurar visibilidad de precios (mostrar/ocultar globalmente)

## Existing Assets

### API (apps/api/)

**Need migration to Prisma:**
- `src/controllers/adminProducts.controller.js` - Uses raw SQL, needs Prisma migration
  - getAdminProducts, createProduct, updateProductDetails, updateStock, deleteMultipleProducts
  - Has Cloudinary integration for image upload/delete

**Already using Prisma:**
- `src/controllers/product.controller.js` - getProducts, getProductDetail, createProduct, updateProduct, deleteProduct
- `src/controllers/categories.controller.js` - getCategories (read-only)

**Routes:**
- `src/routes/admin.routes.js` - Product management routes (no auth middleware yet!)

**Missing:**
- Auth middleware on admin routes
- Categories CRUD (only read exists)
- Store config CRUD
- Image upload endpoint

### Admin Frontend (apps/admin/)

**Existing:**
- `src/main.jsx` - App shell with navigation (Dashboard, Settings)
- `src/context/AuthContext.jsx` - JWT auth, token persistence
- `src/api/auth.js` - Auth API client
- `src/pages/LoginPage.jsx` - Multi-step login
- `src/pages/SettingsPage.jsx` - Logout all devices

**Missing:**
- Product list/grid page
- Product create/edit form
- Categories management page
- Store config/content page
- API client for products, categories, store config
- Image upload component

### Database Schema

```prisma
model products { ... }           // Core product data
model product_img { ... }        // Cloudinary images (missing cloudinary_public_id!)
model categories { ... }         // Category list
model categories_products { ... }// Many-to-many junction
model stock { ... }              // Product stock
model store_config { ... }       // Store settings (whatsapp, greeting, show_prices)
```

**Schema Gap:** `product_img` missing `cloudinary_public_id` field needed for deletion.

## Technical Decisions

1. **Migrate adminProducts.controller.js to Prisma** - Currently uses raw SQL
2. **Add cloudinary_public_id to product_img** - Required for image deletion
3. **Add auth middleware to admin routes** - Currently unprotected
4. **Use Ant Design for admin UI** - Already in web app, consistent styling
5. **Direct Cloudinary upload** - Use Cloudinary widget or unsigned upload preset
6. **Simple navigation** - Add Products, Categories, Settings tabs

## Plan Structure

### Plan 06-01: CRUD Productos with Cloudinary Upload
- Migrate adminProducts.controller.js to Prisma
- Add cloudinary_public_id to schema
- Add auth middleware to admin routes
- Create ProductsPage with list/grid view
- Create ProductForm with image upload

### Plan 06-02: Gestión de Categorías  
- Create categories CRUD controller
- Create CategoriesPage with list and inline editing
- Category assignment in ProductForm

### Plan 06-03: Edición Contenido Home + Configuración Precios
- Create store_config CRUD controller
- Create ConfigPage for price visibility, contact info
- Content editing for home page (if needed)

## Environment Variables Required

**API (already in .env):**
- `JWT_SECRET` - Token signing
- `DATABASE_URL` - Supabase connection

**New for Cloudinary:**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY` 
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET` (for unsigned uploads from frontend)

---
*Created: 2026-02-01*
