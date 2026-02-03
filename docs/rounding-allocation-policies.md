# Rounding & Allocation Policies ⚖️

**Purpose:** Define deterministic rules so totals reconcile exactly and are auditable.

## Allocation Rules (baseline)
- **Participant subtotal**: sum of their owned items: subtotal_i = Σ (price * qty)
- **Transaction-wide discount (proportional)**: discount_share_i = (subtotal_i / total_subtotal) * total_discount_amount
- **Item-scoped discount**: apply directly to item price; roll up to owner
- **Additional fees**:
  - EQUAL: split evenly among participants
  - PROPORTIONAL: split by subtotal-after-discount (recommended default)
  - CUSTOM: manual amounts with validation (sum == fee total)

## Rounding Policy
- Configurable policy per transaction/merchant: `ROUND_HALF_UP` (default), `FLOOR`, `CEIL`.
- Store `rounding_adjustment` per `AllocationLine` so that Σ(final_due) == grand_total exactly.
- Persist policy used on `AllocationSnapshot` (e.g., `rounding_policy: "ROUND_HALF_UP"`).

## Determinism & Auditability
- Calculation steps must be deterministic and logged (intermediate totals optional in audit diff)
- Checksum/hash on `AllocationSnapshot.totals` recommended for tamper-evidence

## Enforcement
- Backend rejects inconsistent `CUSTOM` fee allocations (validation error) before publish
- Unit/property tests ensure invariants (non-negative numbers, Σ final_due == grand_total)
