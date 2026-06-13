import { Router } from "express";
import {
  createConversation,
  createNewConversation,
  getConversation,
  getAllConversations,
  deleteConversation,
} from "../controllers/conversation.controller";

const router = Router();

/**
 * @swagger
 * /api/conversation:
 *   post:
 *     summary: Get or create an active conversation
 *     description: Returns existing active conversation or creates a new one for the session
 *     tags: [Conversations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *             properties:
 *               session_id:
 *                 type: string
 *                 description: Unique session identifier
 *                 example: session_123456
 *     responses:
 *       200:
 *         description: Conversation ready
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
 *                   example: Conversation ready
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     session_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, closed]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: session_id is required
 *       500:
 *         description: Server error
 */
router.post("/conversation", createConversation);

/**
 * @swagger
 * /api/conversation/new:
 *   post:
 *     summary: Create a new conversation
 *     description: Closes any active conversation and creates a new one for the session
 *     tags: [Conversations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *             properties:
 *               session_id:
 *                 type: string
 *                 description: Unique session identifier
 *                 example: session_123456
 *     responses:
 *       200:
 *         description: New conversation created
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
 *                   example: New conversation created
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     session_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, closed]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: session_id is required
 *       500:
 *         description: Server error
 */
router.post("/conversation/new", createNewConversation);

/**
 * @swagger
 * /api/conversation/{conversation_id}:
 *   get:
 *     summary: Get a specific conversation by ID
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The conversation ID
 *         example: conv_1234567890_abc123
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
 *                     session_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, closed]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: conversation_id is required
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.get("/conversation/:conversation_id", getConversation);

/**
 * @swagger
 * /api/conversations/{session_id}:
 *   get:
 *     summary: Get all conversations for a session
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *         example: session_123456
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
 *                       session_id:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, closed]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: session_id is required
 *       500:
 *         description: Server error
 */
router.get("/conversations/:session_id", getAllConversations);

/**
 * @swagger
 * /api/conversation/{conversation_id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Conversations]
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The conversation ID to delete
 *         example: conv_1234567890_abc123
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         description: Optional session ID for verification
 *         example: session_123456
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     deleted:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Error deleting conversation
 *       404:
 *         description: Conversation not found
 */
router.delete("/conversation/:conversation_id", deleteConversation);

export default router;
