// Enums
export enum ConversationStatus {
  ACTIVE = "active",
  CLOSED = "closed",
}

// Base interfaces
export interface Conversation {
  id: string;
  session_id: string;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
}

export interface ConversationSummary {
  id: string;
  status: ConversationStatus;
  created_at: string;
}

// Request types
export interface CreateConversationRequest {
  session_id: string;
}

export interface CreateNewConversationRequest {
  session_id: string;
}

export interface GetConversationParams {
  conversation_id: string;
}

export interface GetAllConversationsParams {
  session_id: string;
}

export interface DeleteConversationParams {
  conversation_id: string;
  session_id?: string;
}

// Response types - make message flexible
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export type CreateConversationResponse = ApiResponse<Conversation>;
export type CreateNewConversationResponse = ApiResponse<Conversation>;
export type GetConversationResponse = ApiResponse<Conversation>;
export type GetAllConversationsResponse = ApiResponse<Conversation[]>;
export type DeleteConversationResponse = ApiResponse<{ id: string; deleted: boolean }>;

// Service method parameters
export interface GetOrCreateConversationParams {
  session_id: string;
}

export interface CreateNewConversationServiceParams {
  session_id: string;
}

export interface DeleteConversationServiceParams {
  conversation_id: string;
  session_id?: string;
}
