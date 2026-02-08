import type { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../services/supabase.js';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.slice(7);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({
      success: false,
      error: 'Invalid or expired token',
    });
  }

  // Attach user to request
  (request as FastifyRequest & { user: typeof user }).user = user;
}

// Type helper
export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email?: string;
    [key: string]: unknown;
  };
}
