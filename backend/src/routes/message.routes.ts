import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authOptional } from '../middleware/auth';

const router = Router();

// Apply auth middleware (optional - handles both guest and authenticated)
router.use(authOptional);

/**
 * @swagger
 * /api/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the conversation
 *       - in: query
 *         name: session_id
 *         required: false
 *         schema:
 *           type: string
 *         description: |
 *           Required for guest users only.
 *           Optional for authenticated users (JWT token is used).
 *         example: guest-session-123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The user's message
 *                 example: How do I reset my password?
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_message:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         content:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [user, assistant, system]
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     assistant_message:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         content:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [user, assistant, system]
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     conversation_id:
 *                       type: string
 *                     is_guest:
 *                       type: boolean
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: |
 *           Missing required fields:
 *           - content is always required
 *           - session_id is required for guest users
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.post('/:conversationId/messages', MessageController.sendMessage);


/**
 * @swagger
 * /api/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get messages from a conversation
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the conversation
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Required for guest users
 *         example: guest-session-123
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of messages to skip
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages before this date
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages after this date
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Messages retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [user, assistant, system]
 *                       content:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                 is_guest:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing session_id for guest users
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.get('/:conversationId/messages', MessageController.getMessages);

/**
 * @swagger
 * /api/conversations/{conversationId}/messages:
 *   delete:
 *     summary: Clear all messages in a conversation
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the conversation
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Required for guest users
 *         example: guest-session-123
 *     responses:
 *       200:
 *         description: Messages cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Messages cleared successfully
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing session_id for guest users
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:conversationId/messages', MessageController.clearMessages);

/**
 * @swagger
 * /api/conversations/{conversationId}/messages/{messageId}:
 *   delete:
 *     summary: Delete a specific message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the conversation
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message to delete
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Required for guest users
 *         example: guest-session-123
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message deleted successfully
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing session_id for guest users
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:conversationId/messages/:messageId', MessageController.deleteMessage);

export default router;
