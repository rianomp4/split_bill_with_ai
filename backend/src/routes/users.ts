import { Router } from 'express';
import prisma from '../prismaClient';
import auth from '../middleware/auth';

const router = Router();

// GET /api/users/:id - only self (or admin in future)
router.get('/:id', auth, async (req: any, res) => {
  const id = req.params.id;
  const requester = req.user;
  if (!requester) return res.status(401).json({ error: 'unauthorized' });
  if (requester.id !== id) return res.status(403).json({ error: 'forbidden' });

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, username: true, npp: true, name: true, phone: true, createdAt: true, lastLogin: true } });
  if (!user) return res.status(404).json({ error: 'not found' });
  res.json(user);
});

export default router;
