import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { translateMessage, detectLanguage } from '../services/gemini.js';

const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  context: z.array(z.string()).optional(),
});

export const translateRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/translate
  fastify.post('/translate', async (request, reply) => {
    try {
      const body = translateSchema.parse(request.body);
      const result = await translateMessage(body.text, body.context);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      });
    }
  });

  // POST /api/detect-language
  fastify.post('/detect-language', async (request, reply) => {
    try {
      const { text } = z.object({ text: z.string() }).parse(request.body);
      const lang = await detectLanguage(text);

      return {
        success: true,
        data: { language: lang },
      };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Language detection failed',
      });
    }
  });
};
