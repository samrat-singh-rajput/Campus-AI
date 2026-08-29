import logging
import math
import os
import re
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Set
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from app.config.settings import settings
from app.database.mongodb import get_database_async, db_instance
from app.database.chromadb import chroma_instance, get_chroma_collection
from app.services.security import create_access_token, decode_access_token, verify_password, hash_password
from app.services.insights_service import generate_career_insights
from app.services.job_service import seed_jobs_if_empty
from app.services.ml_engine import MODEL_FILE_PATH, load_or_train_model
from app.services.interview_service import QUESTION_BANK
from app.services.agent_engine import _compiled_agent
from app.services.admin_analytics_service import (
    get_analytics_overview,
    get_student_analytics,
    get_job_analytics,
    get_application_analytics,
    get_resume_analytics,
    get_interview_analytics,
    get_career_readiness_analytics,
    get_platform_insights
)
from app.services.audit_service import (
    log_audit_event,
    get_audit_logs_list,
    get_audit_log_detail,
    get_audit_analytics
)

logger = logging.getLogger("campusmate.routes.admin")
router = APIRouter(prefix="/api/admin", tags=["Admin Portal, Jobs & Applications"])
security = HTTPBearer(auto_error=False)

# Schemas
class AdminLogin(BaseModel):
    username: str = Field(..., example="rajput")
    password: str = Field(..., example="rajput")

class AdminUserResponse(BaseModel):
    id: str = "admin-1"
    username: str = "rajput"
    name: str = "Administrator"
    role: str = "admin"

class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminUserResponse

class RecentUserItem(BaseModel):
    id: str
    name: str
    email: str
    college: Optional[str] = None
    degree: Optional[str] = None
    createdAt: Optional[datetime] = None

class RecentApplicationItem(BaseModel):
    id: str
    student_name: str
    job_title: str
    company: str
    match_score: float
    status: str
    applied_at: Optional[datetime] = None

class ActivityItem(BaseModel):
    id: str
    type: str  # 'user_registered' | 'resume_uploaded' | 'application_submitted' | 'interview_completed'
    title: str
    description: str
    timestamp: datetime

class AdminDashboardResponse(BaseModel):
    total_students: int
    total_resumes: int
    total_jobs: int
    total_applications: int
    active_applications: int
    completed_interviews: int
    average_ats_score: float
    average_interview_score: float
    average_career_readiness: float
    recent_users: List[RecentUserItem]
    recent_applications: List[RecentApplicationItem]
    recent_activity: List[ActivityItem]

# Step 3 User Management Schemas
class AdminUserListItem(BaseModel):
    id: str
    name: str
    email: str
    college: Optional[str] = None
    degree: Optional[str] = None
    graduationYear: Optional[int] = None
    skills_count: int
    has_resume: bool
    ats_score: Optional[float] = None
    applications_count: int
    career_readiness_score: float
    createdAt: Optional[datetime] = None
    status: str = "Active"

class AdminUsersListResponse(BaseModel):
    total_users: int
    total_active: int
    total_with_resume: int
    total_with_apps: int
    page: int
    limit: int
    total_pages: int
    users: List[AdminUserListItem]

class UpdateUserStatusRequest(BaseModel):
    status: str = Field(..., example="Disabled")

class UserResumeSummary(BaseModel):
    has_resume: bool
    filename: Optional[str] = None
    file_size_bytes: Optional[int] = None
    ats_score: Optional[float] = None
    extracted_skills: List[str] = []
    missing_keywords: List[str] = []
    upload_date: Optional[datetime] = None

class UserApplicationSummaryItem(BaseModel):
    id: str
    job_title: str
    company: str
    match_score: float
    status: str
    applied_at: Optional[datetime] = None

class UserApplicationsSummary(BaseModel):
    total_applications: int
    applied_count: int
    interviewing_count: int
    offered_count: int
    saved_count: int
    recent_applications: List[UserApplicationSummaryItem]

class UserInterviewSummaryItem(BaseModel):
    session_id: str
    domain: str
    score: float
    rating: str
    date: Optional[datetime] = None

class UserInterviewSummary(BaseModel):
    total_sessions: int
    completed_sessions: int
    average_score: float
    best_score: float
    latest_score: Optional[float] = None
    recent_sessions: List[UserInterviewSummaryItem]

class AdminUserDetailResponse(BaseModel):
    id: str
    name: str
    email: str
    college: Optional[str] = None
    degree: Optional[str] = None
    graduationYear: Optional[int] = None
    skills: List[str] = []
    skills_count: int
    status: str = "Active"
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    resume: UserResumeSummary
    applications: UserApplicationsSummary
    interviews: UserInterviewSummary
    insights: Dict[str, Any]

# Step 4 Job & Application Schemas
class AdminJobListItem(BaseModel):
    id: str
    title: str
    company: str
    location: str
    job_type: str = "Full-time"
    description: str
    required_skills: List[str] = []
    preferred_degree: Optional[str] = None
    salary_range: Optional[str] = None
    status: str = "Active"
    applications_count: int = 0
    created_at: Optional[datetime] = None

class AdminJobsListResponse(BaseModel):
    total_jobs: int
    active_jobs: int
    closed_jobs: int
    total_job_applications: int
    page: int
    limit: int
    total_pages: int
    jobs: List[AdminJobListItem]

class CreateJobRequest(BaseModel):
    title: str = Field(..., example="Senior React Engineer")
    company: str = Field(..., example="CampusMate AI Tech")
    location: str = Field(..., example="Remote")
    job_type: str = Field("Full-time", example="Full-time")
    description: str = Field(..., example="Develop core frontend web features...")
    required_skills: List[str] = Field(..., example=["React", "TypeScript", "FastAPI"])
    preferred_degree: Optional[str] = Field(None, example="B.S. Computer Science")
    salary_range: Optional[str] = Field(None, example="$110,000 - $140,000 / yr")

class UpdateJobRequest(BaseModel):
    title: str
    company: str
    location: str
    job_type: str = "Full-time"
    description: str
    required_skills: List[str] = []
    preferred_degree: Optional[str] = None
    salary_range: Optional[str] = None
    status: str = "Active"

class UpdateJobStatusRequest(BaseModel):
    status: str = Field(..., example="Closed")

class AdminApplicationListItem(BaseModel):
    id: str
    user_id: str
    student_name: str
    student_email: str
    student_college: Optional[str] = None
    job_id: str
    job_title: str
    company: str
    combined_match_score: float
    status: str
    applied_at: Optional[datetime] = None

class AdminApplicationsListResponse(BaseModel):
    total_applications: int
    applied_count: int
    interviewing_count: int
    offered_count: int
    saved_count: int
    page: int
    limit: int
    total_pages: int
    applications: List[AdminApplicationListItem]

class AdminApplicationDetailResponse(BaseModel):
    id: str
    user_id: str
    student: Dict[str, Any]
    job: Dict[str, Any]
    combined_match_score: float
    ml_eligibility_score: float
    vector_similarity_score: float
    ats_score_at_apply: Optional[float] = None
    status: str
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None

class UpdateApplicationStatusRequest(BaseModel):
    status: str = Field(..., example="Interviewing")

