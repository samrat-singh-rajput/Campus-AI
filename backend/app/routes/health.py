from fastapi import APIRouter, status
from app.config.settings import settings
from app.database.mongodb import db_instance
from app.database.chromadb import chroma_instance, get_chroma_collection

router = APIRouter(prefix="/api/health", tags=["Health & Status"])

@router.get("", status_code=status.HTTP_200_OK)
async def check_overall_health():
    """Returns overall server, MongoDB Atlas, and ChromaDB status."""
    chroma_count = 0
    if chroma_instance.is_initialized:
        try:
            col = get_chroma_collection()
            chroma_count = col.count() if col else 0
        except Exception:
            chroma_count = 0

    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": "development" if settings.DEBUG else "production",
        "database": {
            "mongodb_atlas": {
                "connected": db_instance.is_connected,
                "status": db_instance.connection_status,
                "database_name": settings.MONGODB_DB_NAME
            },
            "chromadb_vectorstore": {
                "initialized": chroma_instance.is_initialized,
                "status": chroma_instance.status,
                "path": settings.CHROMA_PATH,
                "collection_name": settings.CHROMA_COLLECTION_NAME,
                "total_documents": chroma_count
            }
        }
    }

@router.get("/db", status_code=status.HTTP_200_OK)
async def check_mongodb_health():
    """Specific endpoint to check MongoDB Atlas connectivity."""
    target_host = settings.MONGODB_URI.split("@")[-1] if "@" in settings.MONGODB_URI else "localhost"
    return {
        "mongodb_connected": db_instance.is_connected,
        "status": db_instance.connection_status,
        "database_name": settings.MONGODB_DB_NAME,
        "target_host": target_host,
        "uri_configured": bool(settings.MONGODB_URI)
    }

@router.get("/chroma", status_code=status.HTTP_200_OK)
async def check_chromadb_health():
    """Specific endpoint to check persistent ChromaDB status."""
    return {
        "chromadb_initialized": chroma_instance.is_initialized,
        "status": chroma_instance.status,
        "path": settings.CHROMA_PATH
    }
