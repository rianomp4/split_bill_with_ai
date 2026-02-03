# Prompt: Enterprise-grade Split Bill & Discount Allocation Platform (PMO-like Governance)

You are a **senior enterprise software architect** and **product/PMO governance expert**.

Build an **enterprise-grade Split Bill & Discount Allocation** platform for office use — **not** a simple bill calculator, **not** a task app.

The system must ensure:
- **Transparent calculation** (every number can be traced)
- **Governance & control** (publish/lock, change via versioning)
- **Auditability** (immutable audit log, evidence artifacts)
- **Payment monitoring** (who paid / not paid, reminders)
- **All calculations are persisted** to the database as official snapshots

---

## 0) Technology Stack (mandatory)
- **Frontend:** Next.js (TypeScript)
- **Backend:** Node.js Express (TypeScript)
- **Database:** PostgreSQL
- **API style:** REST API-first (OpenAPI-ready)
- **Security:** RBAC + row-level authorization per transaction

> Notes: ORM/validation libraries are allowed but should be kept pragmatic (e.g., Prisma optional). No “demo-only” in-memory state for core calculation results.

---

## 1) Target Users & Roles (RBAC)
Implement clear role-based access with separation of duties:

1. **Initiator / Payer (Transaction Owner)**
   - Creates transaction, inputs participants/items/discounts/fees
   - Publishes invoice snapshot
   - Monitors and manages payment status
2. **Participant**
   - Views their breakdown (items, discount share, fee share, rounding)
   - Confirms participation, uploads proof of payment
3. **Finance / Treasurer (Optional)**
   - Read-only reporting, export, reconciliation support
4. **Auditor (Read-only)**
   - Evidence-based access to immutable logs, snapshots, and artifacts

---

## 2) Core Domain Model (MANDATORY) + Relationships
All objects must support:
- **Lifecycle state** (Draft → Published → Settled → Archived)
- **Versioning** (each publish produces a new immutable snapshot version)
- **Audit log** for every mutation (who/what/when/before-after)

### Entities
- **Merchant/Restaurant**
- **Transaction**
  - fields: restaurant, ordered_at, currency, notes, state, current_version
- **TransactionParticipant**
  - participant identity, role in transaction, confirmation status
- **OrderItem**
  - name, normal_price, quantity, owner_participant_id
- **Discount**
  - type: `PERCENT` | `FIXED_AMOUNT`
  - scope: `TRANSACTION_WIDE` | `ITEM_SCOPED` | `PARTICIPANT_SCOPED`
  - stacking rules: priority/order + enabled/disabled
- **AdditionalFee**
  - type: delivery/packaging/service/etc
  - allocation_method: `PROPORTIONAL` | `EQUAL` | `CUSTOM`
- **AllocationSnapshot**
  - version number, locked_at, calculated totals, checksum/hash (optional)
- **AllocationLine**
  - per participant: subtotal, discount_share, fee_share, rounding_adjustment, final_due
- **Payment**
  - status: unpaid/partial/paid/verified
  - amount_paid, paid_at, payment_method, reference
- **EvidenceArtifact**
  - receipt/promo proof/transfer proof metadata (secure storage pointer)
- **AuditLog**
  - append-only: event_type, actor, timestamp, object, old/new (or diff)

**Explicit relationships**
- Transaction 1..* Participants
- Participant 1..* OrderItems
- Transaction 0..* Discounts
- Transaction 0..* AdditionalFees
- Transaction 1..* AllocationSnapshots
- AllocationSnapshot 1..* AllocationLines (per participant)
- Participant 0..* Payments
- Transaction/Payment 0..* EvidenceArtifacts
- All objects 0..* AuditLogs

---

## 3) Non-negotiable Capabilities

### A. Transaction Intake (standardized)
Initiator inputs:
- Restaurant name
- Order date/time
- Participants list
- Items per participant: item name, normal price, qty
- Discounts: transaction-wide and/or scoped
- Additional fees: delivery/packaging/etc

System stores all inputs in PostgreSQL, with Draft lifecycle.

---

### B. Allocation Engine (core business logic)
Backend must calculate and persist results. Do **not** rely only on frontend calculations.

#### Allocation rules (baseline)
1. **Participant subtotal**
   - `subtotal_i = Σ (normal_price * qty) for items owned by participant i`

2. **Transaction-wide discount allocation (proportional)**
   - `discount_share_i = (subtotal_i / total_subtotal) * total_discount_amount`
   - If discount is %: `total_discount_amount = total_subtotal * percent`