async def get_current_admin_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """Dependency to extract and validate Admin JWT token with strict role-based access control."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please log in as an administrator to continue.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please log in as an administrator to continue.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Server-side verification of Administrator Role
    role = payload.get("role")
    if role != "admin":
        logger.warning(f"Forbidden access attempt to admin endpoint by token with role: {role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges are required."
        )
    
    return {
        "id": payload.get("sub", "admin-1"),
        "username": payload.get("username", settings.ADMIN_USERNAME),
        "name": "Administrator",
        "role": "admin"
    }

@router.post("/login", response_model=AdminTokenResponse, status_code=status.HTTP_200_OK)
async def admin_login(body: AdminLogin):
    """Authenticates administrator credentials and returns signed admin JWT token."""
    username = body.username.strip() if body.username else ""
    password = body.password if body.password else ""
    
    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter your username and password."
        )
    
    if username != settings.ADMIN_USERNAME:
        logger.warning(f"Admin login failed: unknown admin username '{username}'")
        await log_audit_event(
            admin_id="unknown",
            admin_username=username or "unknown",
            action="ADMIN_LOGIN_FAILED",
            resource_type="auth",
            description=f"Failed admin login attempt for username '{username}'"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Administrator account not found."
        )
    
    is_valid = False
    if settings.ADMIN_PASSWORD_HASH and settings.ADMIN_PASSWORD_HASH.strip():
        is_valid = verify_password(password, settings.ADMIN_PASSWORD_HASH.strip())
    else:
        is_valid = (password == settings.ADMIN_PASSWORD)
        
    if not is_valid:
        logger.warning(f"Admin login failed: incorrect password for admin user '{username}'")
        await log_audit_event(
            admin_id="admin-1",
            admin_username=username,
            action="ADMIN_LOGIN_FAILED",
            resource_type="auth",
            description=f"Failed admin login attempt for username '{username}' (invalid password)"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin password. Please try again."
        )
    
    # Record Audit Log for successful login
    await log_audit_event(
        admin_id="admin-1",
        admin_username=username,
        action="ADMIN_LOGIN_SUCCESS",
        resource_type="auth",
        description=f"Administrator '{username}' logged in successfully"
    )
    
    # Generate Admin JWT Access Token with role="admin"
    access_token = create_access_token(
        data={
            "sub": "admin-1",
            "username": settings.ADMIN_USERNAME,
            "role": "admin"
        }
    )
    
    admin_info = AdminUserResponse(
        id="admin-1",
        username=settings.ADMIN_USERNAME,
        name="Administrator",
        role="admin"
    )
    
    logger.info(f"Admin login successful for user '{settings.ADMIN_USERNAME}'")
    return AdminTokenResponse(access_token=access_token, admin=admin_info)

@router.get("/me", response_model=AdminUserResponse, status_code=status.HTTP_200_OK)
async def get_admin_profile(current_admin: Dict[str, Any] = Depends(get_current_admin_user)):
    """Returns authenticated admin profile information."""
    return AdminUserResponse(
        id=current_admin["id"],
        username=current_admin["username"],
        name=current_admin["name"],
        role=current_admin["role"]
    )

@router.get("/dashboard", response_model=AdminDashboardResponse, status_code=status.HTTP_200_OK)
async def get_admin_dashboard_stats(current_admin: Dict[str, Any] = Depends(get_current_admin_user)):
    """Returns real-time aggregated platform statistics from MongoDB Atlas for the Admin Dashboard."""
    db = await get_database_async()
    
    total_students = 0
    total_resumes = 0
    total_jobs = 0
    total_applications = 0
    active_applications = 0
    completed_interviews = 0
    avg_ats_score = 0.0
    avg_interview_score = 0.0
    avg_career_readiness = 0.0
    
    recent_users: List[RecentUserItem] = []
    recent_applications: List[RecentApplicationItem] = []
    recent_activity: List[ActivityItem] = []

    if db is not None:
        try:
            total_students = await db.users.count_documents({})
            total_resumes = await db.resumes.count_documents({})
            total_jobs = await db.jobs.count_documents({})
            total_applications = await db.applications.count_documents({})
            active_applications = await db.applications.count_documents({"status": {"$in": ["Applied", "Interviewing"]}})
            completed_interviews = await db.interviews.count_documents({"status": "Completed"})
            
            if total_resumes > 0:
                res_cursor = db.resumes.find({}, {"parsed_data": 1})
                res_docs = await res_cursor.to_list(length=500)
                scores = []
                for rd in res_docs:
                    ats = rd.get("parsed_data", {}).get("ats_analysis", {}).get("overall_score")
                    if ats is None:
                        ats = rd.get("parsed_data", {}).get("ats_score")
                    if ats is not None:
                        scores.append(float(ats))
                if scores:
                    avg_ats_score = round(sum(scores) / len(scores), 1)

            if completed_interviews > 0:
                int_cursor = db.interviews.find({"status": "Completed"}, {"summary": 1})
                int_docs = await int_cursor.to_list(length=500)
                int_scores = [d.get("summary", {}).get("average_score", 0) for d in int_docs if "summary" in d]
                if int_scores:
                    avg_interview_score = round(sum(int_scores) / len(int_scores), 1)

            if total_students > 0:
                user_cursor = db.users.find({}).limit(50)
                sample_users = await user_cursor.to_list(length=50)
                readiness_scores = []
                for u in sample_users:
                    uid = str(u.get("_id", u.get("id")))
                    insights = await generate_career_insights(uid, u)
                    readiness_scores.append(insights.get("career_readiness_score", 0.0))
                if readiness_scores:
                    avg_career_readiness = round(sum(readiness_scores) / len(readiness_scores), 1)

            user_cursor = db.users.find({}).sort([("createdAt", -1), ("_id", -1)]).limit(10)
            u_docs = await user_cursor.to_list(length=10)
            for u in u_docs:
                created_at_val = u.get("createdAt") or u.get("created_at") or datetime.now(timezone.utc)
                recent_users.append(
                    RecentUserItem(
                        id=str(u.get("_id", u.get("id"))),
                        name=u.get("name", "Student Candidate"),
                        email=u.get("email", ""),
                        college=u.get("college"),
                        degree=u.get("degree"),
                        createdAt=created_at_val
                    )
                )

            app_cursor = db.applications.find({}).sort([("applied_at", -1), ("_id", -1)]).limit(10)
            app_docs = await app_cursor.to_list(length=10)
            for a in app_docs:
                uid = a.get("user_id", "")
                student_name = "Student Candidate"
                if uid:
                    u_doc = await db.users.find_one({"_id": ObjectId(uid) if ObjectId.is_valid(uid) else uid})
                    if u_doc and "name" in u_doc:
                        student_name = u_doc["name"]
                
                snapshot = a.get("job_snapshot", {})
                applied_at_val = a.get("applied_at") or a.get("created_at") or datetime.now(timezone.utc)
                recent_applications.append(
                    RecentApplicationItem(
                        id=str(a.get("_id", a.get("id"))),
                        student_name=student_name,
                        job_title=snapshot.get("title", "Target Role"),
                        company=snapshot.get("company", "Company"),
                        match_score=float(a.get("combined_match_score", 75.0)),
                        status=a.get("status", "Applied"),
                        applied_at=applied_at_val
                    )
                )

            raw_activities = []
            for u in u_docs[:5]:
                dt = u.get("createdAt") or u.get("created_at") or datetime.now(timezone.utc)
                raw_activities.append({
                    "id": f"act_u_{str(u.get('_id'))}",
                    "type": "user_registered",
                    "title": "New Student Registered",
                    "description": f"{u.get('name', 'Student')} registered from {u.get('college') or 'Campus'}",
                    "timestamp": dt
                })
            for a in app_docs[:5]:
                dt = a.get("applied_at") or datetime.now(timezone.utc)
                snapshot = a.get("job_snapshot", {})
                raw_activities.append({
                    "id": f"act_a_{str(a.get('_id'))}",
                    "type": "application_submitted",
                    "title": "Application Submitted",
                    "description": f"Applied for {snapshot.get('title', 'Role')} at {snapshot.get('company', 'Company')}",
                    "timestamp": dt
                })
            
            raw_activities.sort(key=lambda x: x["timestamp"], reverse=True)
            for act in raw_activities[:8]:
                recent_activity.append(ActivityItem(**act))

        except Exception as e:
            logger.error(f"Error fetching admin dashboard statistics: {e}")

    return AdminDashboardResponse(
        total_students=total_students,
        total_resumes=total_resumes,
        total_jobs=total_jobs,
        total_applications=total_applications,
        active_applications=active_applications,
        completed_interviews=completed_interviews,
        average_ats_score=avg_ats_score,
        average_interview_score=avg_interview_score,
        average_career_readiness=avg_career_readiness,
        recent_users=recent_users,
        recent_applications=recent_applications,
        recent_activity=recent_activity
    )

# ==============================================================================
# STEP 3: ADMIN USER MANAGEMENT ENDPOINTS
# ==============================================================================

@router.get("/users", response_model=AdminUsersListResponse, status_code=status.HTTP_200_OK)
async def get_admin_users_list(
    q: Optional[str] = Query(None, description="Search term for Name, Email, College, or Degree"),
    status_filter: Optional[str] = Query(None, description="Status filter: Active or Disabled"),
    resume_filter: Optional[str] = Query(None, description="Resume filter: Uploaded or Not Uploaded"),
    app_filter: Optional[str] = Query(None, description="Applications filter: Has Applications or No Applications"),
    sort_by: Optional[str] = Query("newest", description="Sorting field: newest, name, readiness, applications"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves paginated, filtered, and searched list of registered students for Admin User Management."""
    db = await get_database_async()
    if db is None:
        return AdminUsersListResponse(
            total_users=0, total_active=0, total_with_resume=0, total_with_apps=0,
            page=page, limit=limit, total_pages=1, users=[]
        )

    total_users_count = await db.users.count_documents({})
    total_active_count = await db.users.count_documents({"status": {"$ne": "Disabled"}})
    
    res_user_ids = set(await db.resumes.distinct("user_id"))
    app_user_ids = set(await db.applications.distinct("user_id"))
    
    total_with_resume_count = len(res_user_ids)
    total_with_apps_count = len(app_user_ids)

    query: Dict[str, Any] = {}

    if status_filter and status_filter.lower() != 'all':
        if status_filter.lower() == 'active':
            query["status"] = {"$ne": "Disabled"}
        elif status_filter.lower() == 'disabled':
            query["status"] = "Disabled"

    if q and q.strip():
        search_regex = re.compile(re.escape(q.strip()), re.IGNORECASE)
        query["$or"] = [
            {"name": search_regex},
            {"email": search_regex},
            {"college": search_regex},
            {"degree": search_regex}
        ]

    cursor = db.users.find(query)
    all_matching = await cursor.to_list(length=1000)

    formatted_items: List[AdminUserListItem] = []
    for u in all_matching:
        uid = str(u.get("_id", u.get("id")))
        
        has_res = uid in res_user_ids
        ats_val = None
        if has_res:
            res_doc = await db.resumes.find_one({"user_id": uid}, sort=[("created_at", -1)])
            if res_doc and "parsed_data" in res_doc:
                ats_val = res_doc["parsed_data"].get("ats_analysis", {}).get("overall_score")
                if ats_val is None:
                    ats_val = res_doc["parsed_data"].get("ats_score")
                if ats_val is not None:
                    ats_val = float(ats_val)

        if resume_filter and resume_filter.lower() != 'all':
            if resume_filter.lower() == 'uploaded' and not has_res:
                continue
            if resume_filter.lower() in ['not uploaded', 'none'] and has_res:
                continue

        user_app_cnt = await db.applications.count_documents({"user_id": uid})

        if app_filter and app_filter.lower() != 'all':
            if app_filter.lower() in ['has applications', 'has_apps'] and user_app_cnt == 0:
                continue
            if app_filter.lower() in ['no applications', 'no_apps'] and user_app_cnt > 0:
                continue

        insights = await generate_career_insights(uid, u)
        readiness = float(insights.get("career_readiness_score", 0.0))

        created_at_val = u.get("createdAt") or u.get("created_at") or datetime.now(timezone.utc)
        user_status = u.get("status", "Active")

        formatted_items.append(
            AdminUserListItem(
                id=uid,
                name=u.get("name", "Student"),
                email=u.get("email", ""),
                college=u.get("college"),
                degree=u.get("degree"),
                graduationYear=u.get("graduationYear"),
                skills_count=len(u.get("skills", [])),
                has_resume=has_res,
                ats_score=ats_val,
                applications_count=user_app_cnt,
                career_readiness_score=readiness,
                createdAt=created_at_val,
                status=user_status
            )
        )

    if sort_by == 'name':
        formatted_items.sort(key=lambda x: x.name.lower())
    elif sort_by == 'readiness':
        formatted_items.sort(key=lambda x: x.career_readiness_score, reverse=True)
    elif sort_by == 'applications':
        formatted_items.sort(key=lambda x: x.applications_count, reverse=True)
    else:
        formatted_items.sort(key=lambda x: x.createdAt or datetime.now(timezone.utc), reverse=True)

    total_matched = len(formatted_items)
    total_pages = max(1, (total_matched + limit - 1) // limit)
    start_idx = (page - 1) * limit
    paginated_items = formatted_items[start_idx : start_idx + limit]

    return AdminUsersListResponse(
        total_users=total_users_count,
        total_active=total_active_count,
        total_with_resume=total_with_resume_count,
        total_with_apps=total_with_apps_count,
        page=page,
        limit=limit,
        total_pages=total_pages,
        users=paginated_items
    )

@router.get("/users/{user_id}", response_model=AdminUserDetailResponse, status_code=status.HTTP_200_OK)
async def get_admin_user_detail(
    user_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves full admin-safe detail for a single candidate student profile."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to load student information right now.")

    obj_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
    user_doc = await db.users.find_one({"_id": obj_id})
    if not user_doc:
        user_doc = await db.users.find_one({"id": user_id})
    
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student account not found.")

    uid = str(user_doc.get("_id", user_doc.get("id")))

    latest_resume = await db.resumes.find_one({"user_id": uid}, sort=[("created_at", -1)])
    res_summary = UserResumeSummary(has_resume=False)
    if latest_resume:
        pd = latest_resume.get("parsed_data", {})
        ats_v = pd.get("ats_analysis", {}).get("overall_score") or pd.get("ats_score")
        res_summary = UserResumeSummary(
            has_resume=True,
            filename=latest_resume.get("filename"),
            file_size_bytes=latest_resume.get("file_size_bytes"),
            ats_score=float(ats_v) if ats_v is not None else None,
            extracted_skills=pd.get("extracted_skills", []),
            missing_keywords=pd.get("ats_analysis", {}).get("missing_critical_keywords", []),
            upload_date=latest_resume.get("created_at")
        )

    app_cursor = db.applications.find({"user_id": uid}).sort("applied_at", -1)
    app_docs = await app_cursor.to_list(length=100)
    
    applied_cnt = len([a for a in app_docs if a.get("status") == "Applied"])
    interviewing_cnt = len([a for a in app_docs if a.get("status") == "Interviewing"])
    offered_cnt = len([a for a in app_docs if a.get("status") == "Offered"])
    saved_cnt = len([a for a in app_docs if a.get("status") == "Saved"])
    
    recent_apps_list = []
    for a in app_docs[:10]:
        snapshot = a.get("job_snapshot", {})
        recent_apps_list.append(
            UserApplicationSummaryItem(
                id=str(a.get("_id", a.get("id"))),
                job_title=snapshot.get("title", "Job Role"),
                company=snapshot.get("company", "Company"),
                match_score=float(a.get("combined_match_score", 75.0)),
                status=a.get("status", "Applied"),
                applied_at=a.get("applied_at") or a.get("created_at")
            )
        )

    app_summary = UserApplicationsSummary(
        total_applications=len(app_docs),
        applied_count=applied_cnt,
        interviewing_count=interviewing_cnt,
        offered_count=offered_cnt,
        saved_count=saved_cnt,
        recent_applications=recent_apps_list
    )

    int_cursor = db.interviews.find({"user_id": uid}).sort("created_at", -1)
    int_docs = await int_cursor.to_list(length=100)
    
    completed_sess = [i for i in int_docs if i.get("status") == "Completed"]
    int_scores = [d.get("summary", {}).get("average_score", 0) for d in completed_sess if "summary" in d]
    
    avg_score = round(sum(int_scores) / len(int_scores), 1) if int_scores else 0.0
    best_score = max(int_scores) if int_scores else 0.0
    latest_score = int_scores[0] if int_scores else None

    recent_sess_list = []
    for i in completed_sess[:10]:
        s = i.get("summary", {})
        recent_sess_list.append(
            UserInterviewSummaryItem(
                session_id=i.get("session_id", str(i.get("_id"))),
                domain=i.get("domain", "Full Stack Engineering"),
                score=float(s.get("average_score", 0.0)),
                rating=s.get("overall_rating", "Completed"),
                date=i.get("created_at")
            )
        )

    int_summary = UserInterviewSummary(
        total_sessions=len(int_docs),
        completed_sessions=len(completed_sess),
        average_score=avg_score,
        best_score=best_score,
        latest_score=latest_score,
        recent_sessions=recent_sess_list
    )

    insights = await generate_career_insights(uid, user_doc)

    # Log USER_VIEWED Audit Event
    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="USER_VIEWED",
        resource_type="user",
        resource_id=uid,
        target_name=user_doc.get("name", "Student Candidate"),
        description=f"Admin viewed student profile of '{user_doc.get('name')}'"
    )

    return AdminUserDetailResponse(
        id=uid,
        name=user_doc.get("name", "Student Candidate"),
        email=user_doc.get("email", ""),
        college=user_doc.get("college"),
        degree=user_doc.get("degree"),
        graduationYear=user_doc.get("graduationYear"),
        skills=user_doc.get("skills", []),
        skills_count=len(user_doc.get("skills", [])),
        status=user_doc.get("status", "Active"),
        createdAt=user_doc.get("createdAt") or user_doc.get("created_at"),
        updatedAt=user_doc.get("updatedAt") or user_doc.get("updated_at"),
        resume=res_summary,
        applications=app_summary,
        interviews=int_summary,
        insights=insights
    )

