import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generatePresignedPut } from '../lib/s3';
import prisma from '../prismaClient';
import auth from '../middleware/auth';

const router = Router();

// POST /api/payments/:id/evidence - returns presigned URL for upload (requires auth)
router.post('/payments/:id/evidence', auth, async (req: any, res) => {
  const paymentId = req.params.id;
  const { fileName, contentType, bucket = 'split-bucket' } = req.body;
  if (!fileName) return res.status(400).json({ error: 'fileName required' });

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return res.status(404).json({ error: 'payment not found' });

    const key = `${paymentId}/${uuidv4()}-${fileName}`;
    const url = await generatePresignedPut(bucket, key, contentType || 'application/octet-stream');

    // create an evidence record owned by the authenticated user
    const artifact = await prisma.evidenceArtifact.create({
      data: {
        ownerId: req.user?.id,
        objectPtr: `s3://${bucket}/${key}`,
        meta: { paymentId }
      }
    });

    res.json({ uploadUrl: url, artifactId: artifact.id, objectPtr: artifact.objectPtr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create presigned url', detail: String(err) });
  }
});

export default router;
