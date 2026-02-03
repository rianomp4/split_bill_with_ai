import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// POST /api/transactions - create draft
router.post('/', async (req, res) => {
  const payload = req.body;
  try {
    // upsert merchant by name (simple behaviour)
    const merchant = await prisma.merchant.upsert({
      where: { name: payload.merchant },
      update: {},
      create: { name: payload.merchant }
    });

    const tx = await prisma.transaction.create({
      data: {
        merchantId: merchant.id,
        orderedAt: new Date(payload.ordered_at),
        currency: payload.currency || 'IDR',
        notes: payload.notes,
        participants: {
          create: (payload.participants || []).map((p: any) => ({ userId: p.user_id, role: p.role }))
        },
        items: {
          create: (payload.items || []).map((it: any) => ({ name: it.name, normalPrice: it.price, qty: it.qty || 1 }))
        },
        discounts: {
          create: (payload.discounts || []).map((d: any) => ({ type: d.type, scope: d.scope, percent: d.percent, amount: d.amount }))
        },
        fees: {
          create: (payload.fees || []).map((f: any) => ({ type: f.type, amount: f.amount, allocationMethod: f.allocation_method }))
        }
      },
      include: { participants: true, items: true }
    });

    res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create transaction', detail: String(err) });
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: { merchant: true, participants: true, items: true, discounts: true, fees: true }
    });
    if (!tx) return res.status(404).json({ error: 'not found' });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch', detail: String(err) });
  }
});

export default router;
