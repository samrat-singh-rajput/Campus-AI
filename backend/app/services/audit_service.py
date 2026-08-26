import math
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from bson import ObjectId
from app.database.mongodb import get_database_async, get_database

logger = logging.getLogger("campusmate.services.audit_service")

# Sensitive Keys to Sanitize Automatically
SENSITIVE_KEYS = {
    "password", "passwordhash", "pass_hash", "jwt_secret", "mongodb_uri", 
    "openai_api_key", "llm_api_key", "secret", "access_token", "authorization", 
    "token", "bearer", "api_key"
}

def sanitize_metadata(data: Any) -> Any:
    """Recursively strips sensitive credential keys from metadata objects."""
    if isinstance(data, dict):
        clean_dict = {}
        for k, v in data.items():
            if str(k).lower() in SENSITIVE_KEYS:
                clean_dict[k] = "[REDACTED_SECRET]"
            else:
                clean_dict[k] = sanitize_metadata(v)
        return clean_dict
    elif isinstance(data, list):
        return [sanitize_metadata(item) for item in data]
    return data

async def log_audit_event(
    admin_id: str,
    admin_username: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    description: Optional[str] = None,
    target_name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = "127.0.0.1"
) -> Dict[str, Any]:
    """Records a safe administrative action into MongoDB Atlas 'audit_logs' collection."""
    db = await get_database_async()
    if db is None:
        db = get_database()

    clean_meta = sanitize_metadata(metadata or {})

    audit_doc = {
        "admin_id": str(admin_id),
        "admin_username": str(admin_username),
        "action": str(action).upper(),
        "resource_type": str(resource_type).lower(),
        "resource_id": str(resource_id) if resource_id else None,
        "description": str(description) if description else f"Admin performed {action}",
        "target_name": str(target_name) if target_name else None,
        "metadata": clean_meta,
        "ip_address": ip_address,
        "created_at": datetime.now(timezone.utc)
    }

    try:
        if db is not None:
            res = await db.audit_logs.insert_one(audit_doc)
            audit_doc["_id"] = res.inserted_id
            logger.info(f"Audit Log recorded: [{action}] by admin '{admin_username}' on {resource_type}:{resource_id}")
    except Exception as e:
        logger.error(f"Failed to record audit log event: {e}")

    return audit_doc

def parse_time_range_cutoff(time_range: Optional[str]) -> Optional[datetime]:
    """Computes cutoff datetime based on time range filter string."""
    if not time_range:
        return None
    tr = time_range.strip().lower()
    now = datetime.now(timezone.utc)
    if tr == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif tr == "7d":
        return now - timedelta(days=7)
    elif tr == "30d":
        return now - timedelta(days=30)
    elif tr == "90d":
        return now - timedelta(days=90)
    return None

async def get_audit_logs_list(
    q: Optional[str] = None,
    action_filter: Optional[str] = None,
    resource_type_filter: Optional[str] = None,
    admin_filter: Optional[str] = None,
    time_range: Optional[str] = "all",
    page: int = 1,
    limit: int = 10,
    sort_by: Optional[str] = "newest"
) -> Dict[str, Any]:
    """Retrieves paginated, searchable, and filtered audit log events from MongoDB Atlas."""
    db = await get_database_async()
    if db is None:
        return {
            "total_logs": 0,
            "page": page,
            "limit": limit,
            "total_pages": 1,
            "logs": []
        }

    cutoff = parse_time_range_cutoff(time_range)
    query: Dict[str, Any] = {}

    if cutoff:
        query["created_at"] = {"$gte": cutoff}

    if action_filter and action_filter.lower() != "all":
        query["action"] = action_filter.strip().upper()

    if resource_type_filter and resource_type_filter.lower() != "all":
        query["resource_type"] = resource_type_filter.strip().lower()

    if admin_filter and admin_filter.lower() != "all":
        query["admin_username"] = admin_filter.strip()

    if q and q.strip():
        q_str = q.strip()
        query["$or"] = [
            {"admin_username": {"$regex": q_str, "$options": "i"}},
            {"action": {"$regex": q_str, "$options": "i"}},
            {"resource_type": {"$regex": q_str, "$options": "i"}},
            {"target_name": {"$regex": q_str, "$options": "i"}},
            {"description": {"$regex": q_str, "$options": "i"}}
        ]

    total_logs = await db.audit_logs.count_documents(query)

    sort_order = -1 if (sort_by or "newest").lower() == "newest" else 1
    cursor = db.audit_logs.find(query).sort("created_at", sort_order).skip((page - 1) * limit).limit(limit)
    docs = await cursor.to_list(length=limit)

    formatted_logs = []
    for d in docs:
        lid = str(d.get("_id"))
        formatted_logs.append({
            "id": lid,
            "admin_id": str(d.get("admin_id", "")),
            "admin_username": str(d.get("admin_username", "admin")),
            "action": str(d.get("action", "ADMIN_ACTION")),
            "resource_type": str(d.get("resource_type", "system")),
            "resource_id": d.get("resource_id"),
            "description": str(d.get("description", "")),
            "target_name": d.get("target_name"),
            "metadata": sanitize_metadata(d.get("metadata", {})),
            "ip_address": d.get("ip_address", "127.0.0.1"),
            "created_at": d.get("created_at")
        })

    total_pages = max(1, math.ceil(total_logs / limit))

    return {
        "total_logs": total_logs,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "logs": formatted_logs
    }

