import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required. Get it from https://aistudio.google.com/');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', // Fast and free
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });
  }

  /**
   * Chat completion with context
   */
  async chat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<ChatResponse> {
    try {
      // Convert messages to Gemini format
      const chat = this.model.startChat({
        history: this.convertToHistory(messages),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      // Get last message
      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      
      return {
        message: response.text(),
        usage: {
          promptTokens: 0, // Gemini doesn't provide token counts in free tier
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      console.error('LLM Error:', error);
      throw new Error('Failed to get response from AI');
    }
  }

  /**
   * Simple chat without history (one-shot)
   */
  async generateResponse(
    userMessage: string,
    context?: string
  ): Promise<string> {
    try {
      const prompt = context
        ? `Context: ${context}\n\nUser: ${userMessage}\n\nAssistant:`
        : `User: ${userMessage}\n\nAssistant:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('LLM Error:', error);
      throw new Error('Failed to get response from AI');
    }
  }

  /**
   * Customer support chat with system prompt
   */
  async customerSupportChat(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    const systemPrompt = `
      You are a friendly and helpful customer support agent for Spur AI Chat.
      
      Guidelines:
      1. Be polite, professional, and helpful
      2. If you don't know something, be honest about it
      3. Keep responses concise but informative
      4. Ask clarifying questions if needed
      5. Never share sensitive information
      6. Stay on topic and don't make up information
      7. If the user is frustrated, be empathetic and try to help
      
      Common topics you can help with:
      - Account issues (login, registration, verification)
      - Billing and subscriptions
      - Technical problems
      - Feature questions
      - General inquiries
      
      If the user asks something outside your scope, politely direct them to human support.
    `;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const response = await this.chat(messages);
    return response.message;
  }

  /**
   * Convert messages to Gemini history format
   */
  private convertToHistory(messages: ChatMessage[]): any[] {
    // Remove the last message (it will be sent as the current prompt)
    const history = messages.slice(0, -1);
    
    return history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  /**
   * Stream response (for real-time chat)
   */
  async *streamChat(userMessage: string, context?: string): AsyncGenerator<string> {
    try {
      const prompt = context
        ? `Context: ${context}\n\nUser: ${userMessage}\n\nAssistant:`
        : `User: ${userMessage}\n\nAssistant:`;

      const result = await this.model.generateContentStream(prompt);
      
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('Stream Error:', error);
      yield 'Error: Failed to get response from AI';
    }
  }
}

export default new LLMService();
