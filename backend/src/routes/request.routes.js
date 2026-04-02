import { Router } from 'express';
import { RequestStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const createRequestSchema = z.object({
  title: z.string().min(4),
  description: z.string().min(10)
});

const statusSchema = z.object({
  status: z.nativeEnum(RequestStatus)
});

router.post('/request', requireAuth, async (req, res, next) => {
  try {
    const data = createRequestSchema.parse(req.body);
    const created = await prisma.request.create({
      data: {
        userId: req.user.userId,
        title: data.title,
        description: data.description
      }
    });

    return res.status(201).json({ request: created });
  } catch (err) {
    return next(err);
  }
});

router.get('/requests', requireAuth, async (req, res, next) => {
  try {
    const requests = await prisma.request.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ requests });
  } catch (err) {
    return next(err);
  }
});

router.put('/request/:id', requireAuth, async (req, res, next) => {
  try {
    const data = statusSchema.parse(req.body);

    const request = await prisma.request.findFirst({
      where: { id: req.params.id, userId: req.user.userId }
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const updated = await prisma.request.update({
      where: { id: req.params.id },
      data: { status: data.status }
    });

    return res.status(200).json({ request: updated });
  } catch (err) {
    return next(err);
  }
});

export default router;
