import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { authOptional } from '../middleware/auth';

const router = Router();

// Apply auth middleware (optional - handles both guest and authenticated)
router.use(authOptional);

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Conversation management endpoints (supports both guest and authenticated users)
 */

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Conversations]
 *     description: Creates a new conversation for either a guest or authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *                 description: Required for guest users
 *                 example: guest-session-123
 *               title:
 *                 type: string
 *                 description: Optional conversation title
 *                 example: My New Chat
 *     responses:
 *       201:
 *         description: Conversation created successfully
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
 *                   example: Conversation created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     storage:
 *                       type: string
 *                       enum: [db, redis]
 *                       example: db
 *                     conversation:
 *                       type: object
 *                     isGuest:
 *                       type: boolean
 *                       example: false
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing session_id for guest users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: session_id is required for guest users
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/', ConversationController.createConversation);

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: List all conversations
 *     tags: [Conversations]
 *     description: Retrieves all conversations for the authenticated user or guest (using session_id)
 *     parameters:
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Required for guest users
 *         example: guest-session-123
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
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
 *                   example: Conversations retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: conv_123
 *                       title:
 *                         type: string
 *                         example: My New Chat
 *                       status:
 *                         type: string
 *                         enum: [active, closed]
 *                         example: active
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       last_message:
 *                         type: string
 *                         nullable: true
 *                         example: Hello, how can I help?
 *                       last_message_role:
 *                         type: string
 *                         nullable: true
 *                         enum: [user, assistant]
 *                       message_count:
 *                         type: integer
 *                         example: 5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                 is_guest:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing session_id for guest users
 *       500:
 *         description: Internal server error
 */
router.get('/', ConversationController.listConversations);

/**
 * @swagger
 * /api/conversations/{id}:
 *   get:
 *     summary: Get a single conversation with messages
 *     tags: [Conversations]
 *     description: Retrieves a specific conversation with all its messages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *         example: conv_123
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Required for guest users
 *         example: guest-session-123
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
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
 *                   example: Conversation retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           role:
 *                             type: string
 *                             enum: [user, assistant, system]
 *                           content:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                 is_guest:
 *                   type: boolean
 *                   example: false
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
router.get('/:id', ConversationController.getConversation);

/**
 * @swagger
 * /api/conversations/{id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Conversations]
 *     description: Permanently deletes a conversation and all its messages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *         example: conv_123
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Required for guest users
 *         example: guest-session-123
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
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
 *                   example: Conversation deleted successfully
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
router.delete('/:id', ConversationController.deleteConversation);

/**
 * @swagger
 * /api/conversations/{id}/title:
 *   patch:
 *     summary: Update conversation title
 *     tags: [Conversations]
 *     description: Updates the title of a conversation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *         example: conv_123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: New title for the conversation
 *                 example: Updated Chat Title
 *               session_id:
 *                 type: string
 *                 description: Required for guest users
 *                 example: guest-session-123
 *     responses:
 *       200:
 *         description: Title updated successfully
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
 *                   example: Title updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                 is_guest:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing title or session_id
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/title', ConversationController.updateTitle);

/**
 * @swagger
 * /api/conversations/{id}/close:
 *   post:
 *     summary: Close a conversation
 *     tags: [Conversations]
 *     description: Marks a conversation as closed (no longer active)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *         example: conv_123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *                 description: Required for guest users
 *                 example: guest-session-123
 *     responses:
 *       200:
 *         description: Conversation closed successfully
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
 *                   example: Conversation closed successfully
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
router.post('/:id/close', ConversationController.closeConversation);

export default router;
