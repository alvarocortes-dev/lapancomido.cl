# Phase 2: Sistema de Cotización - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Clientes pueden seleccionar productos del catálogo y enviar una cotización estructurada por WhatsApp al dueño. Incluye: catálogo público con filtros, sistema de selección con cantidades, modal de cotización con datos del cliente, y generación de link wa.me con mensaje pre-formateado.

No incluye: historial de consultas (Phase 6), gestión de productos desde admin (Phase 5), autenticación (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Selección de productos
- Tarjeta clickeable para ver detalle del producto
- Botón "Agregar" inicial, al presionar cambia a controles +/- para cantidad
- Sin límite máximo de cantidad (dueño valida en conversación WhatsApp)
- Productos agotados: visibles pero deshabilitados (grisados, sin botón agregar, texto "Agotado")
- Unidades de medida: "cantidad" (un) o "pack" — configurado por producto en admin

### Vista detalle producto
- Claude decide el formato (modal, página, expandir) priorizando mobile-first y navegación fluida

### Barra de selección
- Aparece al agregar ≥1 producto
- Muestra: cantidad de productos, precio total, botón "Cotizar"
- Expandible al tocar para ver lista de productos seleccionados
- Persistencia: solo sesión (no localStorage persistente)
- Posición y si permite editar cantidades: Claude decide

### Modal de cotización
- Campos requeridos: Nombre completo, Celular
- Campos opcionales: Email, Comentarios
- Celular: selector de código país con lista mundial, Chile (+56) preseleccionado
- Cliente puede editar su selección (cantidades, eliminar) dentro del modal
- Precios: visibles solo si están habilitados en config admin (toggle global)

### Formato mensaje WhatsApp
- Estructura definida por usuario:
```
[Saludo configurable desde admin]

Cliente: [ Nombre Apellido ]
Celular: [ +56 9 1234 5678 ]

Productos:
- Producto x 1 un = $1.000
- Producto x 4 un = $4.000 ($1.000 c/u)
- Producto x 2 pack (6 un c/p) = $6.000 ($3.000 c/p)

Total a consultar: $11.000

Comentario: [si existe]

Favor confirmar stock, gracias!
```
- Saludo inicial: configurable desde admin (default: "Hola! Hay pan? <3")
- Cierre: fijo "Favor confirmar stock, gracias!"
- Precios en mensaje: solo si habilitados en config admin
- Email: NO se incluye en mensaje (se guarda en BD para promociones)
- Comentario: se incluye antes del cierre si existe
- Packs: mostrar contenido, ej: "x 2 pack (6 un c/p)"

### Configuración admin (usado en esta fase)
- Toggle visibilidad de precios (global)
- Saludo personalizable para mensaje WhatsApp
- Número WhatsApp destino (configurable, no hardcodeado)

### Claude's Discretion
- Diseño visual del detalle de producto (modal vs página vs expandir)
- Posición exacta de la barra de selección (sticky bottom recomendado para mobile)
- Si la barra expandida permite editar cantidades
- Animaciones y transiciones
- Diseño del selector de código país

</decisions>

<specifics>
## Specific Ideas

**Formato mensaje WhatsApp proporcionado por usuario:**
```
Hola! Hay pan? <3

Cliente: [ Nombre Apellido ]
Celular: [ +56 9 1234 5678 ]

Productos:
- Ejemplo x 1 un = $0.000
- Ejemplo x 4 un = $00.000 ( $0000 c/u )
- Ejemplo x 2 pack = $00.000  ( $0000 c/p )

Total a consultar: $00.000

Favor confirmar stock, gracias!
```

**Contexto de negocio:**
- Zona turística (Caldera, Chile) con visitantes extranjeros frecuentes — por eso selector de país
- Dueño atiende personalmente por WhatsApp — cotización inicia conversación, no es compra directa
- Precios pueden ocultarse cuando hay fluctuación o promociones especiales

</specifics>

<deferred>
## Deferred Ideas

- **Stock en tiempo real**: Conectar con app de panadería para control de inventario — futuro milestone
- **Límite de cantidad por stock**: Cuando exista stock real, limitar cantidad máxima — futuro milestone
- **Email para promociones**: Sistema de envío de promociones a emails recopilados — Phase 6 o posterior

</deferred>

---

*Phase: 02-sistema-cotizacion*
*Context gathered: 2026-01-30*
