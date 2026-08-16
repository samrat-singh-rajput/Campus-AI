from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class InterviewStartRequest(BaseModel):
    domain: str = Field("Full Stack Engineering", description="Target role domain")
    difficulty: str = Field("Medium", description="Easy, Medium, Hard")
    question_count: int = Field(3, ge=1, le=10)

class QuestionItem(BaseModel):
    question_id: str
    category: str
    question_text: str
    key_concepts: List[str]

class InterviewSessionResponse(BaseModel):
    session_id: str
    user_id: str
    domain: str
    difficulty: str
    questions: List[QuestionItem]
    status: str
    created_at: datetime

class AnswerSubmitRequest(BaseModel):
    session_id: str
    question_id: str
    candidate_answer: str

class AnswerFeedbackResult(BaseModel):
    question_id: str
    score: int = Field(..., ge=0, le=100)
    rating: str
    clarity_score: int
    technical_accuracy_score: int
    strengths: List[str]
    missing_concepts: List[str]
    improvement_feedback: str
    ideal_sample_response: str

class SessionSummaryResponse(BaseModel):
    session_id: str
    user_id: str
    domain: str
    total_questions: int
    average_score: float
    overall_rating: str
    feedback_summary: str
    created_at: datetime
