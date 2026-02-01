# Phase 7: Historial de Consultas - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Sistema que guarda cada cotización WhatsApp enviada al momento del click y permite al admin ver el historial de consultas con detalle de productos. Cada consulta almacena IDs de productos + snapshot de nombre/precio al momento de la consulta.

</domain>

<decisions>
## Implementation Decisions

### Data Capture Timing
- Save on button click ("Enviar por WhatsApp") — before WhatsApp opens
- Silent save — user sees no feedback, flow unchanged
- If save fails (network error) — continue to WhatsApp anyway, don't block
- Store product IDs + snapshot of name/price at consultation time (historical accuracy)

### History List Display
- Full summary per row: date, customer name, phone, product count, total amount
- Default sort: newest first (most recent at top)
- Filtering: search by customer name + date range filter
- **Default filter: últimos 30 días** (pre-applied on load)
- User can freely change date range (desde/hasta)
- Pagination (not infinite scroll) — 10-20 per page

### Consultation Detail View
- Modal popup on row click (not inline expand or separate page)
- Full product info: product name, quantity, unit price, subtotal per line
- Customer info: name + phone number
- Structured data only (products table) — no raw WhatsApp message text

### Data Retention
- Keep all consultations forever (no auto-delete)
- No manual delete option — all data is preserved
- No export feature (view in admin panel only)

### Claude's Discretion
- Exact modal design and layout
- Pagination controls style (Antd default)
- Empty state when no consultations in date range
- How to handle deleted products in historical consultations

</decisions>

<specifics>
## Specific Ideas

- Date filter should default to last 30 days but allow full freedom to change range
- Total amount column shows sum of all line items (qty × price)
- Phone number should be displayed formatted for Chile (+56 prefix)

</specifics>

<deferred>
## Deferred Ideas

- **Admin PWA (installable app):** Admin panel should be installable as PWA with "Add to Home Screen" on mobile. Requires manifest.json, service worker, icons. → Consider adding to Phase 9 (SEO & Performance) or as separate quick plan.

</deferred>

---

*Phase: 07-historial-consultas*
*Context gathered: 2026-02-01*
