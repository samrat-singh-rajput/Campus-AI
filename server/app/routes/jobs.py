import logging
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.job import JobCreate, JobResponse, MLEligibilityResult, ModelTrainResponse
from app.routes.auth import get_current_user
from app.services.job_service import (
    get_all_jobs, 
    get_job_by_id, 
    create_new_job, 
    evaluate_user_recommendations,
    seed_jobs_if_empty
)
from app.services.ml_engine import evaluate_job_eligibility, train_and_save_model
from app.database.mongodb import get_database

logger = logging.getLogger("campusmate.routes.jobs")
router = APIRouter(prefix="/api/jobs", tags=["ML Job Engine & Recommendations"])

@router.get("", response_model=List[JobResponse], status_code=status.HTTP_200_OK)
async def list_jobs(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves all campus placement jobs."""
    jobs = await get_all_jobs()
    return [JobResponse(**j) for j in jobs]

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_in: JobCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Posts a new job opportunity to MongoDB Atlas."""
    job_doc = await create_new_job(job_in.model_dump())
    return JobResponse(**job_doc)

@router.get("/recommendations/me", response_model=List[JobResponse], status_code=status.HTTP_200_OK)
async def get_my_job_recommendations(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Evaluates authenticated student profile against all job postings using Scikit-Learn Random Forest ML model."""
    evaluated_jobs = await evaluate_user_recommendations(current_user)
    return [JobResponse(**j) for j in evaluated_jobs]

@router.post("/evaluate/{job_id}", response_model=MLEligibilityResult, status_code=status.HTTP_200_OK)
async def evaluate_single_job(
    job_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Executes Random Forest ML inference to compute candidate eligibility score for a specific job."""
    job = await get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{job_id}' not found."
        )

    user_skills = current_user.get("skills", ["Python", "FastAPI", "React", "MongoDB"])
    user_degree = current_user.get("degree", "B.S. Computer Science")

    # Fetch user's latest ATS score
    ats_score = 75
    db = get_database()
    if db is not None:
        user_id = str(current_user.get("id", current_user.get("_id")))
        latest_resume = await db.resumes.find_one({"user_id": user_id}, sort=[("created_at", -1)])
        if latest_resume and "parsed_data" in latest_resume:
            ats_score = latest_resume["parsed_data"].get("ats_analysis", {}).get("overall_score", 75)

    eval_result = evaluate_job_eligibility(
        candidate_skills=user_skills,
        candidate_degree=user_degree,
        ats_score=ats_score,
        job_id=job["id"],
        job_title=job["title"],
        company=job["company"],
        required_skills=job.get("required_skills", []),
        preferred_degree=job.get("preferred_degree")
    )
    return MLEligibilityResult(**eval_result)

@router.post("/train-model", response_model=ModelTrainResponse, status_code=status.HTTP_200_OK)
async def train_ml_model(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Triggers re-training of the Scikit-Learn RandomForestClassifier model."""
    _, accuracy, n_samples = train_and_save_model()
    return ModelTrainResponse(
        status="success",
        samples_count=n_samples,
        accuracy_score=round(accuracy * 100.0, 2),
        model_path="server/models/job_eligibility_model.joblib"
    )
