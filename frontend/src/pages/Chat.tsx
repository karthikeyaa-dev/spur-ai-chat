// src/app/chat/page.tsx or Chat.tsx
'use client';

import { useState, useEffect } from 'react';
import ChatWindow from '@/components/ui/chat/ChatWindow';
import Sidebar from '@/components/ui/sidebar/Sidebar';
import type { Message, Conversation } from '@/types/chat';

// Mock data - Replace with actual API calls
const mockSendMessage = async (message: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
  
  const responses = [
    "That's a great question! Let me think about that... Here's what I understand from your query.",
    "I understand what you're asking. Here's my perspective on this topic with some key insights.",
    "Great point! Let me break this down for you step by step with clear explanations.",
    "Thanks for asking! Let me share some thoughts and analysis on this subject.",
    "Interesting! Here's a detailed response that addresses your question comprehensively.",
    "I appreciate your question. Let me provide a thorough explanation with examples.",
    "That's a thoughtful question. Here's my detailed response with actionable insights.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Mock conversations
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'React component help',
    lastMessage: 'Thanks for the help!',
    timestamp: new Date().toISOString(),
    isPinned: false,
    isStarred: false,
  },
  {
    id: '2',
    title: 'JavaScript debugging',
    lastMessage: 'Found the issue!',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isPinned: false,
    isStarred: true,
  },
  {
    id: '3',
    title: 'AI model discussion',
    lastMessage: 'That makes sense',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isPinned: false,
    isStarred: false,
  },
];

export default function ChatPage() {
  // State
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isNewChat, setIsNewChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial messages for first conversation
  useEffect(() => {
    if (!isInitialized && currentConversationId) {
      loadConversationMessages(currentConversationId);
      setIsInitialized(true);
    }
  }, [currentConversationId, isInitialized]);

  // Load messages for a conversation
  const loadConversationMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockMessages: Message[] = [
        {
          id: '1',
          role: 'assistant',
          content: `Hello! I'm your AI assistant. How can I help you?`,
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          role: 'user',
          content: `I need help with my project. Can you assist me?`,
          timestamp: new Date(Date.now() - 3000000),
        },
        {
          id: '3',
          role: 'assistant',
          content: `Of course! I'd be happy to help. What specific aspect would you like to discuss?`,
          timestamp: new Date(Date.now() - 2400000),
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let newConversation: Conversation | undefined;
      
      // If this is a new chat, create a new conversation
      if (isNewChat) {
        newConversation = {
          id: `conv_${Date.now()}`,
          title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
          lastMessage: message,
          timestamp: new Date().toISOString(),
          isPinned: false,
          isStarred: false,
        };
        setConversations(prev => [newConversation!, ...prev]);
        setCurrentConversationId(newConversation.id);
        setIsNewChat(false);
      }

      // Mock response
      const response = await mockSendMessage(message);
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation last message
      const conversationIdToUpdate = currentConversationId || newConversation?.id;
      if (conversationIdToUpdate) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationIdToUpdate 
              ? { ...conv, lastMessage: message, timestamp: new Date().toISOString() }
              : conv
          )
        );
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Handle creating a new conversation
  const handleNewChat = () => {
    console.log('🆕 Creating new chat from ChatPage');
    setCurrentConversationId(undefined);
    setMessages([]);
    setIsNewChat(true);
  };

  // Handle selecting an existing conversation
  const handleSelectConversation = async (conversationId: string) => {
    if (conversationId === currentConversationId) return;
    
    setCurrentConversationId(conversationId);
    setIsNewChat(false);
    await loadConversationMessages(conversationId);
  };

  // Get current chat name
  const currentChatName = conversations.find(c => c.id === currentConversationId)?.title || 'New Chat';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        conversations={conversations}
        activeConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        className="flex-shrink-0"
      />
      
      <main className="flex-1 flex flex-col bg-muted/10 overflow-hidden">
        <ChatWindow
          conversationId={currentConversationId}
          chatName={currentChatName}
          className="flex-1"
        />
      </main>
    </div>
  );
}
