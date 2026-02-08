import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { translateRoutes } from './routes/translate.js';
import { chatRoutes } from './routes/chat.js';
import { authRoutes } from './routes/auth.js';

const fastify = Fastify({ logger: true });

// Plugins
await fastify.register(cors, { origin: true });
await fastify.register(websocket);

// Routes
await fastify.register(translateRoutes, { prefix: '/api' });
await fastify.register(chatRoutes, { prefix: '/api' });
await fastify.register(authRoutes, { prefix: '/api' });

// Health check
fastify.get('/health', async () => ({ status: 'ok' }));

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
