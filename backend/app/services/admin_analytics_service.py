import math
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Set
from bson import ObjectId
from app.database.mongodb import get_database_async, get_database
from app.services.insights_service import generate_career_insights

logger = logging.getLogger("campusmate.services.admin_analytics_service")

def parse_time_range_filter(time_range: Optional[str]) -> Optional[datetime]:
    """Computes cutoff datetime based on time range string."""
    if not time_range:
        return None
    tr = time_range.strip().lower()
    now = datetime.now(timezone.utc)
    if tr == "7d":
        return now - timedelta(days=7)
    elif tr == "30d":
        return now - timedelta(days=30)
    elif tr == "90d":
        return now - timedelta(days=90)
    elif tr == "12m":
        return now - timedelta(days=365)
    return None  # "all"

async def get_analytics_overview(time_range: Optional[str] = "all") -> Dict[str, Any]:
    """Computes real platform-wide metrics from MongoDB Atlas."""
    db = await get_database_async()
    if db is None:
        return {
            "total_students": 0,
            "active_students": 0,
            "students_with_resume_count": 0,
            "students_with_applications_count": 0,
            "total_jobs": 0,
            "active_jobs": 0,
            "total_applications": 0,
            "active_applications": 0,
            "completed_interviews": 0,
            "average_ats_score": 0.0,
            "average_interview_score": 0.0,
            "average_career_readiness_score": 0.0
        }

    cutoff = parse_time_range_filter(time_range)
    date_query = {"created_at": {"$gte": cutoff}} if cutoff else {}

    # Query Users
    stud_query = {"$or": [{"role": "student"}, {"role": {"$exists": False}}]}
    if date_query:
        stud_query.update(date_query)
    
    users_cursor = db.users.find(stud_query)
    user_docs = await users_cursor.to_list(length=5000)

    total_students = len(user_docs)
    active_students = len([u for u in user_docs if u.get("status", "Active").lower() == "active"])

    user_ids = [str(u.get("_id", u.get("id"))) for u in user_docs]

    # Query Resumes
    res_query = date_query.copy()
    if user_ids and cutoff:
        res_query["user_id"] = {"$in": user_ids}
    resumes_cursor = db.resumes.find(res_query)
    resume_docs = await resumes_cursor.to_list(length=5000)

    resume_user_ids = set(r.get("user_id") for r in resume_docs if r.get("user_id"))
    students_with_resume_count = len(resume_user_ids)

    ats_scores = []
    for r in resume_docs:
        parsed = r.get("parsed_data", {})
        score = parsed.get("ats_analysis", {}).get("overall_score")
        if score is not None:
            ats_scores.append(float(score))

    avg_ats = round(sum(ats_scores) / len(ats_scores), 1) if ats_scores else 0.0

    # Query Jobs
    job_query = date_query.copy()
    jobs_cursor = db.jobs.find(job_query)
    job_docs = await jobs_cursor.to_list(length=5000)
    total_jobs = len(job_docs)
    active_jobs = len([j for j in job_docs if j.get("status", "Active").lower() == "active"])

    # Query Applications
    app_query = date_query.copy()
    apps_cursor = db.applications.find(app_query)
    app_docs = await apps_cursor.to_list(length=5000)
    total_applications = len(app_docs)
    active_applications = len([a for a in app_docs if a.get("status", "").lower() in ["submitted", "under review", "interview scheduled"]])

    app_user_ids = set(a.get("user_id") for a in app_docs if a.get("user_id"))
    students_with_applications_count = len(app_user_ids)

    # Query Interviews
    int_query = date_query.copy()
    ints_cursor = db.interviews.find(int_query)
    int_docs = await ints_cursor.to_list(length=5000)
    completed_interviews_docs = [i for i in int_docs if i.get("status") == "Completed"]
    completed_interviews = len(completed_interviews_docs)

    int_scores = []
    for i in completed_interviews_docs:
        score = i.get("summary", {}).get("average_score")
        if score is not None:
            int_scores.append(float(score))
    
    avg_interview = round(sum(int_scores) / len(int_scores), 1) if int_scores else 0.0

    # Compute Career Readiness Scores for Users
    readiness_scores = []
    for u in user_docs[:100]:  # Cap calculation for fast performance
        uid = str(u.get("_id", u.get("id")))
        try:
            insights = await generate_career_insights(uid, u)
            readiness_scores.append(insights.get("career_readiness_score", 0.0))
        except Exception:
            pass

    avg_readiness = round(sum(readiness_scores) / len(readiness_scores), 1) if readiness_scores else 0.0

    return {
        "total_students": total_students,
        "active_students": active_students,
        "students_with_resume_count": students_with_resume_count,
        "students_with_applications_count": students_with_applications_count,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "active_applications": active_applications,
        "completed_interviews": completed_interviews,
        "average_ats_score": avg_ats,
        "average_interview_score": avg_interview,
        "average_career_readiness_score": avg_readiness
    }

