import { Message, MessageRole } from "../models/message.model";
import { Conversation, ConversationStatus } from "../models/conversation.model";
import { redisClient } from "../config/redis";
import llmService from "./llm.service";
import { Op } from "sequelize";

const GUEST_TTL = 60 * 60 * 24 * 7; // 7 days

interface GuestMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface GuestConversation {
  id: string;
  sessionId: string;
  title: string;
  messages: GuestMessage[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class MessageService {
  /**
   * Send a message (unified - handles both guest and authenticated users)
   */
  async sendMessage(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    },
    conversationId: string,
    content: string
  ): Promise<{
    userMessage: any;
    assistantMessage: any;
    conversationId: string;
    isGuest: boolean;
  }> {
    // Get conversation first (unified)
    let conversation: any;
    let isGuest: boolean;

    if (principal.type === "user" && principal.userId) {
      // Authenticated user - get from database
      const conv = await Conversation.findOne({
        where: {
          id: conversationId,
          user_id: principal.userId,
        },
      });
      if (!conv) {
        throw new Error('Conversation not found');
      }
      conversation = conv;
      isGuest = false;
    } else if (principal.type === "guest" && principal.sessionId) {
      // Guest user - get from Redis
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversationId}`;
      const convData = await redisClient.get(convKey);
      if (!convData) {
        throw new Error('Conversation not found');
      }
      conversation = JSON.parse(convData);
      isGuest = true;
    } else {
      throw new Error('Invalid principal: userId or sessionId is required');
    }

    // Save user message (unified)
    const userMessage = await this.saveUserMessage(conversation, content, isGuest, principal);

    // Get history (unified)
    const history = await this.getConversationHistory(conversation, isGuest, principal);

    // ✅ FIX: Ensure history has correct type
    const typedHistory: ChatMessage[] = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Get AI response
    const aiResponse = await llmService.customerSupportChat(content, typedHistory);

    // Save assistant message (unified)
    const assistantMessage = await this.saveAssistantMessage(
      conversation,
      aiResponse,
      isGuest,
      principal
    );

    // Update conversation timestamp (unified)
    await this.updateConversationTimestamp(conversation, isGuest, principal);

    return {
      userMessage,
      assistantMessage,
      conversationId: conversation.id,
      isGuest,
    };
  }

  /**
   * Save user message (unified)
   */
  private async saveUserMessage(
    conversation: any,
    content: string,
    isGuest: boolean,
    principal: { type: "user" | "guest"; userId?: string; sessionId?: string }
  ): Promise<any> {
    if (!isGuest) {
      // Authenticated user - save to database
      return await Message.create({
        conversation_id: conversation.id,
        role: MessageRole.USER,
        content,
      });
    } else {
      // Guest user - save to Redis
      const userMessage: GuestMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      conversation.messages.push(userMessage);
      
      // Save back to Redis
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversation.id}`;
      await redisClient.set(convKey, JSON.stringify(conversation), { EX: GUEST_TTL });
      
      return userMessage;
    }
  }

