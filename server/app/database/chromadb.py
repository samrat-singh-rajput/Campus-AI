import os
import logging
from typing import Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config.settings import settings

logger = logging.getLogger("campusmate.database.chromadb")

class ChromaDBManager:
    client: Optional[chromadb.PersistentClient] = None
    collection = None
    is_initialized: bool = False
    status: str = "Uninitialized"

chroma_instance = ChromaDBManager()

def init_chromadb():
    """Initializes persistent ChromaDB vector database."""
    try:
        chroma_path = os.path.abspath(settings.CHROMA_PATH)
        os.makedirs(chroma_path, exist_ok=True)
        
        logger.info(f"Initializing persistent ChromaDB client at: {chroma_path}")
        
        chroma_instance.client = chromadb.PersistentClient(
            path=chroma_path,
            settings=ChromaSettings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Get or create primary vector collection for CampusMate career documents
        chroma_instance.collection = chroma_instance.client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"description": "CampusMate AI Vector Embeddings Storage"}
        )
        
        chroma_instance.is_initialized = True
        chroma_instance.status = f"Persistent ChromaDB ready at {chroma_path} (Collection: {settings.CHROMA_COLLECTION_NAME})"
        logger.info(f"ChromaDB persistent vector db initialized successfully. Collection count: {chroma_instance.collection.count()}")
    except Exception as e:
        chroma_instance.is_initialized = False
        chroma_instance.status = f"ChromaDB initialization error: {str(e)}"
        logger.error(f"Failed to initialize ChromaDB: {e}")

def get_chroma_collection():
    """Returns active ChromaDB collection."""
    if not chroma_instance.is_initialized:
        init_chromadb()
    return chroma_instance.collection

def get_chroma_client():
    """Returns active ChromaDB client."""
    if not chroma_instance.is_initialized:
        init_chromadb()
    return chroma_instance.client