async def get_student_analytics(time_range: Optional[str] = "all") -> Dict[str, Any]:
    """Computes student registration trends, college/degree distributions, and verified skills."""
    db = await get_database_async()
    if db is None:
        return {
            "registrations_over_time": [],
            "status_distribution": [],
            "college_distribution": [],
            "degree_distribution": [],
            "graduation_year_distribution": [],
            "resume_status_distribution": [],
            "application_status_distribution": [],
            "top_skills": []
        }

    cutoff = parse_time_range_filter(time_range)
    query = {"$or": [{"role": "student"}, {"role": {"$exists": False}}]}
    if cutoff:
        query["created_at"] = {"$gte": cutoff}

    cursor = db.users.find(query)
    user_docs = await cursor.to_list(length=5000)

    # Registrations over time
    date_map: Dict[str, int] = {}
    colleges_map: Dict[str, int] = {}
    degrees_map: Dict[str, int] = {}
    grad_years_map: Dict[str, int] = {}
    skills_map: Dict[str, int] = {}
    active_count = 0
    disabled_count = 0

    for u in user_docs:
        # Date grouping
        dt = u.get("created_at")
        if isinstance(dt, datetime):
            d_str = dt.strftime("%Y-%m-%d")
            date_map[d_str] = date_map.get(d_str, 0) + 1
        
        # Status
        st = u.get("status", "Active").capitalize()
        if st == "Active":
            active_count += 1
        else:
            disabled_count += 1

        # College
        c = u.get("college")
        if c and str(c).strip():
            colleges_map[str(c).strip()] = colleges_map.get(str(c).strip(), 0) + 1
        else:
            colleges_map["Unspecified"] = colleges_map.get("Unspecified", 0) + 1

        # Degree
        d = u.get("degree")
        if d and str(d).strip():
            degrees_map[str(d).strip()] = degrees_map.get(str(d).strip(), 0) + 1
        else:
            degrees_map["Unspecified"] = degrees_map.get("Unspecified", 0) + 1

        # Graduation Year
        gy = u.get("graduation_year")
        if gy:
            grad_years_map[str(gy)] = grad_years_map.get(str(gy), 0) + 1

        # Skills
        u_skills = u.get("skills", [])
        for sk in u_skills:
            sk_clean = str(sk).strip()
            if sk_clean:
                skills_map[sk_clean] = skills_map.get(sk_clean, 0) + 1

    total_u = len(user_docs)

    # Resume & Application overlap check
    user_ids = [str(u.get("_id", u.get("id"))) for u in user_docs]
    res_cursor = db.resumes.find({"user_id": {"$in": user_ids}})
    res_docs = await res_cursor.to_list(length=5000)
    users_with_resumes = set(r.get("user_id") for r in res_docs if r.get("user_id"))

    app_cursor = db.applications.find({"user_id": {"$in": user_ids}})
    app_docs = await app_cursor.to_list(length=5000)
    users_with_apps = set(a.get("user_id") for a in app_docs if a.get("user_id"))

    registrations_over_time = [
        {"date": k, "count": v}
        for k, v in sorted(date_map.items())
    ]

    college_distribution = [
        {"college": k, "count": v, "percentage": round((v / total_u * 100.0), 1) if total_u > 0 else 0.0}
        for k, v in sorted(colleges_map.items(), key=lambda x: x[1], reverse=True)[:8]
    ]

    degree_distribution = [
        {"degree": k, "count": v, "percentage": round((v / total_u * 100.0), 1) if total_u > 0 else 0.0}
        for k, v in sorted(degrees_map.items(), key=lambda x: x[1], reverse=True)[:8]
    ]

    top_skills = [
        {"skill": k, "count": v}
        for k, v in sorted(skills_map.items(), key=lambda x: x[1], reverse=True)[:10]
    ]

    return {
        "registrations_over_time": registrations_over_time,
        "status_distribution": [
            {"status": "Active", "count": active_count},
            {"status": "Disabled", "count": disabled_count}
        ],
        "college_distribution": college_distribution,
        "degree_distribution": degree_distribution,
        "graduation_year_distribution": [
            {"year": k, "count": v}
            for k, v in sorted(grad_years_map.items())
        ],
        "resume_status_distribution": [
            {"category": "With Resume", "count": len(users_with_resumes)},
            {"category": "Without Resume", "count": max(0, total_u - len(users_with_resumes))}
        ],
        "application_status_distribution": [
            {"category": "With Applications", "count": len(users_with_apps)},
            {"category": "No Applications", "count": max(0, total_u - len(users_with_apps))}
        ],
        "top_skills": top_skills
    }

