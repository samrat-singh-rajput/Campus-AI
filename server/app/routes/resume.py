import os
import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.schemas.resume import ResumeResponse
from app.routes.auth import get_current_user
from app.services.resume_parser import extract_text_from_pdf, parse_resume_content
from app.services.resume_service import save_parsed_resume, get_latest_user_resume, delete_user_resume

logger = logging.getLogger("campusmate.routes.resume")
router = APIRouter(prefix="/api/resume", tags=["Resume & ATS Service"])

# Upload directory configuration
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Uploads a PDF resume, parses technical skills & ATS compatibility score, and saves to MongoDB Atlas."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    
    # 1. Validate File Type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume files (.pdf) are currently supported."
        )

    # 2. Read Bytes & Validate Size
    pdf_bytes = await file.read()
    file_size = len(pdf_bytes)
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 5 MB."
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # 3. Save Upload File Locally
    safe_filename = f"{user_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    try:
        with open(file_path, "wb") as f:
            f.write(pdf_bytes)
    except Exception as e:
        logger.error(f"Failed to save resume file locally: {e}")

    # 4. Extract Text & Compute ATS Metrics
    try:
        raw_text = extract_text_from_pdf(pdf_bytes)
        if not raw_text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract text from PDF. Ensure the PDF contains selectable text rather than scanned images."
            )
        parsed_data = parse_resume_content(raw_text)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing resume PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error parsing resume PDF content: {str(e)}"
        )

    # 5. Persist Document in MongoDB Atlas
    resume_doc = await save_parsed_resume(
        user_id=user_id,
        filename=file.filename,
        file_size=file_size,
        parsed_data=parsed_data
    )

    # 6. Index Resume Embedding in ChromaDB Vector Store
    try:
        from app.services.rag_service import index_resume_vector
        index_resume_vector(
            user_id=user_id,
            resume_id=resume_doc.get("id", "res_latest"),
            raw_text=raw_text,
            extracted_skills=parsed_data.get("extracted_skills", []),
            ats_score=parsed_data.get("ats_analysis", {}).get("overall_score", 0)
        )
    except Exception as err:
        logger.warning(f"Failed to index resume vector in ChromaDB: {err}")

    return ResumeResponse(**resume_doc)

@router.get("/me", response_model=ResumeResponse, status_code=status.HTTP_200_OK)
async def get_my_resume(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves the latest parsed resume and ATS analysis for the authenticated user."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    resume = await get_latest_user_resume(user_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume uploaded yet for this account."
        )
    return ResumeResponse(**resume)

@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
async def delete_resume(
    resume_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Deletes a stored resume document."""
    user_id = str(current_user.get("id", current_user.get("_id")))
    success = await delete_user_resume(resume_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume document not found or access denied."
        )
    return {"status": "success", "message": "Resume deleted successfully."}