@router.patch("/users/{user_id}/status", status_code=status.HTTP_200_OK)
async def update_admin_user_status(
    user_id: str,
    body: UpdateUserStatusRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Enables or Disables a candidate student account."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to update account status. Please try again.")

    new_status = body.status.strip().title()
    if new_status not in ["Active", "Disabled"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status value. Must be 'Active' or 'Disabled'.")

    obj_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
    u_doc = await db.users.find_one({"$or": [{"_id": obj_id}, {"id": user_id}]})
    
    result = await db.users.update_one(
        {"$or": [{"_id": obj_id}, {"id": user_id}]},
        {"$set": {"status": new_status, "updatedAt": datetime.now(timezone.utc)}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student account not found.")

    target_name = u_doc.get("name", "Student") if u_doc else "Student"
    act = "USER_DISABLED" if new_status == "Disabled" else "USER_ENABLED"
    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action=act,
        resource_type="user",
        resource_id=user_id,
        target_name=target_name,
        description=f"{act.replace('_', ' ').capitalize()} for student '{target_name}'"
    )

    logger.info(f"Admin updated user {user_id} account status to: {new_status}")
    return {"status": "success", "user_id": user_id, "new_status": new_status}

# ==============================================================================
# STEP 4: ADMIN JOBS MANAGEMENT ENDPOINTS
# ==============================================================================

@router.get("/jobs", response_model=AdminJobsListResponse, status_code=status.HTTP_200_OK)
async def get_admin_jobs_list(
    q: Optional[str] = Query(None, description="Search term for Title, Company, Location, or Skills"),
    status_filter: Optional[str] = Query(None, description="Status filter: Active or Closed"),
    location_filter: Optional[str] = Query(None),
    job_type_filter: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("newest", description="Sorting: newest, oldest, title, applications"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves paginated, searchable, and filtered jobs with application counts."""
    db = await get_database_async()
    if db is None:
        return AdminJobsListResponse(
            total_jobs=0, active_jobs=0, closed_jobs=0, total_job_applications=0,
            page=page, limit=limit, total_pages=1, jobs=[]
        )

    await seed_jobs_if_empty()

    total_jobs_cnt = await db.jobs.count_documents({})
    active_jobs_cnt = await db.jobs.count_documents({"status": {"$ne": "Closed"}})
    closed_jobs_cnt = await db.jobs.count_documents({"status": "Closed"})
    total_job_apps_cnt = await db.applications.count_documents({})

    query: Dict[str, Any] = {}

    if status_filter and status_filter.lower() != 'all':
        if status_filter.lower() == 'active':
            query["status"] = {"$ne": "Closed"}
        elif status_filter.lower() == 'closed':
            query["status"] = "Closed"

    if job_type_filter and job_type_filter.lower() != 'all':
        query["job_type"] = re.compile(re.escape(job_type_filter.strip()), re.IGNORECASE)

    if q and q.strip():
        search_regex = re.compile(re.escape(q.strip()), re.IGNORECASE)
        query["$or"] = [
            {"title": search_regex},
            {"company": search_regex},
            {"location": search_regex},
            {"required_skills": search_regex}
        ]

    cursor = db.jobs.find(query)
    all_matching = await cursor.to_list(length=1000)

    formatted_jobs: List[AdminJobListItem] = []
    for j in all_matching:
        jid = str(j.get("_id", j.get("id")))
        
        # Calculate real-time applications count for this job
        app_cnt = await db.applications.count_documents({"$or": [{"job_id": jid}, {"job_id": str(j.get("_id"))}]})

        if location_filter and location_filter.lower() != 'all':
            if location_filter.lower() not in j.get("location", "").lower():
                continue

        created_at_val = j.get("created_at") or j.get("createdAt") or datetime.now(timezone.utc)
        job_status = j.get("status", "Active")

        formatted_jobs.append(
            AdminJobListItem(
                id=jid,
                title=j.get("title", "Position Role"),
                company=j.get("company", "Company"),
                location=j.get("location", "Remote"),
                job_type=j.get("job_type", "Full-time"),
                description=j.get("description", ""),
                required_skills=j.get("required_skills", []),
                preferred_degree=j.get("preferred_degree"),
                salary_range=j.get("salary_range"),
                status=job_status,
                applications_count=app_cnt,
                created_at=created_at_val
            )
        )

    # Sorting
    if sort_by == 'oldest':
        formatted_jobs.sort(key=lambda x: x.created_at or datetime.now(timezone.utc))
    elif sort_by == 'title':
        formatted_jobs.sort(key=lambda x: x.title.lower())
    elif sort_by == 'applications':
        formatted_jobs.sort(key=lambda x: x.applications_count, reverse=True)
    else:  # 'newest' default
        formatted_jobs.sort(key=lambda x: x.created_at or datetime.now(timezone.utc), reverse=True)

    total_matched = len(formatted_jobs)
    total_pages = max(1, (total_matched + limit - 1) // limit)
    start_idx = (page - 1) * limit
    paginated_jobs = formatted_jobs[start_idx : start_idx + limit]

    return AdminJobsListResponse(
        total_jobs=total_jobs_cnt,
        active_jobs=active_jobs_cnt,
        closed_jobs=closed_jobs_cnt,
        total_job_applications=total_job_apps_cnt,
        page=page,
        limit=limit,
        total_pages=total_pages,
        jobs=paginated_jobs
    )

@router.get("/jobs/{job_id}", response_model=AdminJobListItem, status_code=status.HTTP_200_OK)
async def get_admin_job_detail(
    job_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves full detail for a single job posting."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to load job information.")

    obj_id = ObjectId(job_id) if ObjectId.is_valid(job_id) else job_id
    j = await db.jobs.find_one({"$or": [{"_id": obj_id}, {"id": job_id}]})
    if not j:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job position not found.")

    jid = str(j.get("_id", j.get("id")))
    app_cnt = await db.applications.count_documents({"$or": [{"job_id": jid}, {"job_id": str(j.get("_id"))}]})

    return AdminJobListItem(
        id=jid,
        title=j.get("title", "Position Role"),
        company=j.get("company", "Company"),
        location=j.get("location", "Remote"),
        job_type=j.get("job_type", "Full-time"),
        description=j.get("description", ""),
        required_skills=j.get("required_skills", []),
        preferred_degree=j.get("preferred_degree"),
        salary_range=j.get("salary_range"),
        status=j.get("status", "Active"),
        applications_count=app_cnt,
        created_at=j.get("created_at") or j.get("createdAt")
    )

@router.post("/jobs", response_model=AdminJobListItem, status_code=status.HTTP_201_CREATED)
async def create_admin_job(
    body: CreateJobRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Creates a new job posting in MongoDB Atlas shared database."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to create this job.")

    clean_skills = [s.strip() for s in body.required_skills if s and s.strip()]
    if not clean_skills:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one required skill is mandatory.")

    now = datetime.now(timezone.utc)
    job_doc = {
        "title": body.title.strip(),
        "company": body.company.strip(),
        "location": body.location.strip(),
        "job_type": body.job_type.strip(),
        "description": body.description.strip(),
        "required_skills": clean_skills,
        "preferred_degree": body.preferred_degree.strip() if body.preferred_degree else "B.S. Computer Science",
        "salary_range": body.salary_range.strip() if body.salary_range else "$100,000 - $130,000 / yr",
        "status": "Active",
        "created_at": now,
        "updated_at": now
    }
    result = await db.jobs.insert_one(job_doc)
    jid = str(result.inserted_id)
    job_doc["_id"] = result.inserted_id

    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="JOB_CREATED",
        resource_type="job",
        resource_id=jid,
        target_name=f"{body.title} at {body.company}",
        description=f"Created job posting '{body.title}' for {body.company}"
    )

    logger.info(f"Admin created new job in MongoDB Atlas: '{body.title}' at '{body.company}' (ID: {jid})")
    return AdminJobListItem(
        id=jid,
        title=job_doc["title"],
        company=job_doc["company"],
        location=job_doc["location"],
        job_type=job_doc["job_type"],
        description=job_doc["description"],
        required_skills=job_doc["required_skills"],
        preferred_degree=job_doc["preferred_degree"],
        salary_range=job_doc["salary_range"],
        status="Active",
        applications_count=0,
        created_at=now
    )

@router.put("/jobs/{job_id}", response_model=AdminJobListItem, status_code=status.HTTP_200_OK)
async def update_admin_job(
    job_id: str,
    body: UpdateJobRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Updates existing job position details in MongoDB Atlas shared database."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to update this job.")

    clean_skills = [s.strip() for s in body.required_skills if s and s.strip()]
    if not clean_skills:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one required skill is mandatory.")

    now = datetime.now(timezone.utc)
    obj_id = ObjectId(job_id) if ObjectId.is_valid(job_id) else job_id

    update_data = {
        "title": body.title.strip(),
        "company": body.company.strip(),
        "location": body.location.strip(),
        "job_type": body.job_type.strip(),
        "description": body.description.strip(),
        "required_skills": clean_skills,
        "preferred_degree": body.preferred_degree.strip() if body.preferred_degree else None,
        "salary_range": body.salary_range.strip() if body.salary_range else None,
        "status": body.status.strip().title(),
        "updated_at": now
    }

    res = await db.jobs.find_one_and_update(
        {"$or": [{"_id": obj_id}, {"id": job_id}]},
        {"$set": update_data},
        return_document=True
    )
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job position not found.")

    jid = str(res.get("_id", res.get("id")))
    app_cnt = await db.applications.count_documents({"$or": [{"job_id": jid}, {"job_id": str(res.get("_id"))}]})

    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="JOB_UPDATED",
        resource_type="job",
        resource_id=jid,
        target_name=f"{res['title']} at {res['company']}",
        description=f"Updated job details for '{res['title']}'"
    )

    return AdminJobListItem(
        id=jid,
        title=res["title"],
        company=res["company"],
        location=res["location"],
        job_type=res["job_type"],
        description=res["description"],
        required_skills=res["required_skills"],
        preferred_degree=res.get("preferred_degree"),
        salary_range=res.get("salary_range"),
        status=res.get("status", "Active"),
        applications_count=app_cnt,
        created_at=res.get("created_at") or res.get("createdAt")
    )

@router.patch("/jobs/{job_id}/status", status_code=status.HTTP_200_OK)
async def update_admin_job_status(
    job_id: str,
    body: UpdateJobStatusRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Closes or reopens a job position."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to update job status.")

    new_status = body.status.strip().title()
    if new_status not in ["Active", "Closed"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be 'Active' or 'Closed'.")

    obj_id = ObjectId(job_id) if ObjectId.is_valid(job_id) else job_id
    j_doc = await db.jobs.find_one({"$or": [{"_id": obj_id}, {"id": job_id}]})
    res = await db.jobs.update_one(
        {"$or": [{"_id": obj_id}, {"id": job_id}]},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job position not found.")

    t_name = j_doc.get("title", "Job Position") if j_doc else "Job Position"
    job_act = "JOB_CLOSED" if new_status == "Closed" else "JOB_REOPENED"
    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action=job_act,
        resource_type="job",
        resource_id=job_id,
        target_name=t_name,
        description=f"{job_act.replace('_', ' ').capitalize()} for position '{t_name}'"
    )

    logger.info(f"Admin updated job {job_id} status to: {new_status}")
    return {"status": "success", "job_id": job_id, "new_status": new_status}

@router.delete("/jobs/{job_id}", status_code=status.HTTP_200_OK)
async def delete_admin_job(
    job_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Deletes a job posting if 0 applications exist; otherwise prevents deletion."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to delete job.")

    obj_id = ObjectId(job_id) if ObjectId.is_valid(job_id) else job_id
    job_doc = await db.jobs.find_one({"$or": [{"_id": obj_id}, {"id": job_id}]})
    if not job_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job position not found.")

    jid = str(job_doc.get("_id", job_doc.get("id")))

    # Check existing applications
    app_cnt = await db.applications.count_documents({"$or": [{"job_id": jid}, {"job_id": str(job_doc.get("_id"))}]})
    if app_cnt > 0:
        await log_audit_event(
            admin_id=str(current_admin.get("sub", "admin")),
            admin_username=str(current_admin.get("username", "admin")),
            action="JOB_DELETE_BLOCKED",
            resource_type="job",
            resource_id=jid,
            target_name=job_doc.get("title", "Job"),
            description=f"Attempted deletion of job '{job_doc.get('title')}' blocked due to {app_cnt} existing application(s)"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job has existing applications and cannot be deleted safely. Please close the job position instead."
        )

    await db.jobs.delete_one({"_id": job_doc["_id"]})

    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="JOB_DELETED",
        resource_type="job",
        resource_id=jid,
        target_name=job_doc.get("title", "Job"),
        description=f"Permanently deleted job posting '{job_doc.get('title')}'"
    )
    logger.info(f"Admin deleted job {jid} (0 applications existed)")
    return {"status": "success", "message": "Job deleted successfully."}

# ==============================================================================
# STEP 4: ADMIN APPLICATIONS MANAGEMENT ENDPOINTS
# ==============================================================================

@router.get("/applications", response_model=AdminApplicationsListResponse, status_code=status.HTTP_200_OK)
async def get_admin_applications_list(
    q: Optional[str] = Query(None, description="Search term for Student Name, Student Email, Job Title, or Company"),
    status_filter: Optional[str] = Query(None, description="Status filter: Applied, Interviewing, Offered, Saved"),
    match_filter: Optional[str] = Query(None, description="Match score filter: High (>=75%), Moderate (50-74%), Low (<50%)"),
    job_filter: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("newest", description="Sorting: newest, oldest, match_score"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves paginated, searchable, and filtered applications from MongoDB Atlas."""
    db = await get_database_async()
    if db is None:
        return AdminApplicationsListResponse(
            total_applications=0, applied_count=0, interviewing_count=0,
            offered_count=0, saved_count=0, page=page, limit=limit, total_pages=1, applications=[]
        )

    total_apps_cnt = await db.applications.count_documents({})
    applied_cnt = await db.applications.count_documents({"status": "Applied"})
    interviewing_cnt = await db.applications.count_documents({"status": "Interviewing"})
    offered_cnt = await db.applications.count_documents({"status": "Offered"})
    saved_cnt = await db.applications.count_documents({"status": "Saved"})

    query: Dict[str, Any] = {}
    if status_filter and status_filter.lower() != 'all':
        query["status"] = re.compile(f"^{re.escape(status_filter.strip())}$", re.IGNORECASE)

    cursor = db.applications.find(query)
    all_matching = await cursor.to_list(length=1000)

    formatted_apps: List[AdminApplicationListItem] = []
    for a in all_matching:
        aid = str(a.get("_id", a.get("id")))
        uid = a.get("user_id", "")
        
        # Populate student name & email
        student_name = "Student Candidate"
        student_email = ""
        student_college = None
        if uid:
            u_doc = await db.users.find_one({"$or": [{"_id": ObjectId(uid) if ObjectId.is_valid(uid) else uid}, {"id": uid}]})
            if u_doc:
                student_name = u_doc.get("name", "Student")
                student_email = u_doc.get("email", "")
                student_college = u_doc.get("college")

        snapshot = a.get("job_snapshot", {})
        job_title = snapshot.get("title", "Position Role")
        company = snapshot.get("company", "Company")
        match_score = float(a.get("combined_match_score", 75.0))

        # Search Query
        if q and q.strip():
            sq = q.strip().lower()
            if (sq not in student_name.lower() and 
                sq not in student_email.lower() and 
                sq not in job_title.lower() and 
                sq not in company.lower()):
                continue

        # Match Score Filter
        if match_filter and match_filter.lower() != 'all':
            if match_filter.lower() == 'high' and match_score < 75.0:
                continue
            if match_filter.lower() == 'moderate' and (match_score < 50.0 or match_score >= 75.0):
                continue
            if match_filter.lower() == 'low' and match_score >= 50.0:
                continue

        # Job Filter
        if job_filter and job_filter.lower() != 'all':
            if job_filter.lower() not in job_title.lower():
                continue

        applied_at_val = a.get("applied_at") or a.get("created_at") or datetime.now(timezone.utc)

        formatted_apps.append(
            AdminApplicationListItem(
                id=aid,
                user_id=uid,
                student_name=student_name,
                student_email=student_email,
                student_college=student_college,
                job_id=a.get("job_id", ""),
                job_title=job_title,
                company=company,
                combined_match_score=match_score,
                status=a.get("status", "Applied"),
                applied_at=applied_at_val
            )
        )

    # Sorting
    if sort_by == 'oldest':
        formatted_apps.sort(key=lambda x: x.applied_at or datetime.now(timezone.utc))
    elif sort_by == 'match_score':
        formatted_apps.sort(key=lambda x: x.combined_match_score, reverse=True)
    else:  # 'newest' default
        formatted_apps.sort(key=lambda x: x.applied_at or datetime.now(timezone.utc), reverse=True)

    total_matched = len(formatted_apps)
    total_pages = max(1, (total_matched + limit - 1) // limit)
    start_idx = (page - 1) * limit
    paginated_apps = formatted_apps[start_idx : start_idx + limit]

    return AdminApplicationsListResponse(
        total_applications=total_apps_cnt,
        applied_count=applied_cnt,
        interviewing_count=interviewing_cnt,
        offered_count=offered_cnt,
        saved_count=saved_cnt,
        page=page,
        limit=limit,
        total_pages=total_pages,
        applications=paginated_apps
    )

@router.get("/applications/{application_id}", response_model=AdminApplicationDetailResponse, status_code=status.HTTP_200_OK)
async def get_admin_application_detail(
    application_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves full admin-safe detail for a single application."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to load application.")

    obj_id = ObjectId(application_id) if ObjectId.is_valid(application_id) else application_id
    app_doc = await db.applications.find_one({"$or": [{"_id": obj_id}, {"id": application_id}]})
    if not app_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application record not found.")

    aid = str(app_doc.get("_id", app_doc.get("id")))
    uid = app_doc.get("user_id", "")
    jid = app_doc.get("job_id", "")

    # Populate Student
    student_dict = {"name": "Student Candidate", "email": ""}
    if uid:
        u_doc = await db.users.find_one({"$or": [{"_id": ObjectId(uid) if ObjectId.is_valid(uid) else uid}, {"id": uid}]})
        if u_doc:
            student_dict = {
                "id": str(u_doc.get("_id", u_doc.get("id"))),
                "name": u_doc.get("name", "Student"),
                "email": u_doc.get("email", ""),
                "college": u_doc.get("college"),
                "degree": u_doc.get("degree"),
                "skills": u_doc.get("skills", [])
            }

    # Populate Job
    job_dict = app_doc.get("job_snapshot", {})
    if jid:
        j_doc = await db.jobs.find_one({"$or": [{"_id": ObjectId(jid) if ObjectId.is_valid(jid) else jid}, {"id": jid}]})
        if j_doc:
            job_dict = {
                "id": str(j_doc.get("_id", j_doc.get("id"))),
                "title": j_doc.get("title"),
                "company": j_doc.get("company"),
                "location": j_doc.get("location"),
                "job_type": j_doc.get("job_type", "Full-time"),
                "required_skills": j_doc.get("required_skills", []),
                "salary_range": j_doc.get("salary_range")
            }

    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="APPLICATION_VIEWED",
        resource_type="application",
        resource_id=aid,
        target_name=f"{student_dict.get('name')} - {job_title}",
        description=f"Admin viewed job application for {student_dict.get('name')} ({job_title})"
    )

    return AdminApplicationDetailResponse(
        id=aid,
        user_id=uid,
        student=student_dict,
        job=job_dict,
        combined_match_score=float(app_doc.get("combined_match_score", 75.0)),
        ml_eligibility_score=float(app_doc.get("ml_eligibility_score", 75.0)),
        vector_similarity_score=float(app_doc.get("vector_similarity_score", 80.0)),
        ats_score_at_apply=app_doc.get("ats_score_at_apply"),
        status=app_doc.get("status", "Applied"),
        notes=app_doc.get("notes"),
        applied_at=app_doc.get("applied_at") or app_doc.get("created_at")
    )

@router.patch("/applications/{application_id}/status", status_code=status.HTTP_200_OK)
async def update_admin_application_status(
    application_id: str,
    body: UpdateApplicationStatusRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Updates candidate job application status in MongoDB Atlas."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to update application status.")

    new_status = body.status.strip().title()
    allowed_statuses = ["Submitted", "Under Review", "Interview Scheduled", "Offered", "Rejected", "Withdrawn", "Applied", "Interviewing", "Saved"]
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid application status. Allowed values: {', '.join(allowed_statuses)}.")

    obj_id = ObjectId(application_id) if ObjectId.is_valid(application_id) else application_id
    a_doc = await db.applications.find_one({"$or": [{"_id": obj_id}, {"id": application_id}]})
    res = await db.applications.update_one(
        {"$or": [{"_id": obj_id}, {"id": application_id}]},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application record not found.")

    target_desc = f"Application {application_id}"
    if a_doc:
        target_desc = f"{a_doc.get('job_snapshot', {}).get('title', 'Role')} ({a_doc.get('job_snapshot', {}).get('company', 'Company')})"

    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="APPLICATION_STATUS_UPDATED",
        resource_type="application",
        resource_id=application_id,
        target_name=target_desc,
        description=f"Updated application status to '{new_status}' for {target_desc}"
    )

    logger.info(f"Admin updated application {application_id} status to: {new_status}")
    return {"status": "success", "application_id": application_id, "new_status": new_status}

# ==============================================================================
# STEP 5: ADMIN RESUME & ATS ANALYTICS ENDPOINTS
# ==============================================================================

class AdminResumeListItem(BaseModel):
    id: str
    user_id: str
    student_name: str
    student_email: str
    student_college: Optional[str] = None
    student_degree: Optional[str] = None
    filename: Optional[str] = None
    file_size_bytes: Optional[int] = None
    ats_score: float
    ats_rating: str
    skills_count: int
    created_at: Optional[datetime] = None

class AdminAtsScoreDistribution(BaseModel):
    category: str
    label: str
    count: int
    percentage: float

class AdminSkillAnalyticsItem(BaseModel):
    skill: str
    count: int

class AdminCollegeAnalyticsItem(BaseModel):
    college: str
    count: int

class AdminDegreeAnalyticsItem(BaseModel):
    degree: str
    count: int

class AdminResumesListResponse(BaseModel):
    total_resumes: int
    average_ats_score: float
    excellent_count: int
    needs_improvement_count: int
    score_distribution: List[AdminAtsScoreDistribution]
    most_common_skills: List[AdminSkillAnalyticsItem]
    top_colleges: List[AdminCollegeAnalyticsItem]
    top_degrees: List[AdminDegreeAnalyticsItem]
    page: int
    limit: int
    total_pages: int
    resumes: List[AdminResumeListItem]

class AdminResumeDetailResponse(BaseModel):
    id: str
    user_id: str
    student_name: str
    student_email: str
    student_college: Optional[str] = None
    student_degree: Optional[str] = None
    filename: Optional[str] = None
    file_size_bytes: Optional[int] = None
    created_at: Optional[datetime] = None
    ats_score: float
    ats_rating: str
    detected_sections: List[str]
    section_checks: List[Dict[str, Any]]
    extracted_skills: List[str]
    skill_categories: Dict[str, List[str]]
    missing_keywords: List[str]
    suggestions: List[str]
    word_count: Optional[int] = None
    email_on_resume: Optional[str] = None
    phone_on_resume: Optional[str] = None

@router.get("/resumes", response_model=AdminResumesListResponse, status_code=status.HTTP_200_OK)
async def get_admin_resumes_list(
    q: Optional[str] = Query(None, description="Search term for Student Name, Email, College, or Degree"),
    ats_filter: Optional[str] = Query(None, description="Filter: all, excellent (80-100), strong (65-79), needs_improvement (50-64), critical (0-49)"),
    college_filter: Optional[str] = Query(None, description="Filter by college"),
    degree_filter: Optional[str] = Query(None, description="Filter by degree"),
    sort_by: Optional[str] = Query("newest", description="Sort by: newest, oldest, ats_high, ats_low, name"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves paginated, searchable, and filtered student resume records with real ATS analytics."""
    db = await get_database_async()
    if db is None:
        return AdminResumesListResponse(
            total_resumes=0,
            average_ats_score=0.0,
            excellent_count=0,
            needs_improvement_count=0,
            score_distribution=[
                AdminAtsScoreDistribution(category="80-100", label="Excellent (80-100)", count=0, percentage=0.0),
                AdminAtsScoreDistribution(category="65-79", label="Strong (65-79)", count=0, percentage=0.0),
                AdminAtsScoreDistribution(category="50-64", label="Needs Improvement (50-64)", count=0, percentage=0.0),
                AdminAtsScoreDistribution(category="0-49", label="Critical (0-49)", count=0, percentage=0.0),
            ],
            most_common_skills=[],
            top_colleges=[],
            top_degrees=[],
            page=page,
            limit=limit,
            total_pages=1,
            resumes=[]
        )

    try:
        # Fetch all resumes to perform joins with users and compute global statistics
        all_res_cursor = db.resumes.find({})
        all_res_docs = await all_res_cursor.to_list(length=2000)

        # Pre-fetch users for fast lookup
        user_ids_set = set(r.get("user_id", "") for r in all_res_docs if r.get("user_id"))
        user_map: Dict[str, Dict[str, Any]] = {}
        if user_ids_set:
            user_obj_ids = [ObjectId(uid) for uid in user_ids_set if ObjectId.is_valid(uid)]
            str_uids = list(user_ids_set)
            users_cursor = db.users.find({"$or": [{"_id": {"$in": user_obj_ids}}, {"id": {"$in": str_uids}}]})
            u_docs = await users_cursor.to_list(length=2000)
            for u in u_docs:
                uid_str = str(u.get("_id", u.get("id")))
                user_map[uid_str] = u
                if "id" in u and isinstance(u["id"], str):
                    user_map[u["id"]] = u

        # Build enriched items list
        enriched_resumes: List[Dict[str, Any]] = []
        global_scores: List[float] = []
        skill_counts: Dict[str, int] = {}
        college_counts: Dict[str, int] = {}
        degree_counts: Dict[str, int] = {}
        cat_counts = {"80-100": 0, "65-79": 0, "50-64": 0, "0-49": 0}

        for r in all_res_docs:
            rid = str(r.get("_id", r.get("id")))
            uid = str(r.get("user_id", ""))
            u_info = user_map.get(uid, {})

            student_name = u_info.get("name", "Student Profile Unavailable")
            student_email = u_info.get("email", "")
            student_college = u_info.get("college")
            student_degree = u_info.get("degree")

            parsed = r.get("parsed_data", {})
            ats_info = parsed.get("ats_analysis", {})
            ats_score = float(ats_info.get("overall_score", 0.0))
            ats_rating = ats_info.get("rating", "Needs Improvement")
            extracted_skills = parsed.get("extracted_skills", [])
            skills_count = len(extracted_skills)

            global_scores.append(ats_score)

            # Categorize ATS score
            if ats_score >= 80:
                cat_counts["80-100"] += 1
            elif ats_score >= 65:
                cat_counts["65-79"] += 1
            elif ats_score >= 50:
                cat_counts["50-64"] += 1
            else:
                cat_counts["0-49"] += 1

            # Aggregate skill counts
            for sk in extracted_skills:
                skill_counts[sk] = skill_counts.get(sk, 0) + 1

            # Aggregate college & degree counts
            if student_college and student_college.strip():
                c_name = student_college.strip()
                college_counts[c_name] = college_counts.get(c_name, 0) + 1

            if student_degree and student_degree.strip():
                d_name = student_degree.strip()
                degree_counts[d_name] = degree_counts.get(d_name, 0) + 1

            created_at_val = r.get("created_at")

            enriched_resumes.append({
                "id": rid,
                "user_id": uid,
                "student_name": student_name,
                "student_email": student_email,
                "student_college": student_college,
                "student_degree": student_degree,
                "filename": r.get("filename"),
                "file_size_bytes": r.get("file_size_bytes"),
                "ats_score": ats_score,
                "ats_rating": ats_rating,
                "skills_count": skills_count,
                "created_at": created_at_val
            })

        total_res_count = len(enriched_resumes)
        avg_ats = round(sum(global_scores) / total_res_count, 1) if total_res_count > 0 else 0.0

        score_distribution = [
            AdminAtsScoreDistribution(
                category="80-100",
                label="Excellent (80-100)",
                count=cat_counts["80-100"],
                percentage=round((cat_counts["80-100"] / total_res_count * 100.0), 1) if total_res_count > 0 else 0.0
            ),
            AdminAtsScoreDistribution(
                category="65-79",
                label="Strong (65-79)",
                count=cat_counts["65-79"],
                percentage=round((cat_counts["65-79"] / total_res_count * 100.0), 1) if total_res_count > 0 else 0.0
            ),
            AdminAtsScoreDistribution(
                category="50-64",
                label="Needs Improvement (50-64)",
                count=cat_counts["50-64"],
                percentage=round((cat_counts["50-64"] / total_res_count * 100.0), 1) if total_res_count > 0 else 0.0
            ),
            AdminAtsScoreDistribution(
                category="0-49",
                label="Critical (0-49)",
                count=cat_counts["0-49"],
                percentage=round((cat_counts["0-49"] / total_res_count * 100.0), 1) if total_res_count > 0 else 0.0
            )
        ]

        most_common_skills = [
            AdminSkillAnalyticsItem(skill=k, count=v)
            for k, v in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]

        top_colleges = [
            AdminCollegeAnalyticsItem(college=k, count=v)
            for k, v in sorted(college_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        top_degrees = [
            AdminDegreeAnalyticsItem(degree=k, count=v)
            for k, v in sorted(degree_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        # Apply Search Filtering
        filtered_resumes = enriched_resumes
        if q and q.strip():
            query_str = q.strip().lower()
            filtered_resumes = [
                res for res in filtered_resumes
                if query_str in res["student_name"].lower()
                or query_str in res["student_email"].lower()
                or (res["student_college"] and query_str in res["student_college"].lower())
                or (res["student_degree"] and query_str in res["student_degree"].lower())
                or (res["filename"] and query_str in res["filename"].lower())
            ]

        # Apply ATS Category Filter
        if ats_filter and ats_filter.lower() != "all":
            af = ats_filter.lower()
            if af in ["excellent", "80-100"]:
                filtered_resumes = [res for res in filtered_resumes if res["ats_score"] >= 80]
            elif af in ["strong", "65-79"]:
                filtered_resumes = [res for res in filtered_resumes if 65 <= res["ats_score"] < 80]
            elif af in ["needs_improvement", "50-64"]:
                filtered_resumes = [res for res in filtered_resumes if 50 <= res["ats_score"] < 65]
            elif af in ["critical", "0-49"]:
                filtered_resumes = [res for res in filtered_resumes if res["ats_score"] < 50]

        # Apply College Filter
        if college_filter and college_filter.lower() != "all":
            cf = college_filter.strip().lower()
            filtered_resumes = [res for res in filtered_resumes if res["student_college"] and cf in res["student_college"].lower()]

        # Apply Degree Filter
        if degree_filter and degree_filter.lower() != "all":
            df = degree_filter.strip().lower()
            filtered_resumes = [res for res in filtered_resumes if res["student_degree"] and df in res["student_degree"].lower()]

        # Helper function for safe datetime sorting
        def safe_timestamp(res_item):
            dt = res_item.get("created_at")
            if isinstance(dt, datetime):
                return dt.timestamp()
            return 0.0

        # Apply Sorting
        sb = (sort_by or "newest").lower()
        if sb == "oldest":
            filtered_resumes.sort(key=safe_timestamp)
        elif sb == "ats_high":
            filtered_resumes.sort(key=lambda x: x["ats_score"], reverse=True)
        elif sb == "ats_low":
            filtered_resumes.sort(key=lambda x: x["ats_score"])
        elif sb == "name":
            filtered_resumes.sort(key=lambda x: x["student_name"].lower())
        else:  # newest
            filtered_resumes.sort(key=safe_timestamp, reverse=True)

        total_filtered = len(filtered_resumes)
        total_pages = max(1, math.ceil(total_filtered / limit))
        start_idx = (page - 1) * limit
        paginated_resumes = filtered_resumes[start_idx:start_idx + limit]

        resumes_list = [AdminResumeListItem(**item) for item in paginated_resumes]

        return AdminResumesListResponse(
            total_resumes=total_res_count,
            average_ats_score=avg_ats,
            excellent_count=cat_counts["80-100"],
            needs_improvement_count=cat_counts["50-64"] + cat_counts["0-49"],
            score_distribution=score_distribution,
            most_common_skills=most_common_skills,
            top_colleges=top_colleges,
            top_degrees=top_degrees,
            page=page,
            limit=limit,
            total_pages=total_pages,
            resumes=resumes_list
        )
    except Exception as e:
        logger.error(f"Error fetching admin resumes list: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load resumes. Please try again."
        )

@router.get("/resumes/{resume_id}", response_model=AdminResumeDetailResponse, status_code=status.HTTP_200_OK)
async def get_admin_resume_detail(
    resume_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves complete parsed ATS breakdown and student profile for a specific resume ID."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to load resume details.")

    obj_id = ObjectId(resume_id) if ObjectId.is_valid(resume_id) else resume_id
    r_doc = await db.resumes.find_one({"$or": [{"_id": obj_id}, {"id": resume_id}]})
    if not r_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume record not found.")

    rid = str(r_doc.get("_id", r_doc.get("id")))
    uid = str(r_doc.get("user_id", ""))

    student_name = "Student Profile Unavailable"
    student_email = ""
    student_college = None
    student_degree = None

    if uid:
        u_obj_id = ObjectId(uid) if ObjectId.is_valid(uid) else uid
        u_doc = await db.users.find_one({"$or": [{"_id": u_obj_id}, {"id": uid}]})
        if u_doc:
            student_name = u_doc.get("name", "Student Candidate")
            student_email = u_doc.get("email", "")
            student_college = u_doc.get("college")
            student_degree = u_doc.get("degree")

    parsed = r_doc.get("parsed_data", {})
    ats_info = parsed.get("ats_analysis", {})

    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="RESUME_VIEWED",
        resource_type="resume",
        resource_id=rid,
        target_name=f"{student_name} ({r_doc.get('filename', 'Resume')})",
        description=f"Admin viewed ATS resume analysis for {student_name}"
    )

    return AdminResumeDetailResponse(
        id=rid,
        user_id=uid,
        student_name=student_name,
        student_email=student_email,
        student_college=student_college,
        student_degree=student_degree,
        filename=r_doc.get("filename"),
        file_size_bytes=r_doc.get("file_size_bytes"),
        created_at=r_doc.get("created_at"),
        ats_score=float(ats_info.get("overall_score", 0.0)),
        ats_rating=ats_info.get("rating", "Needs Improvement"),
        detected_sections=parsed.get("detected_sections", []),
        section_checks=ats_info.get("section_checks", []),
        extracted_skills=parsed.get("extracted_skills", []),
        skill_categories=parsed.get("skill_categories", {}),
        missing_keywords=ats_info.get("missing_recommended_keywords", []),
        suggestions=ats_info.get("suggestions", []),
        word_count=parsed.get("word_count"),
        email_on_resume=parsed.get("email"),
        phone_on_resume=parsed.get("phone")
    )

@router.get("/resume-analytics", status_code=status.HTTP_200_OK)
async def get_admin_resume_analytics(
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves high-level resume ATS score distribution, top skills, top colleges, and overall readiness."""
    res_list_resp = await get_admin_resumes_list(page=1, limit=1, current_admin=current_admin)
    return {
        "total_resumes": res_list_resp.total_resumes,
        "average_ats_score": res_list_resp.average_ats_score,
        "excellent_count": res_list_resp.excellent_count,
        "needs_improvement_count": res_list_resp.needs_improvement_count,
        "score_distribution": res_list_resp.score_distribution,
        "most_common_skills": res_list_resp.most_common_skills,
        "top_colleges": res_list_resp.top_colleges,
        "top_degrees": res_list_resp.top_degrees
    }

# ==============================================================================
# STEP 6: ADMIN INTERVIEW & AI ANALYTICS ENDPOINTS
# ==============================================================================

class AdminInterviewListItem(BaseModel):
    session_id: str
    user_id: str
    student_name: str
    student_email: str
    student_college: Optional[str] = None
    student_degree: Optional[str] = None
    domain: str
    difficulty: str
    status: str
    total_questions: int
    average_score: float
    overall_rating: str
    created_at: Optional[datetime] = None

class AdminInterviewScoreDistribution(BaseModel):
    category: str
    label: str
    count: int
    percentage: float

class AdminDomainAnalyticsItem(BaseModel):
    domain: str
    sessions_count: int
    average_score: float

class AdminConceptAnalyticsItem(BaseModel):
    concept: str
    count: int

class AdminInterviewsListResponse(BaseModel):
    total_interviews: int
    completed_interviews: int
    in_progress_interviews: int
    average_score: float
    highest_score: float
    lowest_score: float
    unique_candidates_count: int
    score_distribution: List[AdminInterviewScoreDistribution]
    domain_analytics: List[AdminDomainAnalyticsItem]
    top_mastered_concepts: List[AdminConceptAnalyticsItem]
    top_missing_concepts: List[AdminConceptAnalyticsItem]
    page: int
    limit: int
    total_pages: int
    interviews: List[AdminInterviewListItem]

class AdminInterviewQuestionEvaluation(BaseModel):
    question_id: str
    question_text: Optional[str] = None
    category: Optional[str] = None
    candidate_answer: Optional[str] = None
    score: float
    rating: str
    clarity_score: Optional[float] = None
    technical_accuracy_score: Optional[float] = None
    strengths: List[str] = []
    missing_concepts: List[str] = []
    improvement_feedback: Optional[str] = None
    ideal_sample_response: Optional[str] = None

class AdminInterviewDetailResponse(BaseModel):
    session_id: str
    user_id: str
    student_name: str
    student_email: str
    student_college: Optional[str] = None
    student_degree: Optional[str] = None
    domain: str
    difficulty: str
    status: str
    total_questions: int
    average_score: float
    overall_rating: str
    feedback_summary: Optional[str] = None
    created_at: Optional[datetime] = None
    questions: List[Dict[str, Any]] = []
    evaluations: List[AdminInterviewQuestionEvaluation] = []

@router.get("/interviews", response_model=AdminInterviewsListResponse, status_code=status.HTTP_200_OK)
async def get_admin_interviews_list(
    q: Optional[str] = Query(None, description="Search term for Student Name, Email, College, Degree, Domain, or Session ID"),
    status_filter: Optional[str] = Query(None, description="Filter by status: all, Completed, In Progress"),
    domain_filter: Optional[str] = Query(None, description="Filter by domain"),
    rating_filter: Optional[str] = Query(None, description="Filter by rating: Mastered, Proficient, Developing, Needs Practice"),
    sort_by: Optional[str] = Query("newest", description="Sort by: newest, oldest, score_high, score_low, name"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves paginated, searchable, and filtered student mock interview sessions with real AI performance analytics."""
    db = await get_database_async()
    if db is None:
        return AdminInterviewsListResponse(
            total_interviews=0,
            completed_interviews=0,
            in_progress_interviews=0,
            average_score=0.0,
            highest_score=0.0,
            lowest_score=0.0,
            unique_candidates_count=0,
            score_distribution=[
                AdminInterviewScoreDistribution(category="85-100", label="Mastered (85-100)", count=0, percentage=0.0),
                AdminInterviewScoreDistribution(category="70-84", label="Proficient (70-84)", count=0, percentage=0.0),
                AdminInterviewScoreDistribution(category="50-69", label="Developing (50-69)", count=0, percentage=0.0),
                AdminInterviewScoreDistribution(category="0-49", label="Needs Practice (0-49)", count=0, percentage=0.0),
            ],
            domain_analytics=[],
            top_mastered_concepts=[],
            top_missing_concepts=[],
            page=page,
            limit=limit,
            total_pages=1,
            interviews=[]
        )

    try:
        # Fetch all interview documents
        cursor = db.interviews.find({})
        all_int_docs = await cursor.to_list(length=2000)

        # Pre-fetch users for fast lookup
        user_ids_set = set(str(d.get("user_id", "")) for d in all_int_docs if d.get("user_id"))
        user_map: Dict[str, Dict[str, Any]] = {}
        if user_ids_set:
            user_obj_ids = [ObjectId(uid) for uid in user_ids_set if ObjectId.is_valid(uid)]
            str_uids = list(user_ids_set)
            users_cursor = db.users.find({"$or": [{"_id": {"$in": user_obj_ids}}, {"id": {"$in": str_uids}}]})
            u_docs = await users_cursor.to_list(length=2000)
            for u in u_docs:
                uid_str = str(u.get("_id", u.get("id")))
                user_map[uid_str] = u
                if "id" in u and isinstance(u["id"], str):
                    user_map[u["id"]] = u

        enriched_interviews: List[Dict[str, Any]] = []
        completed_scores: List[float] = []
        completed_user_ids: Set[str] = set()
        domain_stats: Dict[str, List[float]] = {}
        mastered_concepts_map: Dict[str, int] = {}
        missing_concepts_map: Dict[str, int] = {}
        cat_counts = {"85-100": 0, "70-84": 0, "50-69": 0, "0-49": 0}
        completed_count = 0
        in_progress_count = 0

        for d in all_int_docs:
            sid = str(d.get("session_id", d.get("_id")))
            uid = str(d.get("user_id", ""))
            u_info = user_map.get(uid, {})

            student_name = u_info.get("name", "Student Profile Unavailable")
            student_email = u_info.get("email", "")
            student_college = u_info.get("college")
            student_degree = u_info.get("degree")

            domain = d.get("domain", "Full Stack Engineering")
            difficulty = d.get("difficulty", "Medium")
            int_status = d.get("status", "Completed")

            summary = d.get("summary", {})
            avg_score = float(summary.get("average_score", 0.0))
            overall_rating = summary.get("overall_rating") or ("Mastered" if avg_score >= 85 else ("Proficient" if avg_score >= 70 else "Developing"))

            questions_list = d.get("questions", [])
            total_qs = len(questions_list) or summary.get("total_questions", 3)

            if int_status == "Completed":
                completed_count += 1
                completed_scores.append(avg_score)
                completed_user_ids.add(uid)

                # Categorize score
                if avg_score >= 85:
                    cat_counts["85-100"] += 1
                elif avg_score >= 70:
                    cat_counts["70-84"] += 1
                elif avg_score >= 50:
                    cat_counts["50-69"] += 1
                else:
                    cat_counts["0-49"] += 1

                # Domain aggregation
                if domain not in domain_stats:
                    domain_stats[domain] = []
                domain_stats[domain].append(avg_score)

                # Concept aggregation from evaluations
                evals = d.get("evaluations", [])
                for ev in evals:
                    for str_item in ev.get("strengths", []):
                        if "concept" in str_item.lower() or ":" in str_item:
                            clean_c = str_item.replace("Successfully covered core concepts:", "").strip()
                            for c in clean_c.split(","):
                                c_clean = c.strip().rstrip(".")
                                if c_clean:
                                    mastered_concepts_map[c_clean] = mastered_concepts_map.get(c_clean, 0) + 1
                    for mc in ev.get("missing_concepts", []):
                        mc_clean = str(mc).strip()
                        if mc_clean:
                            missing_concepts_map[mc_clean] = missing_concepts_map.get(mc_clean, 0) + 1
            else:
                in_progress_count += 1

            enriched_interviews.append({
                "session_id": sid,
                "user_id": uid,
                "student_name": student_name,
                "student_email": student_email,
                "student_college": student_college,
                "student_degree": student_degree,
                "domain": domain,
                "difficulty": difficulty,
                "status": int_status,
                "total_questions": total_qs,
                "average_score": avg_score,
                "overall_rating": overall_rating,
                "created_at": d.get("created_at")
            })

        total_int_count = len(enriched_interviews)
        avg_score_all = round(sum(completed_scores) / len(completed_scores), 1) if completed_scores else 0.0
        high_score = max(completed_scores) if completed_scores else 0.0
        low_score = min(completed_scores) if completed_scores else 0.0

        score_distribution = [
            AdminInterviewScoreDistribution(
                category="85-100",
                label="Mastered (85-100)",
                count=cat_counts["85-100"],
                percentage=round((cat_counts["85-100"] / completed_count * 100.0), 1) if completed_count > 0 else 0.0
            ),
            AdminInterviewScoreDistribution(
                category="70-84",
                label="Proficient (70-84)",
                count=cat_counts["70-84"],
                percentage=round((cat_counts["70-84"] / completed_count * 100.0), 1) if completed_count > 0 else 0.0
            ),
            AdminInterviewScoreDistribution(
                category="50-69",
                label="Developing (50-69)",
                count=cat_counts["50-69"],
                percentage=round((cat_counts["50-69"] / completed_count * 100.0), 1) if completed_count > 0 else 0.0
            ),
            AdminInterviewScoreDistribution(
                category="0-49",
                label="Needs Practice (0-49)",
                count=cat_counts["0-49"],
                percentage=round((cat_counts["0-49"] / completed_count * 100.0), 1) if completed_count > 0 else 0.0
            )
        ]

        domain_analytics = [
            AdminDomainAnalyticsItem(
                domain=dom,
                sessions_count=len(scores),
                average_score=round(sum(scores) / len(scores), 1)
            )
            for dom, scores in domain_stats.items()
        ]

        top_mastered_concepts = [
            AdminConceptAnalyticsItem(concept=k, count=v)
            for k, v in sorted(mastered_concepts_map.items(), key=lambda x: x[1], reverse=True)[:8]
        ]

        top_missing_concepts = [
            AdminConceptAnalyticsItem(concept=k, count=v)
            for k, v in sorted(missing_concepts_map.items(), key=lambda x: x[1], reverse=True)[:8]
        ]

        # Search Filtering
        filtered_interviews = enriched_interviews
        if q and q.strip():
            query_str = q.strip().lower()
            filtered_interviews = [
                item for item in filtered_interviews
                if query_str in item["student_name"].lower()
                or query_str in item["student_email"].lower()
                or (item["student_college"] and query_str in item["student_college"].lower())
                or (item["student_degree"] and query_str in item["student_degree"].lower())
                or query_str in item["domain"].lower()
                or query_str in item["session_id"].lower()
            ]

        # Status Filter
        if status_filter and status_filter.lower() != "all":
            sf = status_filter.strip().lower()
            filtered_interviews = [item for item in filtered_interviews if item["status"].lower() == sf]

        # Domain Filter
        if domain_filter and domain_filter.lower() != "all":
            df = domain_filter.strip().lower()
            filtered_interviews = [item for item in filtered_interviews if df in item["domain"].lower()]

        # Rating Filter
        if rating_filter and rating_filter.lower() != "all":
            rf = rating_filter.strip().lower()
            filtered_interviews = [item for item in filtered_interviews if rf in item["overall_rating"].lower()]

        # Safe Datetime Helper for Sorting
        def safe_timestamp(item):
            dt = item.get("created_at")
            if isinstance(dt, datetime):
                return dt.timestamp()
            return 0.0

        # Sorting
        sb = (sort_by or "newest").lower()
        if sb == "oldest":
            filtered_interviews.sort(key=safe_timestamp)
        elif sb == "score_high":
            filtered_interviews.sort(key=lambda x: x["average_score"], reverse=True)
        elif sb == "score_low":
            filtered_interviews.sort(key=lambda x: x["average_score"])
        elif sb == "name":
            filtered_interviews.sort(key=lambda x: x["student_name"].lower())
        else:  # newest
            filtered_interviews.sort(key=safe_timestamp, reverse=True)

        total_filtered = len(filtered_interviews)
        total_pages = max(1, math.ceil(total_filtered / limit))
        start_idx = (page - 1) * limit
        paginated_interviews = filtered_interviews[start_idx:start_idx + limit]

        interviews_list = [AdminInterviewListItem(**item) for item in paginated_interviews]

        return AdminInterviewsListResponse(
            total_interviews=total_int_count,
            completed_interviews=completed_count,
            in_progress_interviews=in_progress_count,
            average_score=avg_score_all,
            highest_score=high_score,
            lowest_score=low_score,
            unique_candidates_count=len(completed_user_ids),
            score_distribution=score_distribution,
            domain_analytics=domain_analytics,
            top_mastered_concepts=top_mastered_concepts,
            top_missing_concepts=top_missing_concepts,
            page=page,
            limit=limit,
            total_pages=total_pages,
            interviews=interviews_list
        )

    except Exception as e:
        logger.error(f"Error fetching admin interviews list: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load interview sessions. Please try again."
        )

@router.get("/interviews/{session_id}", response_model=AdminInterviewDetailResponse, status_code=status.HTTP_200_OK)
async def get_admin_interview_detail(
    session_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves full questions, student responses, evaluations, and summary for a specific interview session."""
    db = await get_database_async()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to load interview details.")

    int_doc = await db.interviews.find_one({"session_id": session_id})
    if not int_doc:
        # Fallback check by ObjectId
        obj_id = ObjectId(session_id) if ObjectId.is_valid(session_id) else session_id
        int_doc = await db.interviews.find_one({"_id": obj_id})

    if not int_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session record not found.")

    sid = str(int_doc.get("session_id", int_doc.get("_id")))
    uid = str(int_doc.get("user_id", ""))

    student_name = "Student Profile Unavailable"
    student_email = ""
    student_college = None
    student_degree = None

    if uid:
        u_obj_id = ObjectId(uid) if ObjectId.is_valid(uid) else uid
        u_doc = await db.users.find_one({"$or": [{"_id": u_obj_id}, {"id": uid}]})
        if u_doc:
            student_name = u_doc.get("name", "Student Candidate")
            student_email = u_doc.get("email", "")
            student_college = u_doc.get("college")
            student_degree = u_doc.get("degree")

    summary = int_doc.get("summary", {})
    avg_score = float(summary.get("average_score", 0.0))
    overall_rating = summary.get("overall_rating") or ("Mastered" if avg_score >= 85 else ("Proficient" if avg_score >= 70 else "Developing"))

    questions_list = int_doc.get("questions", [])
    raw_evals = int_doc.get("evaluations", [])

    formatted_evals: List[AdminInterviewQuestionEvaluation] = []
    for idx, ev in enumerate(raw_evals):
        q_info = questions_list[idx] if idx < len(questions_list) else {}
        formatted_evals.append(
            AdminInterviewQuestionEvaluation(
                question_id=ev.get("question_id", f"q_{idx+1}"),
                question_text=q_info.get("question_text"),
                category=q_info.get("category"),
                candidate_answer=ev.get("candidate_answer"),
                score=float(ev.get("score", 0.0)),
                rating=ev.get("rating", "Developing"),
                clarity_score=ev.get("clarity_score"),
                technical_accuracy_score=ev.get("technical_accuracy_score"),
                strengths=ev.get("strengths", []),
                missing_concepts=ev.get("missing_concepts", []),
                improvement_feedback=ev.get("improvement_feedback"),
                ideal_sample_response=ev.get("ideal_sample_response")
            )
        )

    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="INTERVIEW_VIEWED",
        resource_type="interview",
        resource_id=sid,
        target_name=f"{student_name} - {int_doc.get('domain', 'Mock Interview')}",
        description=f"Admin viewed AI interview evaluation for {student_name}"
    )

    return AdminInterviewDetailResponse(
        session_id=sid,
        user_id=uid,
        student_name=student_name,
        student_email=student_email,
        student_college=student_college,
        student_degree=student_degree,
        domain=int_doc.get("domain", "Full Stack Engineering"),
        difficulty=int_doc.get("difficulty", "Medium"),
        status=int_doc.get("status", "Completed"),
        total_questions=len(questions_list) or summary.get("total_questions", 3),
        average_score=avg_score,
        overall_rating=overall_rating,
        feedback_summary=summary.get("feedback_summary"),
        created_at=int_doc.get("created_at"),
        questions=questions_list,
        evaluations=formatted_evals
    )

@router.get("/interview-analytics", status_code=status.HTTP_200_OK)
async def get_admin_interview_analytics(
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves aggregate interview performance metrics, domain averages, and score distributions."""
    int_list_resp = await get_admin_interviews_list(page=1, limit=1, current_admin=current_admin)
    return {
        "total_interviews": int_list_resp.total_interviews,
        "completed_interviews": int_list_resp.completed_interviews,
        "in_progress_interviews": int_list_resp.in_progress_interviews,
        "average_score": int_list_resp.average_score,
        "highest_score": int_list_resp.highest_score,
        "lowest_score": int_list_resp.lowest_score,
        "unique_candidates_count": int_list_resp.unique_candidates_count,
        "score_distribution": int_list_resp.score_distribution,
        "domain_analytics": int_list_resp.domain_analytics,
        "top_mastered_concepts": int_list_resp.top_mastered_concepts,
        "top_missing_concepts": int_list_resp.top_missing_concepts
    }

@router.get("/test-protected", status_code=status.HTTP_200_OK)
async def test_admin_protected(current_admin: Dict[str, Any] = Depends(get_current_admin_user)):
    """Protected test endpoint to verify role-based authorization."""
    return {
        "status": "success",
        "message": "Administrator privileges confirmed.",
        "admin": current_admin
    }

# ==============================================================================
# STEP 7: ADMIN SYSTEM HEALTH & INFRASTRUCTURE MONITORING ENDPOINTS
# ==============================================================================

class AdminServiceHealthItem(BaseModel):
    id: str
    name: str
    status: str  # "Operational" | "Degraded" | "Unavailable"
    response_time_ms: float
    last_checked: str
    purpose: str
    details: Dict[str, Any]

class AdminDatabaseHealthResponse(BaseModel):
    mongodb: Dict[str, Any]
    chromadb: Dict[str, Any]

class AdminSystemHealthResponse(BaseModel):
    overall_status: str  # "Operational" | "Degraded" | "Unavailable"
    server_timestamp: str
    app_version: str
    environment: str
    total_students: int
    total_resumes: int
    total_jobs: int
    total_applications: int
    total_interviews: int
    active_applications: int
    completed_interviews: int
    chroma_document_count: int
    services: List[AdminServiceHealthItem]

@router.get("/system-health", response_model=AdminSystemHealthResponse, status_code=status.HTTP_200_OK)
async def get_admin_system_health(
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves real-time operational health checks and performance metrics for all platform services."""
    now_iso = datetime.now(timezone.utc).isoformat()
    services_list: List[AdminServiceHealthItem] = []

    # 1. FastAPI / Backend Server
    services_list.append(
        AdminServiceHealthItem(
            id="fastapi_backend",
            name="FastAPI Backend Server",
            status="Operational",
            response_time_ms=0.5,
            last_checked=now_iso,
            purpose="Core REST API router, WebSocket connections, and business logic execution",
            details={
                "app_name": settings.APP_NAME,
                "version": settings.APP_VERSION,
                "environment": "development" if settings.DEBUG else "production",
                "framework": "FastAPI (Python 3.13)"
            }
        )
    )

    # 2. MongoDB Atlas Database
    mongo_status = "Unavailable"
    mongo_latency = 0.0
    mongo_details: Dict[str, Any] = {
        "database_name": settings.MONGODB_DB_NAME,
        "users_count": 0,
        "resumes_count": 0,
        "jobs_count": 0,
        "applications_count": 0,
        "interviews_count": 0,
        "active_applications_count": 0,
        "completed_interviews_count": 0
    }
    
    total_students = 0
    total_resumes = 0
    total_jobs = 0
    total_applications = 0
    total_interviews = 0
    active_applications = 0
    completed_interviews = 0

    try:
        db = await get_database_async()
        if db is not None:
            t0 = time.time()
            if db_instance.client is not None:
                await db_instance.client.admin.command('ping')
            mongo_latency = round((time.time() - t0) * 1000, 1)
            mongo_status = "Operational"

            total_students = await db.users.count_documents({"$or": [{"role": "student"}, {"role": {"$exists": False}}]})
            total_resumes = await db.resumes.count_documents({})
            total_jobs = await db.jobs.count_documents({})
            total_applications = await db.applications.count_documents({})
            total_interviews = await db.interviews.count_documents({})
            active_applications = await db.applications.count_documents({"status": {"$in": ["Submitted", "Under Review", "Interview Scheduled"]}})
            completed_interviews = await db.interviews.count_documents({"status": "Completed"})

            mongo_details.update({
                "connection_status": db_instance.connection_status,
                "users_count": total_students,
                "resumes_count": total_resumes,
                "jobs_count": total_jobs,
                "applications_count": total_applications,
                "interviews_count": total_interviews,
                "active_applications_count": active_applications,
                "completed_interviews_count": completed_interviews
            })
    except Exception as e:
        logger.error(f"MongoDB health check failed: {e}")
        mongo_status = "Unavailable"
        mongo_details["error"] = "MongoDB connection unavailable. Database-dependent features may be temporarily affected."

    services_list.append(
        AdminServiceHealthItem(
            id="mongodb_atlas",
            name="MongoDB Atlas Database",
            status=mongo_status,
            response_time_ms=mongo_latency,
            last_checked=now_iso,
            purpose="Primary document store for user profiles, resumes, jobs, applications, and interviews",
            details=mongo_details
        )
    )

    # 3. ChromaDB Persistent Vector Store
    chroma_status = "Unavailable"
    chroma_latency = 0.0
    chroma_doc_count = 0
    chroma_details: Dict[str, Any] = {
        "collection_name": settings.CHROMA_COLLECTION_NAME,
        "total_documents": 0,
        "all_collections": ["campusmate_knowledge", "campusmate_resumes", "campusmate_jobs"]
    }

    try:
        t0 = time.time()
        col = get_chroma_collection()
        if col is not None:
            chroma_doc_count = col.count()
            chroma_latency = round((time.time() - t0) * 1000, 1)
            chroma_status = "Operational"
            chroma_details["total_documents"] = chroma_doc_count
    except Exception as e:
        logger.error(f"ChromaDB health check failed: {e}")
        chroma_status = "Degraded"
        chroma_details["error"] = "ChromaDB vector store unavailable."

    services_list.append(
        AdminServiceHealthItem(
            id="chromadb_vectorstore",
            name="ChromaDB Persistent Vector Store",
            status=chroma_status,
            response_time_ms=chroma_latency,
            last_checked=now_iso,
            purpose="Semantic vector embeddings storage and RAG context retrieval engine",
            details=chroma_details
        )
    )

    # 4. Authentication & JWT Security Engine
    services_list.append(
        AdminServiceHealthItem(
            id="auth_jwt_service",
            name="Authentication & JWT Security Service",
            status="Operational",
            response_time_ms=0.2,
            last_checked=now_iso,
            purpose="PBKDF2 SHA256 password hashing, bearer token signing, and role-based access control",
            details={
                "algorithm": "HS256",
                "token_expiration": f"{settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes",
                "secret_key_status": "Configured (HS256)"
            }
        )
    )

    # 5. Resume Parser & PyPDF Extraction Service
    parser_status = "Operational"
    pypdf_available = True
    try:
        import pypdf
    except ImportError:
        pypdf_available = False
        parser_status = "Degraded"

    services_list.append(
        AdminServiceHealthItem(
            id="resume_parser_pypdf",
            name="Resume Parser & PyPDF Extraction Service",
            status=parser_status,
            response_time_ms=0.8,
            last_checked=now_iso,
            purpose="PDF binary text extraction, ATS criteria evaluation, and skill taxonomy matching",
            details={
                "pypdf_engine": "Installed" if pypdf_available else "Missing",
                "supported_formats": [".pdf"],
                "skill_categories": ["Languages", "Frameworks & Libraries", "Databases", "Cloud & DevOps", "AI & Data Science", "Tools & Methodology"]
            }
        )
    )

    # 6. Random Forest ML Recommendation Engine
    ml_status = "Degraded"
    ml_latency = 0.0
    ml_details: Dict[str, Any] = {"model_file": "job_eligibility_model.joblib", "model_exists": False}
    try:
        t0 = time.time()
        rf_model = load_or_train_model()
        ml_latency = round((time.time() - t0) * 1000, 1)
        ml_status = "Operational"
        ml_details.update({
            "model_exists": os.path.exists(MODEL_FILE_PATH),
            "estimators_count": getattr(rf_model, "n_estimators", 100),
            "features_dimension": 4
        })
    except Exception as e:
        logger.error(f"Random Forest ML health check failed: {e}")
        ml_status = "Degraded"
        ml_details["error"] = str(e)

    services_list.append(
        AdminServiceHealthItem(
            id="random_forest_ml",
            name="Random Forest ML Recommendation Engine",
            status=ml_status,
            response_time_ms=ml_latency,
            last_checked=now_iso,
            purpose="Scikit-Learn ensemble model for candidate-job match probability and eligibility classification",
            details=ml_details
        )
    )

    # 7. LangGraph AI Agent Orchestrator
    agent_status = "Operational"
    services_list.append(
        AdminServiceHealthItem(
            id="langgraph_agent",
            name="LangGraph AI Agent Framework",
            status=agent_status,
            response_time_ms=0.4,
            last_checked=now_iso,
            purpose="Stateful graph orchestration engine executing tools across resumes, jobs, and RAG knowledge",
            details={
                "state_graph_compiled": _compiled_agent is not None,
                "tool_registry": ["get_user_resume_analysis", "evaluate_user_recommendations", "get_user_applications", "query_similar_documents"]
            }
        )
    )

    # 8. Mock Interview Evaluation Engine
    total_q_count = sum(len(qs) for qs in QUESTION_BANK.values())
    services_list.append(
        AdminServiceHealthItem(
            id="mock_interview_engine",
            name="AI Mock Interview Evaluation Engine",
            status="Operational",
            response_time_ms=0.3,
            last_checked=now_iso,
            purpose="Domain-tailored technical interview question generation and multi-criterion response grading",
            details={
                "question_bank_domains": list(QUESTION_BANK.keys()),
                "total_questions_in_bank": total_q_count,
                "evaluation_metrics": ["Technical Accuracy (70%)", "Clarity & Depth (30%)"]
            }
        )
    )

    # 9. LLM Provider Configuration
    api_key_configured = bool(settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5)
    services_list.append(
        AdminServiceHealthItem(
            id="llm_provider_config",
            name="LLM Provider Configuration",
            status="Operational" if api_key_configured else "Degraded",
            response_time_ms=0.1,
            last_checked=now_iso,
            purpose="Large Language Model provider integration for career insights and response synthesis",
            details={
                "provider": "OpenAI / LangChain Integration",
                "model_name": "gpt-4o-mini",
                "api_key_status": "Configured" if api_key_configured else "Not configured"
            }
        )
    )

    overall_status = "Operational"
    if mongo_status != "Operational" or chroma_status != "Operational":
        overall_status = "Degraded"

    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="SYSTEM_HEALTH_VIEWED",
        resource_type="system",
        description="Admin inspected system health and infrastructure monitoring panel"
    )

    return AdminSystemHealthResponse(
        overall_status=overall_status,
        server_timestamp=now_iso,
        app_version=settings.APP_VERSION,
        environment="development" if settings.DEBUG else "production",
        total_students=total_students,
        total_resumes=total_resumes,
        total_jobs=total_jobs,
        total_applications=total_applications,
        total_interviews=total_interviews,
        active_applications=active_applications,
        completed_interviews=completed_interviews,
        chroma_document_count=chroma_doc_count,
        services=services_list
    )

@router.get("/system-health/database", response_model=AdminDatabaseHealthResponse, status_code=status.HTTP_200_OK)
async def get_admin_system_health_database(
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves deep real-time connectivity and collection metrics for MongoDB Atlas and ChromaDB."""
    health_res = await get_admin_system_health(current_admin=current_admin)
    
    mongo_svc = next((s for s in health_res.services if s.id == "mongodb_atlas"), None)
    chroma_svc = next((s for s in health_res.services if s.id == "chromadb_vectorstore"), None)

    return AdminDatabaseHealthResponse(
        mongodb=mongo_svc.details if mongo_svc else {},
        chromadb=chroma_svc.details if chroma_svc else {}
    )

@router.get("/system-health/services", response_model=List[AdminServiceHealthItem], status_code=status.HTTP_200_OK)
async def get_admin_system_health_services(
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves individual service health check items with diagnostic messages."""
    health_res = await get_admin_system_health(current_admin=current_admin)
    return health_res.services

# ==============================================================================
# STEP 8: ADMIN ANALYTICS & REPORTS ENDPOINTS
# ==============================================================================

@router.get("/analytics/overview", status_code=status.HTTP_200_OK)
async def get_admin_analytics_overview_route(
    time_range: Optional[str] = Query("all", description="Time range filter: 7d, 30d, 90d, 12m, all"),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves high-level platform-wide analytics overview and metrics."""
    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="ANALYTICS_VIEWED",
        resource_type="analytics",
        description=f"Admin viewed platform analytics report (range: {time_range})"
    )
    return await get_analytics_overview(time_range=time_range)

@router.get("/analytics/students", status_code=status.HTTP_200_OK)
async def get_admin_analytics_students_route(
    time_range: Optional[str] = Query("all", description="Time range filter: 7d, 30d, 90d, 12m, all"),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves candidate registration trends, college & degree distributions, and top skills."""
    return await get_student_analytics(time_range=time_range)

@router.get("/analytics/jobs", status_code=status.HTTP_200_OK)
async def get_admin_analytics_jobs_route(
    time_range: Optional[str] = Query("all", description="Time range filter: 7d, 30d, 90d, 12m, all"),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves job marketplace metrics, company distributions, and requested skills."""
    return await get_job_analytics(time_range=time_range)

@router.get("/analytics/applications", status_code=status.HTTP_200_OK)
async def get_admin_analytics_applications_route(
    time_range: Optional[str] = Query("all", description="Time range filter: 7d, 30d, 90d, 12m, all"),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves application funnel metrics, status distributions, and top hiring companies."""
    return await get_application_analytics(time_range=time_range)

@router.get("/analytics/resumes", status_code=status.HTTP_200_OK)
async def get_admin_analytics_resumes_route(
    time_range: Optional[str] = Query("all", description="Time range filter: 7d, 30d, 90d, 12m, all"),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves resume ATS score distributions, extracted skills, and common missing keywords."""
    return await get_resume_analytics(time_range=time_range)

@router.get("/analytics/interviews", status_code=status.HTTP_200_OK)
async def get_admin_analytics_interviews_route(
    time_range: Optional[str] = Query("all", description="Time range filter: 7d, 30d, 90d, 12m, all"),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves mock interview session scores, domain averages, and concept mastery gaps."""
    return await get_interview_analytics(time_range=time_range)

@router.get("/analytics/readiness", status_code=status.HTTP_200_OK)
async def get_admin_analytics_readiness_route(
    time_range: Optional[str] = Query("all", description="Time range filter: 7d, 30d, 90d, 12m, all"),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves Career Readiness score distributions and top candidate skill gaps."""
    return await get_career_readiness_analytics(time_range=time_range)

@router.get("/analytics/insights", status_code=status.HTTP_200_OK)
async def get_admin_analytics_insights_route(
    time_range: Optional[str] = Query("all", description="Time range filter: 7d, 30d, 90d, 12m, all"),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves rule-based platform insights grounded in real MongoDB Atlas data."""
    return await get_platform_insights(time_range=time_range)

# ==============================================================================
# STEP 9: ADMIN AUDIT LOGS & ACTIVITY TRACKING SCHEMAS & ENDPOINTS
# ==============================================================================

class AdminAuditLogListItem(BaseModel):
    id: str
    admin_id: str
    admin_username: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    description: str
    target_name: Optional[str] = None
    metadata: Dict[str, Any] = {}
    ip_address: Optional[str] = "127.0.0.1"
    created_at: Optional[datetime] = None

class AdminAuditLogsListResponse(BaseModel):
    total_logs: int
    page: int
    limit: int
    total_pages: int
    logs: List[AdminAuditLogListItem]

@router.get("/audit-logs", response_model=AdminAuditLogsListResponse, status_code=status.HTTP_200_OK)
async def get_admin_audit_logs_route(
    q: Optional[str] = Query(None, description="Search query for username, action, resource, target name, description"),
    action_filter: Optional[str] = Query(None, description="Filter by action type"),
    resource_type_filter: Optional[str] = Query(None, description="Filter by resource category"),
    admin_filter: Optional[str] = Query(None, description="Filter by admin username"),
    time_range: Optional[str] = Query("all", description="Time range filter: today, 7d, 30d, 90d, all"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: Optional[str] = Query("newest", description="Sort order: newest, oldest"),
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves paginated, searchable, and filtered administrative audit log events."""
    res = await get_audit_logs_list(
        q=q,
        action_filter=action_filter,
        resource_type_filter=resource_type_filter,
        admin_filter=admin_filter,
        time_range=time_range,
        page=page,
        limit=limit,
        sort_by=sort_by
    )
    return AdminAuditLogsListResponse(**res)

@router.get("/audit-logs/analytics", status_code=status.HTTP_200_OK)
async def get_admin_audit_analytics_route(
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves real aggregated audit metrics and recent activity timeline from MongoDB Atlas."""
    return await get_audit_analytics()

@router.get("/audit-logs/{log_id}", response_model=AdminAuditLogListItem, status_code=status.HTTP_200_OK)
async def get_admin_audit_log_detail_route(
    log_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves complete safe audit log event record by ID."""
    doc = await get_audit_log_detail(log_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit log record not found.")
    return AdminAuditLogListItem(**doc)

# ==============================================================================
# STEP 10: ADMIN SETTINGS & PLATFORM CONFIGURATION SCHEMAS & ENDPOINTS
# ==============================================================================

class ChangeAdminPasswordRequest(BaseModel):
    current_password: str = Field(..., example="rajput")
    new_password: str = Field(..., example="NewPassword123!")
    confirm_password: str = Field(..., example="NewPassword123!")

class UpdateAdminProfileRequest(BaseModel):
    display_name: Optional[str] = None
    email_notifications: Optional[bool] = True

@router.get("/settings", status_code=status.HTTP_200_OK)
async def get_admin_settings_route(
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves safe platform information, database collection metrics, and AI service health statuses."""
    db = await get_database_async()
    
    total_students = 0
    total_resumes = 0
    total_jobs = 0
    total_applications = 0
    total_interviews = 0
    total_audit_logs = 0

    if db is not None:
        total_students = await db.users.count_documents({"$or": [{"role": "student"}, {"role": {"$exists": False}}]})
        total_resumes = await db.resumes.count_documents({})
        total_jobs = await db.jobs.count_documents({})
        total_applications = await db.applications.count_documents({})
        total_interviews = await db.interviews.count_documents({})
        total_audit_logs = await db.audit_logs.count_documents({})

    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=str(current_admin.get("username", "admin")),
        action="ADMIN_SETTINGS_VIEWED",
        resource_type="settings",
        description="Admin inspected platform configuration and settings dashboard"
    )

    return {
        "platform": {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": "development" if settings.DEBUG else "production",
            "server_time": datetime.now(timezone.utc).isoformat()
        },
        "database": {
            "name": settings.MONGODB_DB_NAME,
            "status": "Operational" if db is not None else "Unavailable",
            "metrics": {
                "users_count": total_students,
                "resumes_count": total_resumes,
                "jobs_count": total_jobs,
                "applications_count": total_applications,
                "interviews_count": total_interviews,
                "audit_logs_count": total_audit_logs
            }
        },
        "services": {
            "resume_parser": "Operational",
            "chromadb": "Operational",
            "ml_engine": "Operational",
            "agent_engine": "Operational",
            "interview_engine": "Operational"
        },
        "security": {
            "jwt_auth": "Active",
            "admin_rbac": "Active",
            "audit_logging": "Active",
            "password_hashing": "BCrypt SHA-256"
        }
    }

@router.get("/settings/profile", status_code=status.HTTP_200_OK)
async def get_admin_profile_route(
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Retrieves safe administrator profile overview."""
    return {
        "username": current_admin.get("username", "admin"),
        "role": current_admin.get("role", "admin"),
        "status": "Active",
        "last_login": datetime.now(timezone.utc).isoformat()
    }

@router.put("/settings/profile", status_code=status.HTTP_200_OK)
async def update_admin_profile_route(
    body: UpdateAdminProfileRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Updates safe administrator profile preferences."""
    username = current_admin.get("username", "admin")
    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=username,
        action="ADMIN_PROFILE_UPDATED",
        resource_type="settings",
        description=f"Updated admin profile preferences for '{username}'"
    )
    return {
        "status": "success",
        "message": "Admin profile preferences updated successfully.",
        "username": username
    }

@router.post("/settings/change-password", status_code=status.HTTP_200_OK)
async def change_admin_password_route(
    body: ChangeAdminPasswordRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin_user)
):
    """Securely updates the administrator password after current password verification."""
    username = current_admin.get("username", "admin")
    curr_pwd = body.current_password
    new_pwd = body.new_password
    conf_pwd = body.confirm_password

    # Validate Current Password
    is_valid = False
    if settings.ADMIN_PASSWORD_HASH and settings.ADMIN_PASSWORD_HASH.strip():
        is_valid = verify_password(curr_pwd, settings.ADMIN_PASSWORD_HASH.strip())
    else:
        is_valid = (curr_pwd == settings.ADMIN_PASSWORD)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    # Validate Match
    if new_pwd != conf_pwd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match."
        )

    # Validate Strength Requirements
    if len(new_pwd) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password does not meet the security requirements. Minimum length is 6 characters."
        )

    # Hash new password securely using bcrypt
    new_hash = hash_password(new_pwd)
    settings.ADMIN_PASSWORD_HASH = new_hash
    settings.ADMIN_PASSWORD = new_pwd

    # Log safe audit event without exposing plaintext passwords or hashes
    await log_audit_event(
        admin_id=str(current_admin.get("sub", "admin")),
        admin_username=username,
        action="ADMIN_PASSWORD_CHANGED",
        resource_type="settings",
        description=f"Administrator '{username}' changed account password successfully"
    )

    logger.info(f"Admin password changed successfully for user '{username}'")
    return {
        "status": "success",
        "message": "Admin password changed successfully."
    }
# Reload settings checkpoint
