# Next Steps & Implementation Plan ▶️

**Short-term priorities (MVP)**
1. Scaffold repo: monorepo or two-projects (frontend Next.js + backend Express TS)
2. Create DB migrations for core tables + RLS policy stubs
3. Implement Allocation Engine with strong unit tests (property tests for sums/rounding)
4. Build minimal API endpoints: create transaction, recalc, publish, submit payment, verify
5. Basic UI screens: Transaction Editor, Snapshot Preview, Participant Payment view

**Medium-term**
- OpenAPI spec complete + API docs
- Webhook delivery + retry semantics
- Evidence storage integration (S3) + signed URLs
- Reporting endpoints & materialized views for BI
- RBAC + SSO integration (OIDC)

**Long-term / Nice-to-have**
- Audit trail viewer with full diff + binary evidence attachment
- Integrations: Teams notifications, finance tools, CSV exports scheduling
- Multi-currency support & FX rounding policies

**Deliverables I can produce next:**
- SQL DDL migration files
- Minimal OpenAPI YAML (`openapi/openapi.yaml`) and Express route stubs
- Allocation engine reference implementation with unit tests

Choose the next artifact you want me to generate and I’ll proceed.
