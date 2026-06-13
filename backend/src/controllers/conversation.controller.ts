import { Request, Response } from "express";
import conversationService from "../services/conversation.service";
import {
  CreateConversationRequest,
  CreateConversationResponse,
  CreateNewConversationResponse,
  GetConversationResponse,
  GetAllConversationsResponse,
  DeleteConversationResponse,
} from "../types/conversation.types";

export const createConversation = async (
  req: Request<{}, {}, CreateConversationRequest>, 
  res: Response<CreateConversationResponse>
): Promise<Response<CreateConversationResponse>> => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "session_id is required",
      });
    }

    const conversation = await conversationService.getOrCreateConversation({
      session_id,
    });

    return res.status(200).json({
      success: true,
      message: "Conversation ready",
      data: conversation,
    });
  } catch (error: any) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating conversation",
    });
  }
};

export const createNewConversation = async (
  req: Request<{}, {}, CreateConversationRequest>, 
  res: Response<CreateNewConversationResponse>
): Promise<Response<CreateNewConversationResponse>> => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "session_id is required",
      });
    }

    const conversation = await conversationService.createNewConversation({
      session_id,
    });

    return res.status(200).json({
      success: true,
      message: "New conversation created",
      data: conversation,
    });
  } catch (error: any) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating new conversation",
    });
  }
};

export const getConversation = async (
  req: Request<{ conversation_id: string }>, 
  res: Response<GetConversationResponse>
): Promise<Response<GetConversationResponse>> => {
  try {
    const { conversation_id } = req.params;

    if (!conversation_id) {
      return res.status(400).json({
        success: false,
        message: "conversation_id is required",
      });
    }

    const conversation = await conversationService.getConversation(conversation_id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation retrieved successfully",
      data: conversation,
    });
  } catch (error: any) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting conversation",
    });
  }
};

export const getAllConversations = async (
  req: Request<{ session_id: string }>, 
  res: Response<GetAllConversationsResponse>
): Promise<Response<GetAllConversationsResponse>> => {
  try {
    const { session_id } = req.params;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "session_id is required",
      });
    }

    const conversations = await conversationService.getAllConversations(session_id);

    return res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      data: conversations,
    });
  } catch (error: any) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting conversations",
    });
  }
};

export const deleteConversation = async (
  req: Request<{ conversation_id: string }, {}, {}, { session_id?: string }>, 
  res: Response<DeleteConversationResponse>
): Promise<Response<DeleteConversationResponse>> => {
  try {
    const { conversation_id } = req.params;
    const { session_id } = req.query;

    const result = await conversationService.deleteConversation(
      conversation_id,
      session_id
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Controller error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Error deleting conversation",
    });
  }
};
