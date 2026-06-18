import { Conversation, ConversationStatus } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { uuidv7 } from "uuidv7";
import { redisClient } from "../config/redis";
import { Op } from "sequelize";

const GUEST_TTL = 60 * 60 * 24 * 7; // 7 days

interface GuestConversation {
  id: string;
  sessionId: string;
  title: string;
  messages: any[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface ConversationSummary {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_role: string | null;
  message_count: number;
}

class ConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    },
    title?: string
  ) {
    if (principal.type === "user" && principal.userId) {
      const conversation = await Conversation.create({
        user_id: principal.userId,
        title: title ?? null,
        status: ConversationStatus.ACTIVE,  // ✅ Use enum instead of string
      });

      return {
        storage: "db",
        conversation,
        isGuest: false,
      };
    }

    if (!principal.sessionId) {
      throw new Error('sessionId is required for guest users');
    }

    const conversationId = uuidv7();

    const guestConversation: GuestConversation = {
      id: conversationId,
      sessionId: principal.sessionId,
      title: title ?? "New Chat",
      messages: [],
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await redisClient.set(
      `guest:session:${principal.sessionId}:conversation:${conversationId}`,
      JSON.stringify(guestConversation),
      { EX: GUEST_TTL }
    );

    const sessionKey = `guest:session:${principal.sessionId}:conversations`;
    const existing = await redisClient.get(sessionKey);
    const conversations = existing ? JSON.parse(existing) : [];
    conversations.push({
      id: conversationId,
      title: guestConversation.title,
      status: guestConversation.status,
      created_at: guestConversation.created_at,
      updated_at: guestConversation.updated_at,
    });
    await redisClient.set(sessionKey, JSON.stringify(conversations), { EX: GUEST_TTL });

    return {
      storage: "redis",
      conversation: guestConversation,
      isGuest: true,
    };
  }

  /**
   * List all conversations (handles both guest and authenticated users)
   */
  async listConversations(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    }
  ): Promise<{
    conversations: ConversationSummary[];
    total: number;
    isGuest: boolean;
  }> {
    // Authenticated user
    if (principal.type === "user" && principal.userId) {
      const conversations = await Conversation.findAll({
        where: {
          user_id: principal.userId,
        },
        attributes: [
          'id',
          'title',
          'status',
          'created_at',
          'updated_at',
        ],
        include: [
          {
            model: Message,
            as: 'messages',
            attributes: ['content', 'role', 'created_at'],
            limit: 1,
            order: [['created_at', 'DESC']],
          },
        ],
        order: [['updated_at', 'DESC']],
      });

      const formattedConversations: ConversationSummary[] = conversations.map((conv) => {
        const convData = conv.toJSON();
        const messages = (convData as any).messages || [];
        return {
          id: convData.id,
          title: convData.title || 'Untitled Conversation',
          status: convData.status,
          created_at: convData.created_at ? new Date(convData.created_at).toISOString() : new Date().toISOString(),
          updated_at: convData.updated_at ? new Date(convData.updated_at).toISOString() : new Date().toISOString(),
          last_message: messages.length > 0 ? messages[0]?.content || null : null,
          last_message_role: messages.length > 0 ? messages[0]?.role || null : null,
          message_count: 0,
        };
      });

      return {
        conversations: formattedConversations,
        total: formattedConversations.length,
        isGuest: false,
      };
    }

    // Guest user
    if (principal.type === "guest" && principal.sessionId) {
      const sessionKey = `guest:session:${principal.sessionId}:conversations`;
      const existing = await redisClient.get(sessionKey);

      if (!existing) {
        return {
          conversations: [],
          total: 0,
          isGuest: true,
        };
      }

      const conversationSummaries = JSON.parse(existing);
      const fullConversations: ConversationSummary[] = [];

      for (const summary of conversationSummaries) {
        const convKey = `guest:session:${principal.sessionId}:conversation:${summary.id}`;
        const convData = await redisClient.get(convKey);
        
        if (convData) {
          const conversation: GuestConversation = JSON.parse(convData);
          const lastMessage = conversation.messages.length > 0 
            ? conversation.messages[conversation.messages.length - 1]
            : null;

          fullConversations.push({
            id: conversation.id,
            title: conversation.title,
            status: conversation.status,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
            last_message: lastMessage?.content || null,
            last_message_role: lastMessage?.role || null,
            message_count: conversation.messages.length,
          });
        }
      }

      // Sort by updated_at (newest first)
      fullConversations.sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      return {
        conversations: fullConversations,
        total: fullConversations.length,
        isGuest: true,
      };
    }

    throw new Error('Invalid principal: userId or sessionId is required');
  }

  /**
   * Get a single conversation with messages (handles both guest and authenticated)
   */
  async getConversation(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    },
    conversationId: string
  ): Promise<{
    conversation: any;
    isGuest: boolean;
  } | null> {
    // Authenticated user
    if (principal.type === "user" && principal.userId) {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          user_id: principal.userId,
        },
        include: [
          {
            model: Message,
            as: 'messages',
            attributes: ['id', 'role', 'content', 'created_at'],
            order: [['created_at', 'ASC']],
          },
        ],
      });

      if (!conversation) {
        return null;
      }

      const convData = conversation.toJSON();
      const messages = (convData as any).messages || [];
      
      return {
        conversation: {
          id: convData.id,
          title: convData.title || 'Untitled Conversation',
          status: convData.status,
          created_at: convData.created_at ? new Date(convData.created_at).toISOString() : new Date().toISOString(),
          updated_at: convData.updated_at ? new Date(convData.updated_at).toISOString() : new Date().toISOString(),
          messages: messages,
        },
        isGuest: false,
      };
    }

    // Guest user
    if (principal.type === "guest" && principal.sessionId) {
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversationId}`;
      const convData = await redisClient.get(convKey);

      if (!convData) {
        return null;
      }

      const conversation: GuestConversation = JSON.parse(convData);
      
      return {
        conversation: {
          id: conversation.id,
          title: conversation.title,
          status: conversation.status,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          messages: conversation.messages,
        },
        isGuest: true,
      };
    }

    throw new Error('Invalid principal: userId or sessionId is required');
  }

  /**
   * Delete a conversation (handles both guest and authenticated)
   */
  async deleteConversation(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    },
    conversationId: string
  ): Promise<{ deleted: boolean; isGuest: boolean }> {
    // Authenticated user
    if (principal.type === "user" && principal.userId) {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          user_id: principal.userId,
        },
      });

      if (!conversation) {
        return { deleted: false, isGuest: false };
      }

      await conversation.destroy();
      return { deleted: true, isGuest: false };
    }

    // Guest user
    if (principal.type === "guest" && principal.sessionId) {
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversationId}`;
      const convData = await redisClient.get(convKey);

      if (!convData) {
        return { deleted: false, isGuest: true };
      }

      await redisClient.del(convKey);

      // Remove from session's conversation list
      const sessionKey = `guest:session:${principal.sessionId}:conversations`;
      const existing = await redisClient.get(sessionKey);
      
      if (existing) {
        const conversations = JSON.parse(existing);
        const filtered = conversations.filter((c: any) => c.id !== conversationId);
        await redisClient.set(sessionKey, JSON.stringify(filtered), { EX: GUEST_TTL });
      }

      return { deleted: true, isGuest: true };
    }

    throw new Error('Invalid principal: userId or sessionId is required');
  }

  /**
   * Update conversation title (handles both guest and authenticated)
   */
  async updateConversationTitle(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    },
    conversationId: string,
    title: string
  ): Promise<{
    conversation: any;
    isGuest: boolean;
  } | null> {
    // Authenticated user
    if (principal.type === "user" && principal.userId) {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          user_id: principal.userId,
        },
      });

      if (!conversation) {
        return null;
      }

      conversation.title = title;
      await conversation.save();

      const convData = conversation.toJSON();
      return {
        conversation: {
          id: convData.id,
          title: convData.title,
          status: convData.status,
          created_at: convData.created_at ? new Date(convData.created_at).toISOString() : new Date().toISOString(),
          updated_at: convData.updated_at ? new Date(convData.updated_at).toISOString() : new Date().toISOString(),
        },
        isGuest: false,
      };
    }

    // Guest user
    if (principal.type === "guest" && principal.sessionId) {
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversationId}`;
      const convData = await redisClient.get(convKey);

      if (!convData) {
        return null;
      }

      const conversation: GuestConversation = JSON.parse(convData);
      conversation.title = title;
      conversation.updated_at = new Date().toISOString();

      await redisClient.set(convKey, JSON.stringify(conversation), { EX: GUEST_TTL });

      // Update in session list
      const sessionKey = `guest:session:${principal.sessionId}:conversations`;
      const existing = await redisClient.get(sessionKey);
      
      if (existing) {
        const conversations = JSON.parse(existing);
        const updated = conversations.map((c: any) => {
          if (c.id === conversationId) {
            c.title = title;
            c.updated_at = conversation.updated_at;
          }
          return c;
        });
        await redisClient.set(sessionKey, JSON.stringify(updated), { EX: GUEST_TTL });
      }

      return {
        conversation,
        isGuest: true,
      };
    }

    throw new Error('Invalid principal: userId or sessionId is required');
  }

  /**
   * Close a conversation (handles both guest and authenticated)
   */
  async closeConversation(
    principal: {
      type: "user" | "guest";
      userId?: string;
      sessionId?: string;
    },
    conversationId: string
  ): Promise<{ closed: boolean; isGuest: boolean }> {
    // Authenticated user
    if (principal.type === "user" && principal.userId) {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          user_id: principal.userId,
        },
      });

      if (!conversation) {
        return { closed: false, isGuest: false };
      }

      conversation.status = ConversationStatus.CLOSED;  // ✅ Use enum instead of string
      await conversation.save();
      return { closed: true, isGuest: false };
    }

    // Guest user
    if (principal.type === "guest" && principal.sessionId) {
      const convKey = `guest:session:${principal.sessionId}:conversation:${conversationId}`;
      const convData = await redisClient.get(convKey);

      if (!convData) {
        return { closed: false, isGuest: true };
      }

      const conversation: GuestConversation = JSON.parse(convData);
      conversation.status = 'closed';
      conversation.updated_at = new Date().toISOString();

      await redisClient.set(convKey, JSON.stringify(conversation), { EX: GUEST_TTL });

      // Update in session list
      const sessionKey = `guest:session:${principal.sessionId}:conversations`;
      const existing = await redisClient.get(sessionKey);
      
      if (existing) {
        const conversations = JSON.parse(existing);
        const updated = conversations.map((c: any) => {
          if (c.id === conversationId) {
            c.status = 'closed';
            c.updated_at = conversation.updated_at;
          }
          return c;
        });
        await redisClient.set(sessionKey, JSON.stringify(updated), { EX: GUEST_TTL });
      }

      return { closed: true, isGuest: true };
    }

    throw new Error('Invalid principal: userId or sessionId is required');
  }

}

export const conversationService = new ConversationService();
