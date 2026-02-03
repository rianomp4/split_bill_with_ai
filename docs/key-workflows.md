# Key Workflows 🔁

Ringkas alur utama dari Intake hingga Archive.

## 1) Intake (Draft)
- Initiator creates Transaction with Merchant, Participants, Items, Discounts, Fees.
- Stored in DB as `DRAFT` state.

## 2) Recalculate (Draft)
- Initiator triggers `recalculate`.
- Backend runs Allocation Engine, produces `AllocationSnapshot` (draft) and `AllocationLine` entries.
- Rounding adjustments computed and stored per line.

## 3) Publish
- Initiator publishes draft → creates immutable `AllocationSnapshot` with `version` and `locked_at`.
- `AuditLog` entry recorded (who, what changed, diff).
- Webhook `TRANSACTION_PUBLISHED` emitted.

## 4) Pay / Verify
- Participant submits Payment (partial allowed) and EvidenceArtifact pointer.
- Payment status transitions: `unpaid` → `partial` → `paid` → `verified`.
- Finance/Auditor can `verify` payment; `AuditLog` records verification.

## 5) Settle & Archive
- When all participants `verified/paid`, Transaction moves to `SETTLED`.
- Archival policy (retention) moves to `ARCHIVED` after a configurable period.

## 6) Post-publish Changes
- Changes spawn new draft version -> recalc -> publish (new version).
- History always viewable; only one active `current_version` visible.

> Each workflow step emits event(s) and writes to `AuditLog` for full traceability.