  /**
   * Save assistant message (unified)
   */
  private async saveAssistantMessage(
    conversation: any,
    content: string,
    isGuest: boolean,
    principal: { type: "user" | "guest"; userId?: string; sessionId?: string }
  ): Promise<any> {
    if (!isGuest) {
      // Authenticated user - save to database
      return await Message.create({
        conversation_id: conversation.id,
        role: MessageRole.ASSISTANT,
        content,
      });
    } else {
      // Guest user - save to Redis
      const assistantMessage: GuestMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content,
        created_at: new Date().toISOString(),
      };
      conversation.messages.push(assistantMessage);
      
      // Save back to Redis
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversation.id}`;
      await redisClient.set(convKey, JSON.stringify(conversation), { EX: GUEST_TTL });
      
      return assistantMessage;
    }
  }

  /**
   * Get conversation history (unified)
   */
  private async getConversationHistory(
    conversation: any,
    isGuest: boolean,
    principal: { type: "user" | "guest"; userId?: string; sessionId?: string }
  ): Promise<ChatMessage[]> {
    if (!isGuest) {
      // Authenticated user - get from database
      const messages = await Message.findAll({
        where: {
          conversation_id: conversation.id,
        },
        order: [['created_at', 'ASC']],
        limit: 20,
      });
      
      return messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));
    } else {
      // Guest user - get from Redis
      return conversation.messages.map((msg: GuestMessage) => ({
        role: msg.role,
        content: msg.content,
      }));
    }
  }

  /**
   * Update conversation timestamp (unified)
   */
  private async updateConversationTimestamp(
    conversation: any,
    isGuest: boolean,
    principal: { type: "user" | "guest"; userId?: string; sessionId?: string }
  ): Promise<void> {
    if (!isGuest) {
      // Authenticated user - update database
      await conversation.update({ updated_at: new Date() });
    } else {
      // Guest user - update Redis
      conversation.updated_at = new Date().toISOString();
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversation.id}`;
      await redisClient.set(convKey, JSON.stringify(conversation), { EX: GUEST_TTL });
    }
  }

  /**
   * Get messages from a conversation (unified)
   */
  async getMessages(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    },
    conversationId: string,
    options?: {
      limit?: number;
      offset?: number;
      before?: Date;
      after?: Date;
    }
  ): Promise<{
    messages: any[];
    total: number;
    isGuest: boolean;
    conversationId: string;
  }> {
    if (principal.type === "user" && principal.userId) {
      // Authenticated user - get from database
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          user_id: principal.userId,
        },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const limit = options?.limit || 50;
      const offset = options?.offset || 0;
      const where: any = {
        conversation_id: conversation.id,
      };

      if (options?.before) {
        where.created_at = {
          [Op.lt]: options.before,
        };
      }

      if (options?.after) {
        where.created_at = {
          [Op.gt]: options.after,
        };
      }

      const { count, rows } = await Message.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      return {
        messages: rows.reverse().map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at,
        })),
        total: count,
        isGuest: false,
        conversationId: conversation.id,
      };
    } else if (principal.type === "guest" && principal.sessionId) {
      // Guest user - get from Redis
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversationId}`;
      const convData = await redisClient.get(convKey);

      if (!convData) {
        throw new Error('Conversation not found');
      }

      const conversation: GuestConversation = JSON.parse(convData);
      let messages = conversation.messages;

      // Apply filters
      if (options?.before) {
        messages = messages.filter((msg) => new Date(msg.created_at) < options.before!);
      }
      if (options?.after) {
        messages = messages.filter((msg) => new Date(msg.created_at) > options.after!);
      }

      const total = messages.length;
      const limit = options?.limit || 50;
      const offset = options?.offset || 0;

      // Apply pagination
      const paginatedMessages = messages.slice(offset, offset + limit);

      return {
        messages: paginatedMessages,
        total,
        isGuest: true,
        conversationId: conversation.id,
      };
    }

    throw new Error('Invalid principal: userId or sessionId is required');
  }

  /**
   * Delete a message (unified)
   */
  async deleteMessage(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    },
    conversationId: string,
    messageId: string
  ): Promise<{
    deleted: boolean;
    isGuest: boolean;
  }> {
    if (principal.type === "user" && principal.userId) {
      // Authenticated user - delete from database
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          user_id: principal.userId,
        },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const message = await Message.findOne({
        where: {
          id: messageId,
          conversation_id: conversation.id,
        },
      });

      if (!message) {
        return { deleted: false, isGuest: false };
      }

      await message.destroy();
      return { deleted: true, isGuest: false };
    } else if (principal.type === "guest" && principal.sessionId) {
      // Guest user - delete from Redis
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversationId}`;
      const convData = await redisClient.get(convKey);

      if (!convData) {
        throw new Error('Conversation not found');
      }

      const conversation: GuestConversation = JSON.parse(convData);
      const initialLength = conversation.messages.length;

      conversation.messages = conversation.messages.filter((msg) => msg.id !== messageId);

      if (conversation.messages.length === initialLength) {
        return { deleted: false, isGuest: true };
      }

      conversation.updated_at = new Date().toISOString();
      await redisClient.set(convKey, JSON.stringify(conversation), { EX: GUEST_TTL });

      return { deleted: true, isGuest: true };
    }

    throw new Error('Invalid principal: userId or sessionId is required');
  }

  /**
   * Clear all messages in a conversation (unified)
   */
  async clearMessages(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    },
    conversationId: string
  ): Promise<{
    cleared: boolean;
    isGuest: boolean;
  }> {
    if (principal.type === "user" && principal.userId) {
      // Authenticated user - clear from database
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          user_id: principal.userId,
        },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await Message.destroy({
        where: {
          conversation_id: conversation.id,
        },
      });

      await conversation.update({ updated_at: new Date() });
      return { cleared: true, isGuest: false };
    } else if (principal.type === "guest" && principal.sessionId) {
      // Guest user - clear from Redis
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversationId}`;
      const convData = await redisClient.get(convKey);

      if (!convData) {
        throw new Error('Conversation not found');
      }

      const conversation: GuestConversation = JSON.parse(convData);
      conversation.messages = [];
      conversation.updated_at = new Date().toISOString();

      await redisClient.set(convKey, JSON.stringify(conversation), { EX: GUEST_TTL });
      return { cleared: true, isGuest: true };
    }

    throw new Error('Invalid principal: userId or sessionId is required');
  }
}

export const messageService = new MessageService();
