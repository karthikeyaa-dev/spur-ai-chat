import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found. Using mock responses.');
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // ✅ FIX: Use correct model name - 'gemini-1.5-flash' or 'gemini-pro'
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.0-pro', // ✅ Correct model name
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.95,
        topK: 40,
      },
    });
  }

  /**
   * Chat completion with context
   */
  async chat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<{ message: string }> {
    try {
      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return { message: this.mockResponse(messages[messages.length - 1]?.content || '') };
      }

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
      };
    } catch (error: any) {
      console.error('LLM Error:', error);
      // Fallback to mock response
      const lastMessage = messages[messages.length - 1]?.content || '';
      return { message: this.mockResponse(lastMessage) };
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
      if (!process.env.GEMINI_API_KEY) {
        return this.mockResponse(userMessage);
      }

      const prompt = context
        ? `Context: ${context}\n\nUser: ${userMessage}\n\nAssistant:`
        : `User: ${userMessage}\n\nAssistant:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('LLM Error:', error);
      return this.mockResponse(userMessage);
    }
  }

  /**
   * Customer support chat with system prompt
   */
  async customerSupportChat(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    // If no API key, use mock
    if (!process.env.GEMINI_API_KEY) {
      return this.mockResponse(userMessage);
    }

    try {
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
    } catch (error) {
      console.error('LLM Error:', error);
      return this.mockResponse(userMessage);
    }
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
   * Mock response for testing (fallback)
   */
  private mockResponse(message: string): string {
    const msg = message.toLowerCase();
    
    if (msg.includes('password') || msg.includes('reset')) {
      return `I can help you reset your password! Here's how:

1. Go to the login page and click "Forgot Password"
2. Enter your registered email address
3. Check your email for a reset link
4. Click the link and follow the instructions
5. Create a new password (at least 8 characters)

If you don't receive the email, please check your spam folder. Is there anything else I can help with?`;
    }
    
    if (msg.includes('login') || msg.includes('sign in')) {
      return `Having trouble logging in? Let me help you:

1. Make sure you're using the correct email address
2. Check that Caps Lock isn't on
3. Try resetting your password using the "Forgot Password" link
4. Clear your browser cache and cookies

Are you seeing any specific error messages?`;
    }
    
    if (msg.includes('account') || msg.includes('register')) {
      return `I can help you with your account! Here are some common topics:

- Account creation: Sign up with your email and create a password
- Account verification: Check your email for a verification link
- Profile settings: Update your name, email, or password
- Account security: Enable 2FA for extra protection

What specific account issue are you experiencing?`;
    }
    
    return `Thank you for your message! I'm here to help you with any questions about Spur AI Chat.

Here are some things I can assist with:
- 🔐 Password reset and login issues
- 📝 Account management
- 💳 Billing and subscriptions
- 🐛 Technical problems
- ❓ General questions

Could you please provide more details about your question so I can better assist you?`;
  }
}

export default new LLMService();
