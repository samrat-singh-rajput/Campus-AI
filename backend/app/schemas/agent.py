from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class AgentChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt or question to the AI Agent")
    conversation_id: Optional[str] = Field(None, description="Optional ID to continue an ongoing conversation")

class ToolExecutionInfo(BaseModel):
    tool_name: str
    description: str
    status: str
    result_summary: str

class AgentChatResponse(BaseModel):
    conversation_id: str
    reply: str
    tools_used: List[ToolExecutionInfo]
    context_data: Optional[Dict[str, Any]] = None
    created_at: datetime

class ChatMessage(BaseModel):
    sender: str  # user or agent
    text: str
    tools_used: Optional[List[ToolExecutionInfo]] = None
    timestamp: datetime
