import { Request, Response } from 'express';
import { conversationService } from '../services/conversation.service';

export class ConversationController {
  /**
   * POST /api/conversations
   * Create a new conversation
   */
  static async createConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { session_id, title } = req.body;

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

      const result = await conversationService.createConversation(principal, title);

      return res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: result,
        error: null,
      });
    } catch (error: any) {
      console.error('Create conversation error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create conversation',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  /**
   * GET /api/conversations
   * List all conversations (handles both guest and authenticated)
   */
  static async listConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
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

      const result = await conversationService.listConversations(principal);

      return res.status(200).json({
        success: true,
        message: 'Conversations retrieved successfully',
        data: result.conversations,
        pagination: {
          total: result.total,
        },
        is_guest: result.isGuest,
        error: null,
      });
    } catch (error: any) {
      console.error('List conversations error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to list conversations',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  /**
   * GET /api/conversations/:id
   * Get a single conversation with messages (handles both guest and authenticated)
   */
  static async getConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const id = req.params.id as string; // ✅ Cast to string
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

      const result = await conversationService.getConversation(principal, id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
          data: null,
          error: 'Conversation not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Conversation retrieved successfully',
        data: result.conversation,
        is_guest: result.isGuest,
        error: null,
      });
    } catch (error: any) {
      console.error('Get conversation error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get conversation',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  /**
   * DELETE /api/conversations/:id
   * Delete a conversation (handles both guest and authenticated)
   */
  static async deleteConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const id = req.params.id as string; // ✅ Cast to string
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

      const result = await conversationService.deleteConversation(principal, id);

      if (!result.deleted) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
          data: null,
          error: 'Conversation not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully',
        data: null,
        error: null,
      });
    } catch (error: any) {
      console.error('Delete conversation error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete conversation',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  /**
   * PATCH /api/conversations/:id/title
   * Update conversation title (handles both guest and authenticated)
   */
  static async updateTitle(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const id = req.params.id as string; // ✅ Cast to string
      const { title, session_id } = req.body;

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

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required',
          data: null,
          error: 'Missing title',
        });
      }

      const result = await conversationService.updateConversationTitle(
        principal,
        id,
        title
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
          data: null,
          error: 'Conversation not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Title updated successfully',
        data: result.conversation,
        is_guest: result.isGuest,
        error: null,
      });
    } catch (error: any) {
      console.error('Update title error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update title',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

  /**
   * POST /api/conversations/:id/close
   * Close a conversation (handles both guest and authenticated)
   */
  static async closeConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const id = req.params.id as string; // ✅ Cast to string
      const { session_id } = req.body;

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

      const result = await conversationService.closeConversation(principal, id);

      if (!result.closed) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
          data: null,
          error: 'Conversation not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Conversation closed successfully',
        data: null,
        error: null,
      });
    } catch (error: any) {
      console.error('Close conversation error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to close conversation',
        data: null,
        error: error.message || 'Internal server error',
      });
    }
  }

}
