# Example Schemas (Postgres DDL & Sample DTOs) 🧾

## PostgreSQL Table Sketches (simplified)

```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id),
  ordered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  currency VARCHAR(8) NOT NULL,
  notes TEXT,
  state VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  current_version INTEGER,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE transaction_participants (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  user_id UUID NOT NULL,
  role VARCHAR(32) NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  name TEXT NOT NULL,
  normal_price NUMERIC(18,2) NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  owner_participant_id UUID REFERENCES transaction_participants(id)
);

CREATE TABLE discounts (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  type VARCHAR(32) NOT NULL, -- PERCENT | FIXED_AMOUNT
  scope VARCHAR(32) NOT NULL, -- TRANSACTION_WIDE | ITEM_SCOPED | PARTICIPANT_SCOPED
  percent NUMERIC(6,4), -- if type=PERCENT
  amount NUMERIC(18,2), -- if type=FIXED_AMOUNT
  priority INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE additional_fees (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  type VARCHAR(32),
  amount NUMERIC(18,2) NOT NULL,
  allocation_method VARCHAR(32) NOT NULL -- EQUAL | PROPORTIONAL | CUSTOM
);

CREATE TABLE allocation_snapshots (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  version INTEGER NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE,
  totals JSONB NOT NULL,
  checksum VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE allocation_lines (
  id UUID PRIMARY KEY,
  snapshot_id UUID REFERENCES allocation_snapshots(id),
  participant_id UUID REFERENCES transaction_participants(id),
  subtotal NUMERIC(18,2) NOT NULL,
  discount_share NUMERIC(18,2) DEFAULT 0,
  fee_share NUMERIC(18,2) DEFAULT 0,
  rounding_adjustment NUMERIC(18,2) DEFAULT 0,
  final_due NUMERIC(18,2) NOT NULL
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  participant_id UUID REFERENCES transaction_participants(id),
  snapshot_id UUID REFERENCES allocation_snapshots(id),
  status VARCHAR(32) DEFAULT 'unpaid', -- unpaid | partial | paid | verified
  amount_paid NUMERIC(18,2) DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  method VARCHAR(64),
  reference TEXT
);

CREATE TABLE evidence_artifacts (
  id UUID PRIMARY KEY,
  owner_id UUID,
  object_ptr TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  actor_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  object_type VARCHAR(64),
  object_id UUID,
  diff JSONB
);
```

> Add RLS policies per transaction row and indexes on `transaction_id`, `snapshot_id`, and timestamps.

---

## Sample JSON DTOs

**TransactionCreateDTO**
```json
{
  "merchant": "Warung Kita",
  "ordered_at": "2026-02-01T12:34:00Z",
  "currency": "IDR",
  "participants": [{"user_id":"u1","role":"INITIATOR"},{"user_id":"u2","role":"PARTICIPANT"}],
  "items": [{"name":"Nasi Goreng","price":25000,"qty":1,"owner":"u1"}],
  "discounts": [{"type":"PERCENT","scope":"TRANSACTION_WIDE","percent":10}],
  "fees": [{"type":"DELIVERY","amount":10000,"allocation_method":"PROPORTIONAL"}]
}
```

**AllocationSnapshot (stored in `totals`)**
```json
{
  "version": 2,
  "grand_total": 36000.00,
  "lines": [
    {"participant_id":"u1","subtotal":25000.00,"discount_share":2500.00,"fee_share":5000.00,"rounding_adjustment":0.00,"final_due":27500.00}
  ],
  "checksum":"sha256:..."
}
```

---

## Testing & Verification
- Unit tests for allocation rules (property tests: sum of final_due == grand_total)
- Recalculation idempotency tests
- Integration tests for publish/lock/versioning flows

Refer to `docs/api-spec-outline.md` for endpoints that produce/consume these DTOs.
