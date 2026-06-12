const { redisClient } = require('../config/redis');

class ConversationService {
  async getOrCreateConversation({ session_id }) {
    try {
      const conversationsKey = `session:${session_id}:conversations`;
      
      let conversationsData = await redisClient.get(conversationsKey);
      let conversations = conversationsData ? JSON.parse(conversationsData) : [];
      
      let activeConversation = conversations.find(conv => conv.status === 'active');
      
      if (activeConversation) {
        const conversationKey = `conversation:${activeConversation.id}`;
        const conversationData = await redisClient.get(conversationKey);
        if (conversationData) {
          return JSON.parse(conversationData);
        }
      }
      
      const newConversationId = this.generateConversationId();
      const newConversation = {
        id: newConversationId,
        session_id: session_id,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const conversationKey = `conversation:${newConversationId}`;
      await redisClient.set(conversationKey, JSON.stringify(newConversation), {
        EX: 86400 // 24 hours
      });
      

      conversations.push({
        id: newConversationId,
        status: 'active',
        created_at: newConversation.created_at
      });
      
      await redisClient.set(conversationsKey, JSON.stringify(conversations), {
        EX: 86400
      });
      
      console.log(`[Conversation] Created: ${newConversationId} for session ${session_id}`);
      return newConversation;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      throw new Error('Failed to get or create conversation');
    }
  }
  
  async createNewConversation({ session_id }) {
    try {
      await this.closeActiveConversation(session_id);

      const newConversationId = this.generateConversationId();
      const newConversation = {
        id: newConversationId,
        session_id: session_id,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const conversationKey = `conversation:${newConversationId}`;
      await redisClient.set(conversationKey, JSON.stringify(newConversation), {
        EX: 86400
      });
      
      const conversationsKey = `session:${session_id}:conversations`;
      let conversationsData = await redisClient.get(conversationsKey);
      let conversations = conversationsData ? JSON.parse(conversationsData) : [];
      

      conversations.push({
        id: newConversationId,
        status: 'active',
        created_at: newConversation.created_at
      });
      
      await redisClient.set(conversationsKey, JSON.stringify(conversations), {
        EX: 86400
      });
      
      console.log(`[Conversation] Created new conversation: ${newConversationId} for session ${session_id}`);
      return newConversation;
    } catch (error) {
      console.error('Error in createNewConversation:', error);
      throw new Error('Failed to create new conversation');
    }
  }
  
  async getConversation(conversation_id) {
    try {
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
  
  async getAllConversations(session_id) {
    try {
      const conversationsKey = `session:${session_id}:conversations`;
      let conversationsData = await redisClient.get(conversationsKey);
      
      if (!conversationsData) {
        return [];
      }
      
      const conversationsList = JSON.parse(conversationsData);
      
      const fullConversations = [];
      for (const conv of conversationsList) {
        const conversationKey = `conversation:${conv.id}`;
        const conversationData = await redisClient.get(conversationKey);
        if (conversationData) {
          fullConversations.push(JSON.parse(conversationData));
        }
      }
      
      fullConversations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return fullConversations;
    } catch (error) {
      console.error('Error in getAllConversations:', error);
      throw new Error('Failed to get conversations');
    }
  }
  
  async closeActiveConversation(session_id) {
    try {
      const conversationsKey = `session:${session_id}:conversations`;
      let conversationsData = await redisClient.get(conversationsKey);
      
      if (!conversationsData) {
        return;
      }
      
      let conversations = JSON.parse(conversationsData);
      
      const activeIndex = conversations.findIndex(conv => conv.status === 'active');
      
      if (activeIndex !== -1) {
        conversations[activeIndex].status = 'closed';
        await redisClient.set(conversationsKey, JSON.stringify(conversations), {
          EX: 86400
        });
        
        const conversationKey = `conversation:${conversations[activeIndex].id}`;
        const conversationData = await redisClient.get(conversationKey);
        if (conversationData) {
          const conversation = JSON.parse(conversationData);
          conversation.status = 'closed';
          conversation.updated_at = new Date().toISOString();
          await redisClient.set(conversationKey, JSON.stringify(conversation), {
            EX: 86400
          });
        }
        
        console.log(`[Conversation] Closed: ${conversations[activeIndex].id}`);
      }
    } catch (error) {
      console.error('Error in closeActiveConversation:', error);
    }
  }
  
  async deleteConversation(conversation_id, session_id = null) {
    try {
      const conversationKey = `conversation:${conversation_id}`;
      const conversation = await redisClient.get(conversationKey);
      
      if (!conversation) {
        return null;
      }
      
      const conversationData = JSON.parse(conversation);
      const targetSessionId = session_id || conversationData.session_id;
      
      await redisClient.del(conversationKey);
      
      const conversationsKey = `session:${targetSessionId}:conversations`;
      let conversationsData = await redisClient.get(conversationsKey);
      
      if (conversationsData) {
        let conversations = JSON.parse(conversationsData);
        conversations = conversations.filter(conv => conv.id !== conversation_id);
        await redisClient.set(conversationsKey, JSON.stringify(conversations), {
          EX: 86400
        });
      }
      
      console.log(`[Conversation] Deleted: ${conversation_id}`);
      return { id: conversation_id, deleted: true };
    } catch (error) {
      console.error('Error in deleteConversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }
  
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new ConversationService();
