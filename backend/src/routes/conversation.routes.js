const express = require('express');
const conversationController = require('../controllers/conversation.controller');
const router = express.Router();

/**
 * @swagger
 * /api/conversation:
 *   post:
 *     summary: Create or get active conversation
 *     tags: [Conversation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conversation ready
 */
router.post('/conversation', conversationController.createConversation);

/**
 * @swagger
 * /api/conversation/new:
 *   post:
 *     summary: Create a new conversation (closes active one)
 *     tags: [Conversation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: New conversation created
 */
router.post('/conversation/new', conversationController.createNewConversation);

/**
 * @swagger
 * /api/conversations/{session_id}:
 *   get:
 *     summary: Get all conversations for a session
 *     tags: [Conversation]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations/:session_id', conversationController.getAllConversations);

/**
 * @swagger
 * /api/conversation/{conversation_id}:
 *   get:
 *     summary: Get specific conversation
 *     tags: [Conversation]
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation details
 */
router.get('/conversation/:conversation_id', conversationController.getConversation);

/**
 * @swagger
 * /api/conversation/{conversation_id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Conversation]
 *     parameters:
 *       - in: path
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete('/conversation/:conversation_id', conversationController.deleteConversation);

module.exports = router;