3. **Item-scoped discount**
   - Only reduces the specified items, then rolled up to owner participant

4. **Additional fees allocation**
   - `EQUAL`: split evenly to all participants (or only confirmed participants if specified)
   - `PROPORTIONAL`: proportional to subtotal (or subtotal-after-discount; choose one and enforce consistently)
   - `CUSTOM`: manual per participant amounts; must validate sum equals fee total

5. **Rounding policy**
   - Implement rounding rules and store **rounding_adjustment** so:
     - `Σ final_due_i == grand_total` exactly
   - Store policy used: `ROUND_HALF_UP` / `FLOOR` / `CEIL` etc.

#### Output persistence (mandatory)
When calculation is triggered (on publish or on explicit “recalculate” in draft):
- Create/update **AllocationSnapshot (draft)**, and **AllocationLines**
- On publish: **lock** snapshot, assign immutable version

---

### C. Publish / Lock / Change Control (governance)
- **Draft**: editable freely by Initiator
- **Publish**:
  - creates **immutable AllocationSnapshot version**
  - locks input set + results for that version
- **Post-publish changes**:
  - must create **new version** (change request) with full audit trail
  - participants can always view history but only one **current active** version

---

### D. Payment Tracking & Monitoring
Participant can:
- view amount due
- mark as paid + upload proof
- optional partial payments

Initiator can:
- dashboard: paid/unpaid/partial
- export outstanding list
- trigger reminders (email/Teams/webhook optional)

---

### E. Reporting & Export
- Transaction report: totals, discount, fees, settlement state
- Participant report: due vs paid, evidence links
- Time-based reporting (weekly/monthly)
- Export-ready data model: CSV endpoint + BI-friendly tables/views

---

### F. Integration & Extensibility
- REST API + OpenAPI spec structure
- Webhooks for events:
  - `TRANSACTION_PUBLISHED`
  - `PAYMENT_SUBMITTED`
  - `PAYMENT_VERIFIED`
  - `TRANSACTION_SETTLED`
- Integration-ready targets:
  - chat notification (Teams)
  - finance tools / showback
  - identity provider (SSO) — optional

---

## 4) Architecture Requirements
- Modular, domain-driven design:
  - `Transactions` (input & lifecycle)
  - `Allocation` (engine & snapshots)
  - `Payments` (settlement)
  - `Evidence` (artifacts)
  - `Audit` (append-only log)
  - `Reporting` (exports & dashboards)
  - `Auth/RBAC` (access control)

- API-first (Express as source of truth)
- Event-driven where applicable (payment events → notifications/report refresh)
- Strong traceability (every final number ties to stored inputs + version)

---

## 5) UX Principles (product positioning)
- **Transaction-first navigation** (not task-first)
- Two clear experiences:
  1. **Initiator Console**
     - create/edit draft, recalc, publish, monitor payment
  2. **Participant View**
     - simple breakdown + pay/confirm

Breakdown must show:
- Items subtotal
- Discount share
- Fee share
- Rounding adjustment
- Final amount due

Clarify data ownership:
- Initiator owns transaction data & publish
- Participant owns payment confirmation & evidence submission

---

## 6) Deliverables (what to produce)
Your output must include:

1. **High-level system architecture**
   - Next.js frontend + Express API + PostgreSQL
2. **Domain model / ERD**
   - entities + relationships above
3. **API structure**
   - route groups and OpenAPI outline
4. **Key workflows**
   - Intake → Recalculate → Publish → Pay/Verify → Settle → Archive
5. **Example schemas**
   - PostgreSQL table sketches + sample JSON DTOs
6. **Initial UI layout concept**
   - page map and major components for Initiator & Participant

---

## 7) Data → Insight → Action → Feedback (mandatory framing)
- **Data:** transactions, items, discounts, fees, snapshots, payments, evidence, audit logs  
- **Insight:** outstanding status, per-participant breakdown, reconciliation gaps, settlement progress  
- **Action:** publish/lock, reminders, verify payments, create new version  
- **Feedback:** change request (new version), dispute handling, audit review, policy tuning (rounding/allocation)

---

## 8) Non-goals (explicit)
Do **not** build:
- a basic “split calculator” without persistence
- a scheduling tool
- a team task app

The platform’s differentiator is **governance + auditability + persisted calculation snapshots + payment monitoring**.

