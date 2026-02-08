import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  saveSubscription,
  removeSubscription,
  getVapidPublicKey,
} from '../services/push.js';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const pushRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/push/vapid-key (공개 - 인증 불필요)
  fastify.get('/push/vapid-key', async () => {
    return { success: true, data: { publicKey: getVapidPublicKey() } };
  });

  // POST /api/push/subscribe (인증 필요)
  fastify.post('/push/subscribe', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { user } = request as AuthenticatedRequest;
      const subscription = subscriptionSchema.parse(request.body);
      await saveSubscription(user.id, subscription);
      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to save subscription',
      });
    }
  });

  // DELETE /api/push/unsubscribe (인증 필요)
  fastify.delete('/push/unsubscribe', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { user } = request as AuthenticatedRequest;
      const { endpoint } = z.object({ endpoint: z.string().url() }).parse(request.body);
      await removeSubscription(user.id, endpoint);
      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to remove subscription',
      });
    }
  });
};
