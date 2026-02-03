# High-level System Architecture ✅

**Purpose:** Ringkasan arsitektur untuk platform Enterprise-grade Split Bill & Discount Allocation.

## Components

- **Frontend:** Next.js (TypeScript)
  - Initiator Console (create/edit/publish)
  - Participant View (breakdown, pay, upload evidence)
- **Backend:** Node.js + Express (TypeScript)
  - API-first (OpenAPI-ready)
  - Allocation Engine (core business logic)
  - Payments, Evidence, Audit services
- **Database:** PostgreSQL
  - Persistent snapshots, audit logs, RLS (row-level security)
- **Storage:** S3/GCS for `EvidenceArtifact` objects
- **Events & Integrations:** Webhooks + optional Teams/email
- **Security:** RBAC + RLS per transaction row

## Key Architectural Principles 🔧

- **Backend-side calculations:** All allocation logic runs on server and is persisted as immutable snapshots.
- **Versioning & Governance:** Publishing creates a locked `AllocationSnapshot` version and an audit entry.
- **Traceability:** Every final number maps to stored inputs and snapshot versions.
- **Extensibility:** Clear domain modules (Transactions, Allocation, Payments, Evidence, Audit, Reporting, Auth)

## Deployment & Infra Notes

- Containerized services (Docker) behind load balancer
- Managed Postgres with PITR for auditability + point-in-time restores
- IAM for secure object storage and key management

> For quick reference, see `docs/domain-model-and-erd.md` and `docs/api-spec-outline.md` for entity relationships and API endpoints.
