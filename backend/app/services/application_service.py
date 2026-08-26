import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from app.database.mongodb import get_database
from app.services.job_service import get_job_by_id
from app.services.ml_engine import evaluate_job_eligibility
from app.services.rag_service import query_similar_documents, COLLECTION_JOBS, index_document

logger = logging.getLogger("campusmate.services.application_service")

def _format_app_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return {}
    formatted = dict(doc)
    if "_id" in formatted:
        formatted["id"] = str(formatted.pop("_id"))
    return formatted

async def apply_for_job(
    user_id: str,
    user: Dict[str, Any],
    job_id: str,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """Submits a new job application with dual ML + RAG vector matching score."""
    db = get_database()

    # 1. Check for Duplicate Application
    if db is not None:
        existing = await db.applications.find_one({"user_id": user_id, "job_id": job_id})
        if existing:
            raise ValueError("You have already submitted an application for this job.")

    # 2. Fetch Target Job Details
    job = await get_job_by_id(job_id)
    if not job:
        raise ValueError(f"Job with ID '{job_id}' not found.")

    if job.get("status") == "Closed":
        raise ValueError("This placement position is closed and is no longer accepting new applications.")

    # 3. Retrieve Candidate Profile Data & Latest ATS Score
    user_skills = user.get("skills") or ["Python", "FastAPI", "React", "MongoDB"]
    user_degree = user.get("degree") or "B.S. Computer Science"

    ats_score = 75
    if db is not None:
        latest_resume = await db.resumes.find_one({"user_id": user_id}, sort=[("created_at", -1)])
        if latest_resume and "parsed_data" in latest_resume:
            ats_score = latest_resume["parsed_data"].get("ats_analysis", {}).get("overall_score", 75)

    # 4. Compute Random Forest ML Eligibility Score (60% weight)
    ml_eval = evaluate_job_eligibility(
        candidate_skills=user_skills,
        candidate_degree=user_degree,
        ats_score=ats_score,
        job_id=job_id,
        job_title=job["title"],
        company=job["company"],
        required_skills=job.get("required_skills", []),
        preferred_degree=job.get("preferred_degree")
    )
    ml_score = ml_eval["eligibility_score"]

    # 5. Compute ChromaDB Vector Similarity Score (40% weight)
    vector_score = 80.0
    try:
        query_str = f"{' '.join(user_skills)} {user_degree}"
        # Index job description in ChromaDB if needed
        index_document(
            collection_name=COLLECTION_JOBS,
            doc_id=f"job_{job_id}",
            text=f"Title: {job['title']}\nCompany: {job['company']}\n\nDescription:\n{job['description']}\nRequired Skills: {', '.join(job.get('required_skills', []))}",
            metadata={"job_id": job_id, "company": job["company"]}
        )
        vec_res = query_similar_documents(COLLECTION_JOBS, query_str, n_results=3)
        if vec_res.get("results"):
            top_vec = vec_res["results"][0]
            vector_score = top_vec.get("similarity_score", 80.0)
    except Exception as err:
        logger.warning(f"Vector search calculation fallback: {err}")

    # Combined Dual Match Score
    combined_score = round(0.6 * ml_score + 0.4 * vector_score, 1)

    # 6. Save Application Document to MongoDB Atlas
    app_doc = {
        "user_id": user_id,
        "job_id": job_id,
        "status": "Applied",
        "applied_at": datetime.now(timezone.utc),
        "ats_score_at_apply": ats_score,
        "ml_eligibility_score": ml_score,
        "vector_similarity_score": vector_score,
        "combined_match_score": combined_score,
        "notes": notes,
        "job_snapshot": {
            "title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "salary_range": job.get("salary_range"),
            "required_skills": job.get("required_skills", [])
        }
    }

    if db is not None:
        result = await db.applications.insert_one(app_doc)
        app_doc["_id"] = result.inserted_id
        logger.info(f"Saved application for user {user_id} -> job {job_id} in MongoDB Atlas (ID: {result.inserted_id})")
    else:
        app_doc["_id"] = f"mem_app_{int(datetime.now().timestamp())}"

    return _format_app_doc(app_doc)

async def get_user_applications(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves all job applications submitted by the user."""
    db = get_database()
    if db is None:
        return []

    cursor = db.applications.find({"user_id": user_id}).sort("applied_at", -1)
    docs = await cursor.to_list(length=100)
    return [_format_app_doc(d) for d in docs]

async def update_application_status(app_id: str, user_id: str, new_status: str) -> Optional[Dict[str, Any]]:
    """Updates status of a submitted application (e.g. Applied -> Interviewing)."""
    db = get_database()
    if db is None:
        return None

    obj_id = ObjectId(app_id) if ObjectId.is_valid(app_id) else app_id
    result = await db.applications.find_one_and_update(
        {"_id": obj_id, "user_id": user_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}},
        return_document=True
    )
    if not result:
        return None
    return _format_app_doc(result)

async def delete_user_application(app_id: str, user_id: str) -> bool:
    """Withdraws/deletes a submitted application."""
    db = get_database()
    if db is None:
        return False

    obj_id = ObjectId(app_id) if ObjectId.is_valid(app_id) else app_id
    result = await db.applications.delete_one({"_id": obj_id, "user_id": user_id})
    return result.deleted_count > 0
