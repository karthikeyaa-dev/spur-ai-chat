import { Request, Response } from 'express';
import { messageService } from '../services/message.service';

export class MessageController {
  /**
   * POST /api/conversations/:conversationId/messages
   * Send a message in a conversation (handles both guest and authenticated)
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const conversationId = req.params.conversationId as string;
      const { content, session_id } = req.body;

      const principal = userId
        ? { type: 'user' as const, userId }
        : { type: 'guest' as const, sessionId: session_id };

      if (!userId && !session_id) {
        return res.status(400).json({
          success: false,
          message: 'session_id is required for guest users',
          data: null,
          error: 'Missing session_id',
        });
      }

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required',
          data: null,
          error: 'Missing content',
        });
      }

      const result = await messageService.sendMessage(
        principal,
        conversationId,
        content
      );

      return res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          user_message: result.userMessage,
          assistant_message: result.assistantMessage,
          conversation_id: result.conversationId,
          is_guest: result.isGuest,
        },
        error: null,
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to send message',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  /**
   * GET /api/conversations/:conversationId/messages
   * Get messages from a conversation (handles both guest and authenticated)
   */
  static async getMessages(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const conversationId = req.params.conversationId as string;
      const { session_id } = req.query;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const before = req.query.before ? new Date(req.query.before as string) : undefined;
      const after = req.query.after ? new Date(req.query.after as string) : undefined;

      const principal = userId
        ? { type: 'user' as const, userId }
        : { type: 'guest' as const, sessionId: session_id as string };

      if (!userId && !session_id) {
        return res.status(400).json({
          success: false,
          message: 'session_id is required for guest users',
          data: null,
          error: 'Missing session_id',
        });
      }

      const result = await messageService.getMessages(
        principal,
        conversationId,
        { limit, offset, before, after }
      );

      return res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: result.messages,
        pagination: {
          total: result.total,
          limit,
          offset,
        },
        is_guest: result.isGuest,
        error: null,
      });
    } catch (error: any) {
      console.error('Get messages error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get messages',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  /**
   * DELETE /api/conversations/:conversationId/messages/:messageId
   * Delete a specific message (handles both guest and authenticated)
   */
  static async deleteMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const conversationId = req.params.conversationId as string;
      const messageId = req.params.messageId as string;
      const { session_id } = req.query;

      const principal = userId
        ? { type: 'user' as const, userId }
        : { type: 'guest' as const, sessionId: session_id as string };

      if (!userId && !session_id) {
        return res.status(400).json({
          success: false,
          message: 'session_id is required for guest users',
          data: null,
          error: 'Missing session_id',
        });
      }

      const result = await messageService.deleteMessage(
        principal,
        conversationId,
        messageId
      );

      if (!result.deleted) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
          data: null,
          error: 'Message not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
        data: null,
        error: null,
      });
    } catch (error: any) {
      console.error('Delete message error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete message',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  /**
   * DELETE /api/conversations/:conversationId/messages
   * Clear all messages in a conversation (handles both guest and authenticated)
   */
  static async clearMessages(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const conversationId = req.params.conversationId as string;
      const { session_id } = req.query;

      const principal = userId
        ? { type: 'user' as const, userId }
        : { type: 'guest' as const, sessionId: session_id as string };

      if (!userId && !session_id) {
        return res.status(400).json({
          success: false,
          message: 'session_id is required for guest users',
          data: null,
          error: 'Missing session_id',
        });
      }

      const result = await messageService.clearMessages(
        principal,
        conversationId
      );

      return res.status(200).json({
        success: true,
        message: 'Messages cleared successfully',
        data: null,
        error: null,
      });
    } catch (error: any) {
      console.error('Clear messages error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to clear messages',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }
}
