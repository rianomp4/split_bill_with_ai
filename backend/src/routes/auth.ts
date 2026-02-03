import { Router } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ? Number(process.env.JWT_EXPIRES_IN) : 3600;

router.post('/register', async (req, res) => {
  const { username, npp, password, name, phone } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'username, password, name required' });

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(409).json({ error: 'username already taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, npp, passwordHash, name, phone } });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: EXPIRES_IN });

    res.status(201).json({ access_token: token, token_type: 'Bearer', expires_in: EXPIRES_IN, user: { id: user.id, username: user.username, npp: user.npp, name: user.name, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to register', detail: String(err) });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: EXPIRES_IN });

    res.json({ access_token: token, token_type: 'Bearer', expires_in: EXPIRES_IN, user: { id: user.id, username: user.username, npp: user.npp, name: user.name, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to login', detail: String(err) });
  }
});

router.get('/me', auth, async (req: any, res) => {
  res.json({ user: req.user });
});

export default router;
