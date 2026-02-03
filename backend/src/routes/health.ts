import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // quick DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', detail: String(err) });
  }
});

export default router;
