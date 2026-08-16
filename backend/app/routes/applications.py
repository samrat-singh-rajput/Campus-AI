import logging
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate
from app.routes.auth import get_current_user
from app.services.application_service import (
    apply_for_job, 
    get_user_applications, 
    update_application_status, 
    delete_user_application
)

logger = logging.getLogger("campusmate.routes.applications")
router = APIRouter(prefix="/api/applications", tags=["Application Tracker Service"])

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    app_in: ApplicationCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Submits a new job application with dual ML + RAG vector match score computation."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    try:
        app_doc = await apply_for_job(
            user_id=user_id,
            user=current_user,
            job_id=app_in.job_id,
            notes=app_in.notes
        )
        return ApplicationResponse(**app_doc)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except Exception as err:
        logger.error(f"Error submitting application: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting application: {str(err)}"
        )

@router.get("/me", response_model=List[ApplicationResponse], status_code=status.HTTP_200_OK)
async def get_my_applications(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves all job applications submitted by the authenticated user."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    apps = await get_user_applications(user_id)
    return [ApplicationResponse(**a) for a in apps]

@router.patch("/{app_id}/status", response_model=ApplicationResponse, status_code=status.HTTP_200_OK)
async def update_status(
    app_id: str,
    status_in: ApplicationStatusUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Updates status of a submitted application (e.g. Applied -> Interviewing)."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    updated = await update_application_status(app_id, user_id, status_in.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application document not found or access denied."
        )
    return ApplicationResponse(**updated)

@router.delete("/{app_id}", status_code=status.HTTP_200_OK)
async def withdraw_application(
    app_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Withdraws/deletes a submitted application."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    success = await delete_user_application(app_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application document not found or access denied."
        )
    return {"status": "success", "message": "Application withdrawn successfully."}
