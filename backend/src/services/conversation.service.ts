import { redisClient, redisReady } from "../config/redis";
import {
  Conversation,
  ConversationStatus,
  ConversationSummary,
  GetOrCreateConversationParams,
  CreateNewConversationServiceParams,
} from "../types/conversation.types";

class ConversationService {
  private readonly CONVERSATION_TTL = 86400; // 24 hours in seconds

  async getOrCreateConversation({ session_id }: GetOrCreateConversationParams): Promise<Conversation> {
    try {
      await redisReady;
      
      const conversationsKey = `session:${session_id}:conversations`;
      
      let conversationsData = await redisClient.get(conversationsKey);
      let conversations: ConversationSummary[] = conversationsData ? JSON.parse(conversationsData) : [];
      
      let activeConversation = conversations.find(conv => conv.status === ConversationStatus.ACTIVE);
      
      if (activeConversation) {
        const conversationKey = `conversation:${activeConversation.id}`;
        const conversationData = await redisClient.get(conversationKey);
        if (conversationData) {
          return JSON.parse(conversationData);
        }
      }
      
      const newConversationId = this.generateConversationId();
      const newConversation: Conversation = {
        id: newConversationId,
        session_id: session_id,
        status: ConversationStatus.ACTIVE,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const conversationKey = `conversation:${newConversationId}`;
      await redisClient.set(conversationKey, JSON.stringify(newConversation), {
        EX: this.CONVERSATION_TTL
      });
      
      conversations.push({
        id: newConversationId,
        status: ConversationStatus.ACTIVE,
        created_at: newConversation.created_at
      });
      
      await redisClient.set(conversationsKey, JSON.stringify(conversations), {
        EX: this.CONVERSATION_TTL
      });
      
      console.log(`[Conversation] Created: ${newConversationId} for session ${session_id}`);
      return newConversation;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      throw new Error('Failed to get or create conversation');
    }
  }
  
  async createNewConversation({ session_id }: CreateNewConversationServiceParams): Promise<Conversation> {
    try {
      await redisReady;
      
      await this.closeActiveConversation(session_id);

      const newConversationId = this.generateConversationId();
      const newConversation: Conversation = {
        id: newConversationId,
        session_id: session_id,
        status: ConversationStatus.ACTIVE,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const conversationKey = `conversation:${newConversationId}`;
      await redisClient.set(conversationKey, JSON.stringify(newConversation), {
        EX: this.CONVERSATION_TTL
      });
      
      const conversationsKey = `session:${session_id}:conversations`;
      let conversationsData = await redisClient.get(conversationsKey);
      let conversations: ConversationSummary[] = conversationsData ? JSON.parse(conversationsData) : [];
      
      conversations.push({
        id: newConversationId,
        status: ConversationStatus.ACTIVE,
        created_at: newConversation.created_at
      });
      
      await redisClient.set(conversationsKey, JSON.stringify(conversations), {
        EX: this.CONVERSATION_TTL
      });
      
      console.log(`[Conversation] Created new conversation: ${newConversationId} for session ${session_id}`);
      return newConversation;
    } catch (error) {
      console.error('Error in createNewConversation:', error);
      throw new Error('Failed to create new conversation');
    }
  }
  
  async getConversation(conversation_id: string): Promise<Conversation | null> {
    try {
      await redisReady;
      
      const conversationKey = `conversation:${conversation_id}`;
      const conversation = await redisClient.get(conversationKey);
      
      if (!conversation) {
        return null;
      }
      
      return JSON.parse(conversation);
    } catch (error) {
      console.error('Error in getConversation:', error);
      throw new Error('Failed to get conversation');
    }
  }
  
  async getAllConversations(session_id: string): Promise<Conversation[]> {
    try {
      await redisReady;
      
      const conversationsKey = `session:${session_id}:conversations`;
      let conversationsData = await redisClient.get(conversationsKey);
      
      if (!conversationsData) {
        return [];
      }
      
      const conversationsList: ConversationSummary[] = JSON.parse(conversationsData);
      
      const fullConversations: Conversation[] = [];
      for (const conv of conversationsList) {
        const conversationKey = `conversation:${conv.id}`;
        const conversationData = await redisClient.get(conversationKey);
        if (conversationData) {
          fullConversations.push(JSON.parse(conversationData));
        }
      }
      
      fullConversations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return fullConversations;
    } catch (error) {
      console.error('Error in getAllConversations:', error);
      throw new Error('Failed to get conversations');
    }
  }
  
  async closeActiveConversation(session_id: string): Promise<void> {
    try {
      await redisReady;
      
      const conversationsKey = `session:${session_id}:conversations`;
      let conversationsData = await redisClient.get(conversationsKey);
      
      if (!conversationsData) {
        return;
      }
      
      let conversations: ConversationSummary[] = JSON.parse(conversationsData);
      
      const activeIndex = conversations.findIndex(conv => conv.status === ConversationStatus.ACTIVE);
      
      if (activeIndex !== -1) {
        conversations[activeIndex].status = ConversationStatus.CLOSED;
        await redisClient.set(conversationsKey, JSON.stringify(conversations), {
          EX: this.CONVERSATION_TTL
        });
        
        const conversationKey = `conversation:${conversations[activeIndex].id}`;
        const conversationData = await redisClient.get(conversationKey);
        if (conversationData) {
          const conversation: Conversation = JSON.parse(conversationData);
          conversation.status = ConversationStatus.CLOSED;
          conversation.updated_at = new Date().toISOString();
          await redisClient.set(conversationKey, JSON.stringify(conversation), {
            EX: this.CONVERSATION_TTL
          });
        }
        
        console.log(`[Conversation] Closed: ${conversations[activeIndex].id}`);
      }
    } catch (error) {
      console.error('Error in closeActiveConversation:', error);
    }
  }
  
  async deleteConversation(conversation_id: string, session_id?: string): Promise<{ id: string; deleted: boolean } | null> {
    try {
      await redisReady;
      
      const conversationKey = `conversation:${conversation_id}`;
      const conversation = await redisClient.get(conversationKey);
      
      if (!conversation) {
        return null;
      }
      
      const conversationData: Conversation = JSON.parse(conversation);
      const targetSessionId = session_id || conversationData.session_id;
      
      await redisClient.del(conversationKey);
      
      const conversationsKey = `session:${targetSessionId}:conversations`;
      let conversationsData = await redisClient.get(conversationsKey);
      
      if (conversationsData) {
        let conversations: ConversationSummary[] = JSON.parse(conversationsData);
        conversations = conversations.filter(conv => conv.id !== conversation_id);
        await redisClient.set(conversationsKey, JSON.stringify(conversations), {
          EX: this.CONVERSATION_TTL
        });
      }
      
      console.log(`[Conversation] Deleted: ${conversation_id}`);
      return { id: conversation_id, deleted: true };
    } catch (error) {
      console.error('Error in deleteConversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }
  
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

export default new ConversationService();
