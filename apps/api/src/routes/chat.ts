import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  getMessages,
  createMessage,
  getConversations,
  getOrCreateConversation,
  getUserById,
} from '../services/supabase.js';
import { translateMessage } from '../services/gemini.js';
import { sendPushToUser } from '../services/push.js';
import { supabase } from '../services/supabase.js';

const messageSchema = z.object({
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  messageType: z.enum(['text', 'image', 'video', 'file']).optional().default('text'),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
});

const conversationSchema = z.object({
  userId: z.string().uuid(),
  targetUserId: z.string().uuid(),
});

export const chatRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/conversations
  fastify.get('/conversations', async (request, reply) => {
    try {
      const { userId } = z
        .object({ userId: z.string().uuid() })
        .parse(request.query);

      const conversations = await getConversations(userId);
      return { success: true, data: conversations };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to get conversations',
      });
    }
  });

  // POST /api/conversations
  fastify.post('/conversations', async (request, reply) => {
    try {
      const { userId, targetUserId } = conversationSchema.parse(request.body);
      const conversation = await getOrCreateConversation(userId, targetUserId);
      return { success: true, data: conversation };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create conversation',
      });
    }
  });

  // GET /api/conversations/:id/messages
  fastify.get('/conversations/:id/messages', async (request, reply) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid() })
        .parse(request.params);

      const { limit, offset } = z
        .object({
          limit: z.coerce.number().optional().default(50),
          offset: z.coerce.number().optional().default(0),
        })
        .parse(request.query);

      const messages = await getMessages(id, limit, offset);
      return { success: true, data: messages };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to get messages',
      });
    }
  });

  // POST /api/messages
  fastify.post('/messages', async (request, reply) => {
    try {
      const body = messageSchema.parse(request.body);
      const isFileMessage = body.messageType !== 'text';

      // 텍스트 메시지만 번역 수행 (파일 메시지는 스킵)
      let translation = { translated: null as string | null, sourceLang: 'ko' as const, targetLang: 'vi' as const };
      if (!isFileMessage) {
        try {
          translation = await translateMessage(body.content);
        } catch (translateError) {
          fastify.log.warn('Translation failed, saving without translation:', translateError);
        }
      }

      // 메시지 저장
      const message = await createMessage({
        conversation_id: body.conversationId,
        sender_id: body.senderId,
        content: body.content,
        translated: translation.translated,
        source_lang: translation.sourceLang,
        target_lang: translation.targetLang,
        message_type: body.messageType,
        file_url: body.fileUrl ?? null,
        file_name: body.fileName ?? null,
        file_size: body.fileSize ?? null,
      });

      // 푸시 알림 (fire-and-forget)
      (async () => {
        try {
          const { data: conv } = await supabase
            .from('conversations')
            .select('user1_id, user2_id')
            .eq('id', body.conversationId)
            .single();

          if (conv) {
            const recipientId = conv.user1_id === body.senderId ? conv.user2_id : conv.user1_id;
            const sender = await getUserById(body.senderId);
            const senderName = sender?.name ?? 'Someone';
            const preview = isFileMessage
              ? { image: '📷 Photo', video: '🎬 Video', file: '📎 File' }[body.messageType]
              : body.content.length > 50 ? body.content.slice(0, 50) + '...' : body.content;

            await sendPushToUser(recipientId, {
              title: senderName,
              body: preview ?? body.content,
              url: `/chat/${body.conversationId}`,
            });
          }
        } catch (pushErr) {
          fastify.log.warn('Push notification failed:', pushErr);
        }
      })();

      return { success: true, data: message };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to send message',
      });
    }
  });

  // WebSocket for real-time chat
  fastify.get('/ws/chat', { websocket: true }, (socket, request) => {
    socket.on('message', async (rawMessage) => {
      try {
        const data = JSON.parse(rawMessage.toString());

        if (data.type === 'message') {
          const msgType = data.messageType ?? 'text';
          const isFile = msgType !== 'text';

          let translation = { translated: null as string | null, sourceLang: 'ko' as const, targetLang: 'vi' as const };
          if (!isFile) {
            try {
              translation = await translateMessage(data.content);
            } catch { /* translation optional */ }
          }

          const message = await createMessage({
            conversation_id: data.conversationId,
            sender_id: data.senderId,
            content: data.content,
            translated: translation.translated,
            source_lang: translation.sourceLang,
            target_lang: translation.targetLang,
            message_type: msgType,
            file_url: data.fileUrl ?? null,
            file_name: data.fileName ?? null,
            file_size: data.fileSize ?? null,
          });

          socket.send(
            JSON.stringify({
              type: 'message',
              data: message,
            })
          );
        }
      } catch (error) {
        socket.send(
          JSON.stringify({
            type: 'error',
            error: 'Failed to process message',
          })
        );
      }
    });
  });
};
