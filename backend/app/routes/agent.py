import logging
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.agent import AgentChatRequest, AgentChatResponse, ChatMessage
from app.routes.auth import get_current_user
from app.services.agent_engine import (
    run_langgraph_agent, 
    get_conversation_history, 
    clear_conversation_history
)

logger = logging.getLogger("campusmate.routes.agent")
router = APIRouter(prefix="/api/agent", tags=["LangGraph AI Agent"])

@router.post("/chat", response_model=AgentChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_agent(
    req: AgentChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Submits a query to the autonomous LangGraph Agent, executing real tools from Steps 5-8."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    try:
        response_data = await run_langgraph_agent(
            user_id=user_id,
            user_profile=current_user,
            message=req.message,
            conversation_id=req.conversation_id
        )
        return AgentChatResponse(**response_data)
    except Exception as err:
        logger.error(f"Error executing LangGraph agent: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LangGraph Agent execution error: {str(err)}"
        )

@router.get("/history/{conversation_id}", response_model=List[ChatMessage], status_code=status.HTTP_200_OK)
async def get_history(
    conversation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Retrieves chat message history for a conversation session."""
    history = get_conversation_history(conversation_id)
    return [ChatMessage(**msg) for msg in history]

@router.delete("/history/{conversation_id}", status_code=status.HTTP_200_OK)
async def clear_history(
    conversation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Clears conversation history for a given session."""
    success = clear_conversation_history(conversation_id)
    return {"status": "success", "cleared": success}
