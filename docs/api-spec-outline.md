# API Structure & OpenAPI Outline 🛠️

**Principles:** REST API-first, OpenAPI-ready, clear route groups and webhook events.

## Route Groups (high level)
- **/api/transactions**
  - POST /api/transactions — create draft (TransactionCreateDTO)
  - GET /api/transactions/{id} — transaction detail (includes snapshot refs)
  - POST /api/transactions/{id}/recalculate — recalc draft snapshot
  - POST /api/transactions/{id}/publish — lock snapshot and create version
  - GET /api/transactions/{id}/snapshots — list published versions
- **/api/participants**
  - POST /api/transactions/{id}/participants/{pid}/confirm — participant confirms
- **/api/snapshots**
  - GET /api/snapshots/{id} — snapshot details + allocation lines
- **/api/payments**
  - POST /api/snapshots/{snapshotId}/payments — submit payment
  - POST /api/payments/{id}/verify — verify by finance/auditor
- **/api/evidence**
  - POST /api/payments/{id}/evidence — upload evidence pointer
- **/api/reports**
  - GET /api/reports/transactions — export CSV/JSON
- **/api/webhooks**
  - POST /api/webhooks/events — outgoing event delivery

## Events (webhooks)
- `TRANSACTION_PUBLISHED`
- `PAYMENT_SUBMITTED`
- `PAYMENT_VERIFIED`
- `TRANSACTION_SETTLED`

## Sample DTOs (referencing `docs/example-schemas.md`)
- `TransactionCreateDTO` (merchant, ordered_at, currency, participants, items, discounts, fees)
- `AllocationSnapshotDTO` (version, grand_total, lines[])

> A minimal `openapi.yaml` skeleton is included at `openapi/openapi.yaml`.
