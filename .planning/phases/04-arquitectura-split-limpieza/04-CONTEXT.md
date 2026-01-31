# Phase 4: Arquitectura Split + Limpieza - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Limpiar código legacy del e-commerce antiguo (auth clientes, carrito, checkout, órdenes) y configurar subdominios separados para web público, admin y API. El objetivo es reducir el bundle JS a < 800KB y preparar la arquitectura para las fases siguientes.

</domain>

<decisions>
## Implementation Decisions

### Estrategia de limpieza
- Enfoque **agresivo**: eliminar todo lo que no se usa activamente HOY
- Sin respaldo extra: confiar en git para recuperar si hace falta
- Arreglar imports rotos inmediatamente (no dejar que el build falle)
- **Meta de bundle < 800KB es prioridad alta** (actual: 1,234KB)

### Componentes admin existentes
- **Eliminar completamente** los 6 componentes de `components/admin/`
- **Eliminar completamente** los 5 componentes de `components/customer/`
- **Eliminar** LoginForm.jsx y RegisterForm.jsx
- El admin se construirá desde cero en Phase 6
- **Crear shell básico de apps/admin** con placeholder "Coming Soon" para verificar subdominios

### Manejo de tablas/modelos DB
- La BD es nueva en Supabase (no hay data legacy que proteger)
- **Limpiar schema.prisma**: quitar modelos que no se usan
- **Eliminar tablas vacías** que no se usarán (orders, cart_items, addresses, favorites, etc.)
- **Eliminar tabla users** y recrear en Phase 5 con schema correcto para admin auth

### Configuración de subdominios
- Dominio lapancomido.cl ya registrado y configurado
- Ya existe 1 proyecto Vercel sirviendo apps/web
- **API se desplegará en Vercel** como proyecto separado (Serverless Functions)
- Crear proyecto Vercel para apps/admin

### Claude's Discretion
- Estructura exacta de subdominios (3 separados vs 2 con API embebida)
- Configuración específica de CORS
- Estructura de vercel.json para cada proyecto

</decisions>

<specifics>
## Specific Ideas

- Bundle actual: 1,234KB → meta < 800KB (reducir ~400KB)
- El frontend público debe quedar "limpio" sin rastros del e-commerce antiguo
- apps/admin solo necesita un placeholder por ahora, la funcionalidad viene en Phase 5-6

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-arquitectura-split-limpieza*
*Context gathered: 2026-01-31*
