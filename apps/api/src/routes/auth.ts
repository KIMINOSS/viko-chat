import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../services/supabase.js';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  preferred_lang: z.enum(['ko', 'vi']).optional(),
  avatar_url: z.string().url().optional(),
});

const searchSchema = z.object({
  email: z.string().min(1),
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/auth/ensure-profile - 프로필 보장 (없으면 생성, 있으면 업데이트)
  fastify.post('/auth/ensure-profile', {
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const { user } = request as AuthenticatedRequest;

    try {
      const body = z.object({
        name: z.string().min(1).max(100),
        preferred_lang: z.enum(['ko', 'vi']),
      }).parse(request.body);

      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            id: user.id,
            email: user.email ?? '',
            name: body.name,
            preferred_lang: body.preferred_lang,
          },
          { onConflict: 'id' },
        )
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to ensure profile',
      });
    }
  });

  // GET /api/auth/profile - 내 프로필 조회
  fastify.get('/auth/profile', {
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const { user } = request as AuthenticatedRequest;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return reply.status(404).send({
        success: false,
        error: 'Profile not found',
      });
    }

    return { success: true, data };
  });

  // PATCH /api/auth/profile - 프로필 수정
  fastify.patch('/auth/profile', {
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const { user } = request as AuthenticatedRequest;

    try {
      const body = profileUpdateSchema.parse(request.body);

      const { data, error } = await supabase
        .from('users')
        .update(body)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to update profile',
      });
    }
  });

  // GET /api/auth/search?email=xxx - 사용자 검색
  fastify.get('/auth/search', {
    preHandler: authMiddleware,
  }, async (request, reply) => {
    const { user } = request as AuthenticatedRequest;

    try {
      const { email } = searchSchema.parse(request.query);

      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, avatar_url, preferred_lang')
        .ilike('email', `%${email}%`)
        .neq('id', user.id)
        .limit(20);

      if (error) throw error;
      return { success: true, data: data ?? [] };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Search failed',
      });
    }
  });
};
