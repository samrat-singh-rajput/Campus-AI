from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class SkillGapItem(BaseModel):
    skill: str
    importance: str
    associated_job_count: int

class CareerInsightsResponse(BaseModel):
    user_id: str
    user_name: str
    college: str
    degree: str
    career_readiness_score: float = Field(..., ge=0, le=100)
    ats_score: Optional[int] = None
    skills_count: int
    job_matches_count: int
    high_fit_jobs_count: int
    applications_count: int
    interviews_count: int
    average_interview_score: float
    top_strengths: List[str]
    recommended_skill_gaps: List[SkillGapItem]
    growth_advice: List[str]
    updated_at: datetime

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    graduationYear: Optional[int] = None
    target_role: Optional[str] = None
    skills: Optional[List[str]] = None
