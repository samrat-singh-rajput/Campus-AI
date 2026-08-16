from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class SectionCheck(BaseModel):
    name: str
    present: bool
    score: int
    feedback: str

class ATSBreakdown(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    rating: str  # Excellent, Strong, Needs Improvement, Critical
    section_checks: List[SectionCheck]
    matched_skills_count: int
    suggestions: List[str]
    missing_recommended_keywords: List[str]

class ParsedResumeData(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    links: List[str] = []
    extracted_skills: List[str] = []
    skill_categories: Dict[str, List[str]] = {}
    education: List[str] = []
    experience_highlights: List[str] = []
    detected_sections: List[str] = []
    word_count: int = 0
    ats_analysis: ATSBreakdown

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_size_bytes: int
    created_at: datetime
    parsed_data: ParsedResumeData

    class Config:
        from_attributes = True
