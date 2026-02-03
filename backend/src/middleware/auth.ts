import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export default async function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization as string | undefined;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Authorization required' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const userId = payload.sub || payload.id;
    const user = await prisma.user.findUnique({ where: { id: String(userId) }, select: { id: true, username: true, name: true, npp: true, phone: true } });
    if (!user) return res.status(401).json({ error: 'Invalid token: user not found' });
    (req as any).user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