async def get_audit_log_detail(log_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves full safe audit log record by ID."""
    db = await get_database_async()
    if db is None:
        return None

    obj_id = ObjectId(log_id) if ObjectId.is_valid(log_id) else log_id
    doc = await db.audit_logs.find_one({"$or": [{"_id": obj_id}, {"id": log_id}]})
    if not doc:
        return None

    return {
        "id": str(doc.get("_id")),
        "admin_id": str(doc.get("admin_id", "")),
        "admin_username": str(doc.get("admin_username", "admin")),
        "action": str(doc.get("action", "ADMIN_ACTION")),
        "resource_type": str(doc.get("resource_type", "system")),
        "resource_id": doc.get("resource_id"),
        "description": str(doc.get("description", "")),
        "target_name": doc.get("target_name"),
        "metadata": sanitize_metadata(doc.get("metadata", {})),
        "ip_address": doc.get("ip_address", "127.0.0.1"),
        "created_at": doc.get("created_at")
    }

async def get_audit_analytics() -> Dict[str, Any]:
    """Computes real aggregated metrics from MongoDB 'audit_logs' collection."""
    db = await get_database_async()
    if db is None:
        return {
            "total_audit_events": 0,
            "events_today": 0,
            "events_this_week": 0,
            "most_common_action": "None",
            "most_active_admin": "None",
            "category_counts": {},
            "recent_activity": []
        }

    now = datetime.now(timezone.utc)
    today_cutoff = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_cutoff = now - timedelta(days=7)

    total_events = await db.audit_logs.count_documents({})
    events_today = await db.audit_logs.count_documents({"created_at": {"$gte": today_cutoff}})
    events_this_week = await db.audit_logs.count_documents({"created_at": {"$gte": week_cutoff}})

    # Action counts & admin counts
    all_cursor = db.audit_logs.find({})
    all_docs = await all_cursor.to_list(length=5000)

    action_counts: Dict[str, int] = {}
    admin_counts: Dict[str, int] = {}
    category_counts: Dict[str, int] = {}

    for d in all_docs:
        act = str(d.get("action", "UNKNOWN"))
        action_counts[act] = action_counts.get(act, 0) + 1

        adm = str(d.get("admin_username", "admin"))
        admin_counts[adm] = admin_counts.get(adm, 0) + 1

        res_cat = str(d.get("resource_type", "system")).capitalize()
        category_counts[res_cat] = category_counts.get(res_cat, 0) + 1

    most_common_action = max(action_counts.items(), key=lambda x: x[1])[0] if action_counts else "None"
    most_active_admin = max(admin_counts.items(), key=lambda x: x[1])[0] if admin_counts else "None"

    # Recent 10 timeline activity items
    recent_cursor = db.audit_logs.find({}).sort("created_at", -1).limit(10)
    recent_docs = await recent_cursor.to_list(length=10)

    recent_activity = [
        {
            "id": str(d.get("_id")),
            "admin_username": str(d.get("admin_username", "admin")),
            "action": str(d.get("action", "ADMIN_ACTION")),
            "description": str(d.get("description", "")),
            "target_name": d.get("target_name"),
            "created_at": d.get("created_at")
        }
        for d in recent_docs
    ]

    return {
        "total_audit_events": total_events,
        "events_today": events_today,
        "events_this_week": events_this_week,
        "most_common_action": most_common_action,
        "most_active_admin": most_active_admin,
        "category_counts": category_counts,
        "recent_activity": recent_activity
    }
