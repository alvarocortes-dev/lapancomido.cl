# Phase 8 Context: Auditoría de Código

## User Vision

El usuario quiere una auditoría exhaustiva del código antes de optimizar para Lighthouse. El objetivo es:

1. **Verificar qué código se usa realmente** - No eliminar a ciegas, sino probar cada pieza
2. **Segmentar claramente la API** - Rutas admin bajo `/api/admin/*` (ya hecho)
3. **Arquitectura de 3 proyectos** - lapancomido.cl, admin.lapancomido.cl, api.lapancomido.cl (separado, no serverless)

## Decisiones Tomadas

| Decisión | Valor | Razón |
|----------|-------|-------|
| API architecture | Proyecto separado (api.lapancomido.cl) | Express ya configurado con Swagger, middlewares, Cloudinary |
| Admin routes prefix | `/api/admin/*` | Ya implementado, clara separación |
| Discovery approach | Pruebas de uso, no eliminación ciega | Mayor seguridad |

## Estado Actual del Codebase

### Frontend (apps/web) - 29 archivos JS/JSX

**Activos y en uso:**
```
src/
├── main.jsx (entry point)
├── App.jsx
├── router/RouterManager.jsx
├── layouts/MainLayout.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── CatalogPage.jsx
│   └── Page404.jsx
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── SearchBar.jsx
│   ├── Categories.jsx
│   ├── ContactModal.jsx
│   ├── Credits.jsx
│   ├── catalog/
│   │   ├── ProductCard.jsx
│   │   ├── ProductModal.jsx
│   │   └── QuantityControl.jsx
│   └── selection/
│       ├── QuotationModal.jsx
│       └── SelectionBar.jsx
├── context/SelectionProvider.jsx
├── hooks/
│   ├── useProducts.jsx
│   └── useSelection.jsx
└── helpers/
    ├── api.jsx
    ├── cloudinaryUpload.js
    ├── cloudinaryUpload.jsx (duplicado?)
    ├── formatDateTimeChile.helper.js
    ├── formatPrice.helper.js
    ├── getProductData.helper.js
    ├── showUniqueToast.helper.js
    └── whatsapp.helper.js
```

### API (apps/api) - Rutas activas

| Ruta | Controlador | Usado por |
|------|-------------|-----------|
| `/api/products` | product.controller | web (catálogo) |
| `/api/categories` | categories.controller | web (filtros) |
| `/api/store/*` | store.controller | web (config) |
| `/api/contact` | contact.controller | web (leads) |
| `/api/product-images` | (routes file) | web (imágenes) |
| `/api/upload` | (uploadRoute) | admin (subida) |
| `/api/admin/products` | adminProducts.controller | admin (CRUD) |

### Bundle Size

Actual: **1,234KB** (1.2MB)
Objetivo post-auditoría: **<500KB**

Hipótesis de causas:
- Ant Design (tree-shaking insuficiente?)
- react-toastify
- Dependencias no usadas en package.json

## Preguntas a Resolver en Esta Fase

1. **¿Qué helpers se usan realmente?**
   - `cloudinaryUpload.js` vs `cloudinaryUpload.jsx` - ¿duplicado?
   - `formatDateTimeChile.helper.js` - ¿se usa?
   - `getProductData.helper.js` - ¿se usa?

2. **¿Qué endpoints API se llaman desde el frontend?**
   - Trace de todas las llamadas fetch/axios
   - Comparar con rutas definidas en API

3. **¿Qué dependencias npm son necesarias?**
   - Auditar package.json de cada app
   - Identificar dependencias no importadas

4. **¿Por qué el bundle es tan grande?**
   - Bundle analyzer para identificar culpables
   - Evaluar tree-shaking de Ant Design

## Scope de la Fase

### Incluido:
- Dead code detection (imports no usados)
- API endpoint tracing
- Bundle analysis
- Dependency audit
- Eliminación de código confirmado como muerto

### Excluido:
- Code splitting (Phase 9)
- Lazy loading (Phase 9)
- Optimización de imágenes (Phase 9)
- SEO (Phase 9)

## Essential Features

1. Script/herramienta que trace imports desde entry points
2. Script que liste llamadas API desde frontend
3. Bundle analyzer configurado y ejecutable
4. Reporte de dead code antes de eliminar
5. Confirmación del usuario antes de eliminar código

## Boundaries

- NO modificar UI actual (HomePage, CatalogPage, etc.)
- NO agregar features nuevas
- NO cambiar arquitectura (ya decidida: API separada)
- SOLO auditar, reportar, y limpiar con confirmación
