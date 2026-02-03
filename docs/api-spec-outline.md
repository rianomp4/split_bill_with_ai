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
- **/api/evidence** (requires auth)
  - POST /api/payments/{id}/evidence — upload evidence pointer (creates EvidenceArtifact owned by authenticated user)
- **/api/reports**
  - GET /api/reports/transactions — export CSV/JSON
- **/api/auth**
  - POST /api/auth/login — login (LoginRequest → LoginResponse; returns JWT)
  - POST /api/auth/register — register new user (UserCreateDTO) 
  - GET /api/auth/me — get current user (requires Bearer token)
- **/api/users**
  - POST /api/users — create user (admin / registration)
  - GET /api/users/{id} — get user profile (self or admin)
  - PUT /api/users/{id} — update user (self or admin)
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
- `LoginRequest` (`username`, `password`)
- `LoginResponse` (`access_token`, `token_type`, `expires_in`, `user`)
- `UserDTO` (`id`, `username`, `npp`, `name`, `phone`)

> A minimal `openapi.yaml` skeleton is included at `openapi/openapi.yaml`.
