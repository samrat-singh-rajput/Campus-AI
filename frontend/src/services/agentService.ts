import { apiClient } from './api';

export interface ToolExecutionInfo {
  tool_name: string;
  description: string;
  status: string;
  result_summary: string;
}

export interface AgentChatResponse {
  conversation_id: string;
  reply: string;
  tools_used: ToolExecutionInfo[];
  context_data?: Record<string, any>;
  created_at: string;
}

export interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  tools_used?: ToolExecutionInfo[];
  timestamp?: string;
}

export const sendAgentChat = async (message: string, conversationId?: string): Promise<AgentChatResponse> => {
  const response = await apiClient.post<AgentChatResponse>('/agent/chat', {
    message: message,
    conversation_id: conversationId,
  });
  return response.data;
};

export const fetchAgentHistory = async (conversationId: string): Promise<ChatMessage[]> => {
  const response = await apiClient.get<ChatMessage[]>(`/agent/history/${conversationId}`);
  return response.data;
};

export const clearAgentHistory = async (conversationId: string): Promise<void> => {
  await apiClient.delete(`/agent/history/${conversationId}`);
};
