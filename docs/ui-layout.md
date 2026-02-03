# UI Layout Concept & Page Map 🖥️📱

**Two main experiences:** Initiator Console & Participant View.

## Initiator Console
- **Dashboard**
  - Cards: Drafts, Published, Settled, Outstanding total
  - Quick actions: New Transaction, Export, Send Reminders
- **Transaction Editor (Draft)**
  - Sections: Header (merchant, date), Participants, Items (inline add/edit), Discounts, Fees
  - Recalculate button (shows preview snapshot)
  - Actions: Save Draft, Recalculate, Publish (modal to confirm)
- **Transaction Detail (Published)**
  - Snapshot viewer (version selector), Allocation lines, Payment Monitoring table, Evidence links, Audit timeline

## Participant View
- **Transaction Summary**
  - Clear breakdown: items subtotal, discount share, fee share, rounding adjustment, final due
  - Pay button (partial allowed), Upload Evidence
  - Payment history + verification status

## Shared Components
- **Audit Timeline**: chronological events with diff and actor
- **Evidence Viewer**: secure links to object store
- **Export Modal**: CSV/JSON options and date filters

## Accessibility & UX
- Simple language, per-participant view highlights their `final_due`
- Emphasize traceability: show link to snapshot version and `AuditLog` for each change

> Wireframes can be exported as simple pages in `apps/frontend` or as Figma/MD sketches if desired.
