import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { translateRoutes } from './routes/translate.js';
import { chatRoutes } from './routes/chat.js';
import { authRoutes } from './routes/auth.js';
import { pushRoutes } from './routes/push.js';

export async function buildApp() {
  const fastify = Fastify({ logger: true });

  // Plugins
  await fastify.register(cors, {
    origin: [
      'https://viko-chat.vercel.app',
      'http://localhost:5173',
    ],
    credentials: true,
  });
  await fastify.register(websocket);

  // Routes
  await fastify.register(translateRoutes, { prefix: '/api' });
  await fastify.register(chatRoutes, { prefix: '/api' });
  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(pushRoutes, { prefix: '/api' });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok' }));

  return fastify;
}
