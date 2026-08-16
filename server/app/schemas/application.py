from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ApplicationCreate(BaseModel):
    job_id: str
    notes: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., description="Applied, Interviewing, Offered, Rejected, Saved")

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: str
    applied_at: datetime
    ats_score_at_apply: int
    ml_eligibility_score: float
    vector_similarity_score: float
    combined_match_score: float
    notes: Optional[str] = None
    job_snapshot: Dict[str, Any]

    class Config:
        from_attributes = True
