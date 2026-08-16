import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.insights import CareerInsightsResponse, ProfileUpdateRequest
from app.routes.auth import get_current_user
from app.services.insights_service import generate_career_insights, update_user_profile

logger = logging.getLogger("campusmate.routes.insights")
router = APIRouter(prefix="/api", tags=["Career Analytics & Settings"])

@router.get("/insights/me", response_model=CareerInsightsResponse, status_code=status.HTTP_200_OK)
async def get_my_insights(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Computes overall Career Readiness Score (0-100%) and aggregates real placement analytics."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    try:
        insights = await generate_career_insights(user_id, current_user)
        return CareerInsightsResponse(**insights)
    except Exception as err:
        logger.error(f"Error generating insights: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating insights: {str(err)}"
        )

@router.put("/settings/profile", status_code=status.HTTP_200_OK)
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Updates student profile fields (name, college, degree, graduationYear, skills) in MongoDB Atlas."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    updates = req.model_dump(exclude_unset=True)
    updated_doc = await update_user_profile(user_id, updates)
    return {"status": "success", "profile": updated_doc}
