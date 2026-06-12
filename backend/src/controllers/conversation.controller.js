const conversationService = require('../services/conversation.service');

exports.createConversation = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'session_id is required',
      });
    }

    const conversation = await conversationService.getOrCreateConversation({
      session_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Conversation ready',
      data: conversation,
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating conversation',
    });
  }
};

exports.createNewConversation = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'session_id is required',
      });
    }

    const conversation = await conversationService.createNewConversation({
      session_id,
    });

    return res.status(200).json({
      success: true,
      message: 'New conversation created',
      data: conversation,
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating new conversation',
    });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { conversation_id } = req.params;

    if (!conversation_id) {
      return res.status(400).json({
        success: false,
        message: 'conversation_id is required',
      });
    }

    const conversation = await conversationService.getConversation(conversation_id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation retrieved successfully',
      data: conversation,
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error getting conversation',
    });
  }
};

exports.getAllConversations = async (req, res) => {
  try {
    const { session_id } = req.params;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'session_id is required',
      });
    }

    const conversations = await conversationService.getAllConversations(session_id);

    return res.status(200).json({
      success: true,
      message: 'Conversations retrieved successfully',
      data: conversations,
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error getting conversations',
    });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { session_id } = req.query;

    const result = await conversationService.deleteConversation(conversation_id, session_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Error deleting conversation',
    });
  }
};