async def get_job_analytics(time_range: Optional[str] = "all") -> Dict[str, Any]:
    """Computes job marketplace analytics, company distributions, and requested skills."""
    db = await get_database_async()
    if db is None:
        return {
            "total_jobs": 0,
            "active_jobs": 0,
            "closed_jobs": 0,
            "jobs_by_company": [],
            "jobs_by_category": [],
            "most_applied_jobs": [],
            "jobs_zero_applications": [],
            "frequent_required_skills": []
        }

    cutoff = parse_time_range_filter(time_range)
    query = {"created_at": {"$gte": cutoff}} if cutoff else {}

    cursor = db.jobs.find(query)
    job_docs = await cursor.to_list(length=5000)

    total_jobs = len(job_docs)
    active_jobs = len([j for j in job_docs if j.get("status", "Active").lower() == "active"])
    closed_jobs = total_jobs - active_jobs

    company_map: Dict[str, int] = {}
    category_map: Dict[str, int] = {}
    skills_req_map: Dict[str, int] = {}

    for j in job_docs:
        comp = j.get("company", "Other Company")
        company_map[comp] = company_map.get(comp, 0) + 1

        cat = j.get("category") or j.get("department") or "Software Engineering"
        category_map[cat] = category_map.get(cat, 0) + 1

        req_sk = j.get("required_skills", [])
        for sk in req_sk:
            sk_clean = str(sk).strip()
            if sk_clean:
                skills_req_map[sk_clean] = skills_req_map.get(sk_clean, 0) + 1

    # Map job applications count
    app_cursor = db.applications.find({})
    app_docs = await app_cursor.to_list(length=5000)

    job_app_map: Dict[str, int] = {}
    job_score_map: Dict[str, List[float]] = {}
    for a in app_docs:
        jid = str(a.get("job_id", ""))
        job_app_map[jid] = job_app_map.get(jid, 0) + 1
        score = a.get("combined_match_score")
        if score is not None:
            if jid not in job_score_map:
                job_score_map[jid] = []
            job_score_map[jid].append(float(score))

    most_applied = []
    zero_applied = []

    for j in job_docs:
        jid = str(j.get("_id", j.get("id")))
        title = j.get("title", "Role")
        comp = j.get("company", "Company")
        app_count = job_app_map.get(jid, 0)
        scores = job_score_map.get(jid, [])
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        item = {
            "job_id": jid,
            "title": title,
            "company": comp,
            "applications_count": app_count,
            "average_match_score": avg_score
        }

        if app_count > 0:
            most_applied.append(item)
        else:
            zero_applied.append(item)

    most_applied.sort(key=lambda x: x["applications_count"], reverse=True)

    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "closed_jobs": closed_jobs,
        "jobs_by_company": [
            {"company": k, "count": v}
            for k, v in sorted(company_map.items(), key=lambda x: x[1], reverse=True)[:8]
        ],
        "jobs_by_category": [
            {"category": k, "count": v}
            for k, v in sorted(category_map.items(), key=lambda x: x[1], reverse=True)[:8]
        ],
        "most_applied_jobs": most_applied[:5],
        "jobs_zero_applications": zero_applied[:5],
        "frequent_required_skills": [
            {"skill": k, "count": v}
            for k, v in sorted(skills_req_map.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
    }

async def get_application_analytics(time_range: Optional[str] = "all") -> Dict[str, Any]:
    """Computes application funnel metrics, status distributions, and conversion ratios."""
    db = await get_database_async()
    if db is None:
        return {
            "total_applications": 0,
            "funnel": {"applied": 0, "interviewing": 0, "offered": 0},
            "status_distribution": [],
            "applications_over_time": [],
            "average_match_score": 0.0,
            "high_fit_count": 0,
            "top_companies": []
        }

    cutoff = parse_time_range_filter(time_range)
    query = {"created_at": {"$gte": cutoff}} if cutoff else {}

    cursor = db.applications.find(query)
    app_docs = await cursor.to_list(length=5000)

    total_apps = len(app_docs)
    status_map: Dict[str, int] = {}
    date_map: Dict[str, int] = {}
    company_app_map: Dict[str, int] = {}
    match_scores: List[float] = []
    high_fit_count = 0

    applied_count = 0
    interviewing_count = 0
    offered_count = 0

    for a in app_docs:
        st = a.get("status", "Submitted")
        status_map[st] = status_map.get(st, 0) + 1

        if st in ["Submitted", "Under Review"]:
            applied_count += 1
        elif st == "Interview Scheduled":
            interviewing_count += 1
        elif st == "Offered":
            offered_count += 1

        # Date
        dt = a.get("created_at")
        if isinstance(dt, datetime):
            d_str = dt.strftime("%Y-%m-%d")
            date_map[d_str] = date_map.get(d_str, 0) + 1

        # Company
        comp = a.get("job_snapshot", {}).get("company", "Company")
        company_app_map[comp] = company_app_map.get(comp, 0) + 1

        # Score
        score = a.get("combined_match_score")
        if score is not None:
            sc_val = float(score)
            match_scores.append(sc_val)
            if sc_val >= 75.0:
                high_fit_count += 1

    avg_score = round(sum(match_scores) / len(match_scores), 1) if match_scores else 0.0

    return {
        "total_applications": total_apps,
        "funnel": {
            "applied": applied_count,
            "interviewing": interviewing_count,
            "offered": offered_count
        },
        "status_distribution": [
            {"status": k, "count": v}
            for k, v in status_map.items()
        ],
        "applications_over_time": [
            {"date": k, "count": v}
            for k, v in sorted(date_map.items())
        ],
        "average_match_score": avg_score,
        "high_fit_count": high_fit_count,
        "top_companies": [
            {"company": k, "count": v}
            for k, v in sorted(company_app_map.items(), key=lambda x: x[1], reverse=True)[:8]
        ]
    }

async def get_resume_analytics(time_range: Optional[str] = "all") -> Dict[str, Any]:
    """Computes resume ATS score distributions, extracted skills, and missing keywords."""
    db = await get_database_async()
    if db is None:
        return {
            "total_resumes": 0,
            "average_ats_score": 0.0,
            "score_distribution": [],
            "top_extracted_skills": [],
            "common_missing_keywords": [],
            "average_section_completeness": 0.0,
            "resumes_over_time": []
        }

    cutoff = parse_time_range_filter(time_range)
    query = {"created_at": {"$gte": cutoff}} if cutoff else {}

    cursor = db.resumes.find(query)
    res_docs = await cursor.to_list(length=5000)

    total_res = len(res_docs)
    cat_counts = {"80-100": 0, "65-79": 0, "50-64": 0, "0-49": 0}
    scores: List[float] = []
    extracted_skills_map: Dict[str, int] = {}
    missing_keywords_map: Dict[str, int] = {}
    date_map: Dict[str, int] = {}
    sec_completeness_scores: List[float] = []

    for r in res_docs:
        dt = r.get("created_at")
        if isinstance(dt, datetime):
            d_str = dt.strftime("%Y-%m-%d")
            date_map[d_str] = date_map.get(d_str, 0) + 1

        parsed = r.get("parsed_data", {})
        ats_info = parsed.get("ats_analysis", {})
        score = float(ats_info.get("overall_score", 0.0))
        scores.append(score)

        if score >= 80:
            cat_counts["80-100"] += 1
        elif score >= 65:
            cat_counts["65-79"] += 1
        elif score >= 50:
            cat_counts["50-64"] += 1
        else:
            cat_counts["0-49"] += 1

        # Skills
        for sk in parsed.get("extracted_skills", []):
            sk_clean = str(sk).strip()
            if sk_clean:
                extracted_skills_map[sk_clean] = extracted_skills_map.get(sk_clean, 0) + 1

        # Missing Keywords
        for kw in ats_info.get("missing_recommended_keywords", []):
            kw_clean = str(kw).strip()
            if kw_clean:
                missing_keywords_map[kw_clean] = missing_keywords_map.get(kw_clean, 0) + 1

        # Section completeness
        secs = parsed.get("detected_sections", [])
        sec_comp = min(100.0, (len(secs) / 5.0) * 100.0)
        sec_completeness_scores.append(sec_comp)

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    avg_sec = round(sum(sec_completeness_scores) / len(sec_completeness_scores), 1) if sec_completeness_scores else 0.0

    return {
        "total_resumes": total_res,
        "average_ats_score": avg_score,
        "score_distribution": [
            {"category": "80-100", "label": "Excellent (80-100)", "count": cat_counts["80-100"]},
            {"category": "65-79", "label": "Strong (65-79)", "count": cat_counts["65-79"]},
            {"category": "50-64", "label": "Needs Improvement (50-64)", "count": cat_counts["50-64"]},
            {"category": "0-49", "label": "Critical (0-49)", "count": cat_counts["0-49"]}
        ],
        "top_extracted_skills": [
            {"skill": k, "count": v}
            for k, v in sorted(extracted_skills_map.items(), key=lambda x: x[1], reverse=True)[:10]
        ],
        "common_missing_keywords": [
            {"keyword": k, "count": v}
            for k, v in sorted(missing_keywords_map.items(), key=lambda x: x[1], reverse=True)[:8]
        ],
        "average_section_completeness": avg_sec,
        "resumes_over_time": [
            {"date": k, "count": v}
            for k, v in sorted(date_map.items())
        ]
    }

async def get_interview_analytics(time_range: Optional[str] = "all") -> Dict[str, Any]:
    """Computes interview session scores, domain performance averages, and concept mastery gaps."""
    db = await get_database_async()
    if db is None:
        return {
            "total_interviews": 0,
            "completed_interviews": 0,
            "average_interview_score": 0.0,
            "highest_score": 0.0,
            "lowest_score": 0.0,
            "rating_distribution": [],
            "domain_performance": [],
            "common_strengths": [],
            "common_missing_concepts": [],
            "interviews_over_time": []
        }

    cutoff = parse_time_range_filter(time_range)
    query = {"created_at": {"$gte": cutoff}} if cutoff else {}

    cursor = db.interviews.find(query)
    int_docs = await cursor.to_list(length=5000)

    total_ints = len(int_docs)
    completed_docs = [i for i in int_docs if i.get("status") == "Completed"]
    completed_count = len(completed_docs)

    scores: List[float] = []
    domain_scores: Dict[str, List[float]] = {}
    rating_map = {"Mastered": 0, "Proficient": 0, "Developing": 0, "Needs Practice": 0}
    strengths_map: Dict[str, int] = {}
    missing_concepts_map: Dict[str, int] = {}
    date_map: Dict[str, int] = {}

    for i in completed_docs:
        dt = i.get("created_at")
        if isinstance(dt, datetime):
            d_str = dt.strftime("%Y-%m-%d")
            date_map[d_str] = date_map.get(d_str, 0) + 1

        summary = i.get("summary", {})
        sc = float(summary.get("average_score", 0.0))
        scores.append(sc)

        rt = summary.get("overall_rating") or ("Mastered" if sc >= 85 else ("Proficient" if sc >= 70 else "Developing"))
        rating_map[rt] = rating_map.get(rt, 0) + 1

        dom = i.get("domain", "Full Stack Engineering")
        if dom not in domain_scores:
            domain_scores[dom] = []
        domain_scores[dom].append(sc)

        evals = i.get("evaluations", [])
        for ev in evals:
            for s in ev.get("strengths", []):
                clean_s = str(s).replace("Successfully covered core concepts:", "").strip()
                if clean_s:
                    strengths_map[clean_s] = strengths_map.get(clean_s, 0) + 1
            for mc in ev.get("missing_concepts", []):
                clean_mc = str(mc).strip()
                if clean_mc:
                    missing_concepts_map[clean_mc] = missing_concepts_map.get(clean_mc, 0) + 1

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    high_score = max(scores) if scores else 0.0
    low_score = min(scores) if scores else 0.0

    return {
        "total_interviews": total_ints,
        "completed_interviews": completed_count,
        "average_interview_score": avg_score,
        "highest_score": high_score,
        "lowest_score": low_score,
        "rating_distribution": [
            {"rating": k, "count": v}
            for k, v in rating_map.items()
        ],
        "domain_performance": [
            {"domain": dom, "average_score": round(sum(scs) / len(scs), 1), "sessions_count": len(scs)}
            for dom, scs in domain_scores.items()
        ],
        "common_strengths": [
            {"strength": k, "count": v}
            for k, v in sorted(strengths_map.items(), key=lambda x: x[1], reverse=True)[:5]
        ],
        "common_missing_concepts": [
            {"concept": k, "count": v}
            for k, v in sorted(missing_concepts_map.items(), key=lambda x: x[1], reverse=True)[:5]
        ],
        "interviews_over_time": [
            {"date": k, "count": v}
            for k, v in sorted(date_map.items())
        ]
    }

async def get_career_readiness_analytics(time_range: Optional[str] = "all") -> Dict[str, Any]:
    """Computes Career Readiness score distributions, tier breakdowns, and top candidate skill gaps."""
    db = await get_database_async()
    if db is None:
        return {
            "average_readiness_score": 0.0,
            "readiness_tiers": [],
            "top_skill_gaps": []
        }

    cutoff = parse_time_range_filter(time_range)
    query = {"$or": [{"role": "student"}, {"role": {"$exists": False}}]}
    if cutoff:
        query["created_at"] = {"$gte": cutoff}

    cursor = db.users.find(query)
    user_docs = await cursor.to_list(length=100)

    readiness_scores: List[float] = []
    tier_counts = {"Job Ready (85+)": 0, "Placement Ready (70-84)": 0, "Developing (50-69)": 0, "Needs Improvement (<50)": 0}
    skill_gap_map: Dict[str, int] = {}

    for u in user_docs:
        uid = str(u.get("_id", u.get("id")))
        try:
            insights = await generate_career_insights(uid, u)
            sc = float(insights.get("career_readiness_score", 0.0))
            readiness_scores.append(sc)

            if sc >= 85:
                tier_counts["Job Ready (85+)"] += 1
            elif sc >= 70:
                tier_counts["Placement Ready (70-84)"] += 1
            elif sc >= 50:
                tier_counts["Developing (50-69)"] += 1
            else:
                tier_counts["Needs Improvement (<50)"] += 1

            for gap in insights.get("recommended_skill_gaps", []):
                sk = gap.get("skill")
                if sk:
                    skill_gap_map[sk] = skill_gap_map.get(sk, 0) + 1
        except Exception:
            pass

    avg_readiness = round(sum(readiness_scores) / len(readiness_scores), 1) if readiness_scores else 0.0

    return {
        "average_readiness_score": avg_readiness,
        "readiness_tiers": [
            {"tier": k, "count": v}
            for k, v in tier_counts.items()
        ],
        "top_skill_gaps": [
            {"skill": k, "affected_candidates": v}
            for k, v in sorted(skill_gap_map.items(), key=lambda x: x[1], reverse=True)[:8]
        ]
    }

async def get_platform_insights(time_range: Optional[str] = "all") -> List[Dict[str, str]]:
    """Generates simple, rule-based automated insights grounded in real MongoDB Atlas data."""
    overview = await get_analytics_overview(time_range)
    insights: List[Dict[str, str]] = []

    total_st = overview.get("total_students", 0)
    with_res = overview.get("students_with_resume_count", 0)
    with_apps = overview.get("students_with_applications_count", 0)
    avg_ats = overview.get("average_ats_score", 0.0)
    avg_int = overview.get("average_interview_score", 0.0)
    completed_ints = overview.get("completed_interviews", 0)

    if total_st > 0 and (with_res / total_st) < 0.5:
        insights.append({
            "type": "warning",
            "title": "Low Resume Upload Rate",
            "message": f"Only {round(with_res / total_st * 100.0, 1)}% of students ({with_res}/{total_st}) have uploaded a resume. Encourage students to upload PDFs to enable AI matching."
        })
    elif total_st > 0:
        insights.append({
            "type": "success",
            "title": "Healthy Resume Upload Rate",
            "message": f"{round(with_res / total_st * 100.0, 1)}% of registered candidates have uploaded active resumes."
        })

    if avg_ats > 0 and avg_ats < 75.0:
        insights.append({
            "type": "warning",
            "title": "ATS Compatibility Opportunity",
            "message": f"Average ATS score across candidates is {avg_ats}%. Adding target technical keywords can improve interview call rates."
        })

    if completed_ints > 0:
        insights.append({
            "type": "info",
            "title": "Interview Performance Benchmark",
            "message": f"Candidates completing mock interviews achieved an average technical evaluation score of {avg_int}%."
        })
    else:
        insights.append({
            "type": "info",
            "title": "Mock Interview Engagement",
            "message": "No mock interview sessions completed in this period. Recommend candidates run practice interviews before applying."
        })

    if total_st > 0 and (with_apps / total_st) > 0.3:
        insights.append({
            "type": "success",
            "title": "Active Placement Pipeline",
            "message": f"{with_apps} candidates have submitted applications for open campus opportunities."
        })

    return insights
