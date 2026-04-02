import { Router } from 'express';
import { RequestStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const statusSchema = z.object({
  status: z.nativeEnum(RequestStatus)
});

router.get('/developer/requests', requireAuth, requireRole('DEVELOPER'), async (req, res, next) => {
  try {
    const requests = await prisma.request.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ requests });
  } catch (err) {
    return next(err);
  }
});

router.put('/developer/request/:id/status', requireAuth, requireRole('DEVELOPER'), async (req, res, next) => {
  try {
    const data = statusSchema.parse(req.body);
    const existing = await prisma.request.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const updated = await prisma.request.update({
      where: { id: req.params.id },
      data: { status: data.status }
    });

    return res.status(200).json({ request: updated, message: 'Status updated successfully.' });
  } catch (err) {
    return next(err);
  }
});

export default router;
