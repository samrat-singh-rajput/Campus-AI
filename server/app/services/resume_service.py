import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from bson import ObjectId
from app.database.mongodb import get_database

logger = logging.getLogger("campusmate.services.resume_service")

def _format_resume_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Formats MongoDB document _id to string id."""
    if not doc:
        return {}
    formatted = dict(doc)
    if "_id" in formatted:
        formatted["id"] = str(formatted.pop("_id"))
    return formatted

async def save_parsed_resume(
    user_id: str,
    filename: str,
    file_size: int,
    parsed_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Saves parsed resume document to MongoDB Atlas and updates user's skill vector."""
    db = get_database()
    if db is None:
        logger.warning("MongoDB database unavailable, returning memory resume object.")
        return {
            "id": f"mem_{int(datetime.now().timestamp())}",
            "user_id": user_id,
            "filename": filename,
            "file_size_bytes": file_size,
            "created_at": datetime.now(timezone.utc),
            "parsed_data": parsed_data
        }

    doc = {
        "user_id": user_id,
        "filename": filename,
        "file_size_bytes": file_size,
        "created_at": datetime.now(timezone.utc),
        "parsed_data": parsed_data
    }

    result = await db.resumes.insert_one(doc)
    doc["_id"] = result.inserted_id
    logger.info(f"Resume document saved to MongoDB Atlas for user {user_id} (ID: {result.inserted_id})")

    # Update user's primary skills array in users collection with newly parsed skills
    extracted_skills = parsed_data.get("extracted_skills", [])
    if extracted_skills:
        try:
            user_obj_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
            await db.users.update_one(
                {"$or": [{"_id": user_obj_id}, {"id": user_id}]},
                {"$addToSet": {"skills": {"$each": extracted_skills}}}
            )
            logger.info(f"Updated user skills in MongoDB Atlas for user {user_id}: {extracted_skills}")
        except Exception as e:
            logger.warning(f"Could not update user skills in MongoDB: {e}")

    return _format_resume_doc(doc)

async def get_latest_user_resume(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves the latest parsed resume document for the authenticated user."""
    db = get_database()
    if db is None:
        return None

    doc = await db.resumes.find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    )
    if not doc:
        return None
    return _format_resume_doc(doc)

async def delete_user_resume(resume_id: str, user_id: str) -> bool:
    """Deletes a stored resume document by ID."""
    db = get_database()
    if db is None:
        return False

    obj_id = ObjectId(resume_id) if ObjectId.is_valid(resume_id) else resume_id
    result = await db.resumes.delete_one({"_id": obj_id, "user_id": user_id})
    return result.deleted_count > 0
