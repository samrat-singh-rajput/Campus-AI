import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from bson import ObjectId
from app.database.mongodb import db_instance
from app.schemas.user import UserRegister
from app.services.security import hash_password

logger = logging.getLogger("campusmate.user_service")

# Fallback in-memory store for development/testing if MongoDB Atlas is pending
_memory_users: Dict[str, Dict[str, Any]] = {}

def _format_user_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Formats MongoDB user document for Pydantic schema."""
    user_data = dict(doc)
    if "_id" in user_data:
        user_data["id"] = str(user_data["_id"])
        del user_data["_id"]
    if "passwordHash" in user_data:
        del user_data["passwordHash"]
    return user_data

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieves user by email address."""
    email_clean = email.strip().lower()
    
    if db_instance.is_connected and db_instance.db is not None:
        try:
            doc = await db_instance.db.users.find_one({"email": email_clean})
            if doc:
                return doc
        except Exception as e:
            logger.error(f"Error querying user by email in MongoDB: {e}")
            
    # Check fallback memory store
    for uid, user in _memory_users.items():
        if user.get("email") == email_clean:
            return user
            
    return None

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves user by ID."""
    if db_instance.is_connected and db_instance.db is not None:
        try:
            if ObjectId.is_valid(user_id):
                doc = await db_instance.db.users.find_one({"_id": ObjectId(user_id)})
                if doc:
                    return doc
        except Exception as e:
            logger.error(f"Error querying user by ID in MongoDB: {e}")
            
    # Check fallback memory store
    if user_id in _memory_users:
        return _memory_users[user_id]
        
    return None

async def create_user(user_in: UserRegister) -> Dict[str, Any]:
    """Creates a new user record in MongoDB Atlas."""
    email_clean = user_in.email.strip().lower()
    hashed_pwd = hash_password(user_in.password)
    now = datetime.now(timezone.utc)
    
    user_doc = {
        "name": user_in.name.strip(),
        "email": email_clean,
        "passwordHash": hashed_pwd,
        "college": user_in.college.strip() if user_in.college else None,
        "degree": user_in.degree.strip() if user_in.degree else None,
        "graduationYear": user_in.graduationYear,
        "skills": user_in.skills or [],
        "createdAt": now,
        "updatedAt": now
    }
    
    if db_instance.is_connected and db_instance.db is not None:
        try:
            result = await db_instance.db.users.insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            logger.info(f"User created in MongoDB Atlas: {email_clean} (ID: {result.inserted_id})")
            return user_doc
        except Exception as e:
            logger.error(f"Failed to insert user into MongoDB Atlas: {e}")
            
    # Fallback storage
    fake_id = str(ObjectId())
    user_doc["_id"] = fake_id
    _memory_users[fake_id] = user_doc
    logger.info(f"User stored in fallback storage: {email_clean} (ID: {fake_id})")
    return user_doc
