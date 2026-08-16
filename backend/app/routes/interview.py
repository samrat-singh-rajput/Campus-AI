import logging
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewSessionResponse,
    AnswerSubmitRequest,
    AnswerFeedbackResult,
    SessionSummaryResponse
)
from app.routes.auth import get_current_user
from app.services.interview_service import (
    create_interview_session,
    evaluate_candidate_answer,
    complete_interview_session,
    get_user_interview_history
)

logger = logging.getLogger("campusmate.routes.interview")
router = APIRouter(prefix="/api/interview", tags=["AI Mock Interview Coach"])

@router.post("/start", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_interview(
    req: InterviewStartRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Starts a new AI mock interview session with domain-tailored technical questions."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    session_doc = await create_interview_session(
        user_id=user_id,
        domain=req.domain,
        difficulty=req.difficulty,
        question_count=req.question_count
    )
    return InterviewSessionResponse(**session_doc)

@router.post("/answer", response_model=AnswerFeedbackResult, status_code=status.HTTP_200_OK)
async def submit_answer(
    req: AnswerSubmitRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Evaluates candidate text/voice response for technical accuracy, clarity, and concept coverage."""
    feedback = evaluate_candidate_answer(
        question_id=req.question_id,
        candidate_answer=req.candidate_answer
    )
    return AnswerFeedbackResult(**feedback)

@router.post("/finish/{session_id}", response_model=SessionSummaryResponse, status_code=status.HTTP_200_OK)
async def finish_interview(
    session_id: str,
    evaluations: List[AnswerFeedbackResult],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Computes aggregate performance metrics for a completed interview session and updates MongoDB Atlas."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    summary = await complete_interview_session(
        session_id=session_id,
        user_id=user_id,
        evaluations=[e.model_dump() for e in evaluations]
    )
    return SessionSummaryResponse(**summary)

@router.get("/history/me", response_model=List[SessionSummaryResponse], status_code=status.HTTP_200_OK)
async def get_my_interview_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves candidate's past completed mock interview sessions."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    history = await get_user_interview_history(user_id)
    return [SessionSummaryResponse(**h) for h in history]
