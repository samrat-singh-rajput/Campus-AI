import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from app.database.mongodb import get_database
from app.services.ml_engine import evaluate_job_eligibility

logger = logging.getLogger("campusmate.services.job_service")

# Initial Seed Jobs
INITIAL_SEED_JOBS = [
    {
        "title": "Full Stack Engineer",
        "company": "TechCorp Solutions",
        "location": "San Francisco, CA (Remote)",
        "job_type": "Full-time",
        "description": "Develop scalable full-stack applications using Python, FastAPI, React, TypeScript, and MongoDB. Design REST APIs and responsive UI components.",
        "required_skills": ["Python", "FastAPI", "React", "TypeScript", "MongoDB", "REST API"],
        "preferred_degree": "B.S. Computer Science",
        "min_experience_years": 0,
        "salary_range": "$110,000 - $140,000 / yr",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "title": "AI & Machine Learning Developer",
        "company": "NextGen Intelligence",
        "location": "New York, NY (Hybrid)",
        "job_type": "Full-time",
        "description": "Build agentic AI workflows, vector embeddings retrieval with ChromaDB, and fine-tune machine learning models using PyTorch and Scikit-Learn.",
        "required_skills": ["Python", "PyTorch", "Scikit-Learn", "ChromaDB", "FastAPI", "Machine Learning"],
        "preferred_degree": "B.S. Computer Science",
        "min_experience_years": 1,
        "salary_range": "$125,000 - $160,000 / yr",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "title": "Backend API Developer",
        "company": "CloudScale Systems",
        "location": "Austin, TX (Remote)",
        "job_type": "Full-time",
        "description": "Build high-throughput microservice backend APIs with Python, FastAPI, PostgreSQL, Docker, and AWS cloud infrastructure.",
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "REST API"],
        "preferred_degree": "B.S. Software Engineering",
        "min_experience_years": 0,
        "salary_range": "$105,000 - $135,000 / yr",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "title": "Frontend React Engineer",
        "company": "PixelCraft UI",
        "location": "Seattle, WA (Remote)",
        "job_type": "Full-time",
        "description": "Craft responsive web components using React, TypeScript, TailwindCSS, and modern web design systems.",
        "required_skills": ["React", "TypeScript", "TailwindCSS", "JavaScript", "HTML", "CSS"],
        "preferred_degree": "B.S. Computer Science",
        "min_experience_years": 0,
        "salary_range": "$95,000 - $125,000 / yr",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "title": "DevOps & Cloud Engineer",
        "company": "InfraOps Cloud",
        "location": "Chicago, IL (Hybrid)",
        "job_type": "Full-time",
        "description": "Deploy containerized applications using Docker, Kubernetes, GitHub Actions CI/CD pipelines, and AWS cloud services.",
        "required_skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git"],
        "preferred_degree": "B.S. Computer Science",
        "min_experience_years": 1,
        "salary_range": "$115,000 - $145,000 / yr",
        "created_at": datetime.now(timezone.utc)
    }
]

def _format_job_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}
    formatted = dict(doc)
    if "_id" in formatted:
        formatted["id"] = str(formatted.pop("_id"))
    return formatted

async def seed_jobs_if_empty() -> int:
    """Seeds initial jobs collection in MongoDB Atlas if empty."""
    db = get_database()
    if db is None:
        return 0
    count = await db.jobs.count_documents({})
    if count == 0:
        result = await db.jobs.insert_many(INITIAL_SEED_JOBS)
        logger.info(f"Seeded {len(result.inserted_ids)} jobs into MongoDB Atlas.")
        return len(result.inserted_ids)
    return 0

async def get_all_jobs() -> List[Dict[str, Any]]:
    """Retrieves all jobs from MongoDB Atlas."""
    db = get_database()
    if db is None:
        return [_format_job_doc(j) for j in INITIAL_SEED_JOBS]

    await seed_jobs_if_empty()
    cursor = db.jobs.find().sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [_format_job_doc(d) for d in docs]

async def get_job_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single job by ID."""
    db = get_database()
    if db is None:
        return None

    obj_id = ObjectId(job_id) if ObjectId.is_valid(job_id) else job_id
    doc = await db.jobs.find_one({"$or": [{"_id": obj_id}, {"id": job_id}]})
    if not doc:
        return None
    return _format_job_doc(doc)

async def create_new_job(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Creates a new job posting in MongoDB Atlas."""
    db = get_database()
    doc = {
        **job_data,
        "created_at": datetime.now(timezone.utc)
    }
    if db is not None:
        result = await db.jobs.insert_one(doc)
        doc["_id"] = result.inserted_id
        logger.info(f"Created new job in MongoDB Atlas: {doc['title']} (ID: {result.inserted_id})")
    else:
        doc["_id"] = f"mem_job_{int(datetime.now().timestamp())}"
    return _format_job_doc(doc)

async def evaluate_user_recommendations(user: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Evaluates authenticated user against all jobs using Scikit-Learn Random Forest model."""
    user_skills = user.get("skills", ["Python", "FastAPI", "React", "MongoDB"])
    user_degree = user.get("degree", "B.S. Computer Science")

    # Fetch latest user ATS score from MongoDB
    db = get_database()
    ats_score = 75
    if db is not None:
        user_id = str(user.get("id", user.get("_id")))
        latest_resume = await db.resumes.find_one({"user_id": user_id}, sort=[("created_at", -1)])
        if latest_resume and "parsed_data" in latest_resume:
            ats_score = latest_resume["parsed_data"].get("ats_analysis", {}).get("overall_score", 75)

    all_jobs = await get_all_jobs()
    evaluated_jobs = []

    for job in all_jobs:
        try:
            job_id = str(job.get("id", job.get("_id", "")))
            eval_result = evaluate_job_eligibility(
                candidate_skills=user_skills,
                candidate_degree=user_degree,
                ats_score=ats_score,
                job_id=job_id,
                job_title=job.get("title", "Position Role"),
                company=job.get("company", "Company"),
                required_skills=job.get("required_skills", []),
                preferred_degree=job.get("preferred_degree")
            )
            
            job_with_match = {
                **job,
                "match_result": eval_result
            }
            evaluated_jobs.append(job_with_match)
        except Exception as err:
            logger.warning(f"Error evaluating job {job.get('title')}: {err}")
            evaluated_jobs.append({
                **job,
                "match_result": {
                    "eligibility_score": 70,
                    "matched_skills": [],
                    "missing_skills": [],
                    "recommendation": "Moderate Fit"
                }
            })

    # Sort jobs by Scikit-Learn Random Forest eligibility score descending
    evaluated_jobs.sort(key=lambda x: x["match_result"]["eligibility_score"], reverse=True)
    return evaluated_jobs
