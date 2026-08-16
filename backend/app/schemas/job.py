from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class JobCreate(BaseModel):
    title: str = Field(..., min_length=2)
    company: str = Field(..., min_length=2)
    location: str
    job_type: str = "Full-time"  # Full-time, Part-time, Internship, Remote
    description: str
    required_skills: List[str]
    preferred_degree: Optional[str] = None
    min_experience_years: int = 0
    salary_range: Optional[str] = None

class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    job_type: str
    description: str
    required_skills: List[str]
    preferred_degree: Optional[str] = None
    min_experience_years: int = 0
    salary_range: Optional[str] = None
    created_at: datetime
    match_result: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class MLEligibilityResult(BaseModel):
    job_id: str
    job_title: str
    company: str
    eligibility_score: float = Field(..., ge=0.0, le=100.0)
    classification: str  # High Fit, Moderate Fit, Unlikely Fit
    matched_skills: List[str]
    missing_skills: List[str]
    skill_match_ratio: float
    ats_score_used: int
    recommendation_note: str

class ModelTrainResponse(BaseModel):
    status: str
    samples_count: int
    accuracy_score: float
    model_path: str
