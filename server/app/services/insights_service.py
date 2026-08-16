import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from bson import ObjectId
from app.database.mongodb import get_database
from app.services.job_service import evaluate_user_recommendations

logger = logging.getLogger("campusmate.services.insights_service")

async def generate_career_insights(user_id: str, user: Dict[str, Any]) -> Dict[str, Any]:
    """Aggregates real platform statistics to compute candidate Career Readiness Score and Growth Insights."""
    db = get_database()
    
    name = user.get("name", "Student")
    college = user.get("college", "University")
    degree = user.get("degree", "Computer Science")
    user_skills = user.get("skills", ["Python", "FastAPI", "React"])

    # 1. Fetch Latest Resume ATS Score
    ats_score = None
    if db is not None:
        latest_resume = await db.resumes.find_one({"user_id": user_id}, sort=[("created_at", -1)])
        if latest_resume and "parsed_data" in latest_resume:
            ats_score = latest_resume["parsed_data"].get("ats_analysis", {}).get("overall_score", 75)

    # 2. Fetch ML Job Match Recommendations Count
    recs = []
    try:
        recs = await evaluate_user_recommendations(user)
    except Exception as err:
        logger.warning(f"Error fetching recommendations for insights: {err}")

    high_fit_count = len([j for j in recs if j.get("match_result", {}).get("eligibility_score", 0) >= 75])

    # 3. Fetch Active Applications Count
    applications_count = 0
    if db is not None:
        applications_count = await db.applications.count_documents({"user_id": user_id})

    # 4. Fetch Interview Performance Metrics
    interviews_count = 0
    avg_interview_score = 0.0
    if db is not None:
        cursor = db.interviews.find({"user_id": user_id, "status": "Completed"})
        interview_docs = await cursor.to_list(length=100)
        interviews_count = len(interview_docs)
        if interviews_count > 0:
            scores = [d.get("summary", {}).get("average_score", 0) for d in interview_docs if "summary" in d]
            avg_interview_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    # 5. Calculate Career Readiness Score (0-100%)
    # Weights: ATS Resume Score (35%), Skills Count (20%), Job Matches (20%), Interview Score (15%), Applications Activity (10%)
    ats_component = (ats_score / 100.0 * 35.0) if ats_score is not None else 15.0
    skills_component = min(20.0, (len(user_skills) / 8.0) * 20.0)
    job_component = min(20.0, (high_fit_count / 3.0) * 20.0)
    interview_component = (avg_interview_score / 100.0 * 15.0) if interviews_count > 0 else 5.0
    app_component = min(10.0, applications_count * 5.0)

    overall_readiness = round(ats_component + skills_component + job_component + interview_component + app_component, 1)

    # 6. Extract Skill Gaps from Job Recommendations
    missing_skill_map: Dict[str, int] = {}
    for j in recs:
        missing = j.get("match_result", {}).get("missing_skills", [])
        for ms in missing:
            missing_skill_map[ms] = missing_skill_map.get(ms, 0) + 1

    skill_gaps = [
        {"skill": k, "importance": "High" if v >= 2 else "Medium", "associated_job_count": v}
        for k, v in sorted(missing_skill_map.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    # Strengths
    strengths = []
    if len(user_skills) >= 5:
        strengths.append(f"Strong technical skill foundation ({len(user_skills)} verified skills)")
    if ats_score and ats_score >= 80:
        strengths.append(f"High ATS Resume Score ({ats_score}/100)")
    if high_fit_count > 0:
        strengths.append(f"{high_fit_count} High Fit placement matches found")

    if not strengths:
        strengths.append("Verified student account initialized")

    # Growth Advice
    advice = []
    if ats_score is None:
        advice.append("Upload your PDF resume in My Resume to boost your ATS compatibility score.")
    if skill_gaps:
        advice.append(f"Build a project incorporating `{skill_gaps[0]['skill']}` to qualify for {skill_gaps[0]['associated_job_count']} more placement roles.")
    if interviews_count == 0:
        advice.append("Complete an AI Mock Interview Session to improve your technical communication rating.")
    if applications_count == 0:
        advice.append("Apply to target jobs in Job Matches to build your placement pipeline.")

    return {
        "user_id": user_id,
        "user_name": name,
        "college": college,
        "degree": degree,
        "career_readiness_score": overall_readiness,
        "ats_score": ats_score,
        "skills_count": len(user_skills),
        "job_matches_count": len(recs),
        "high_fit_jobs_count": high_fit_count,
        "applications_count": applications_count,
        "interviews_count": interviews_count,
        "average_interview_score": avg_interview_score,
        "top_strengths": strengths,
        "recommended_skill_gaps": skill_gaps,
        "growth_advice": advice if advice else ["Keep maintaining your active portfolio!"],
        "updated_at": datetime.now(timezone.utc)
    }

async def update_user_profile(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Updates candidate profile in MongoDB Atlas."""
    db = get_database()
    clean_updates = {k: v for k, v in updates.items() if v is not None}

    if db is not None:
        obj_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
        await db.users.update_one(
            {"_id": obj_id},
            {"$set": {**clean_updates, "updated_at": datetime.now(timezone.utc)}}
        )
        updated_user = await db.users.find_one({"_id": obj_id})
        if updated_user:
            updated_user["id"] = str(updated_user.pop("_id"))
            return updated_user

    return clean_updates
