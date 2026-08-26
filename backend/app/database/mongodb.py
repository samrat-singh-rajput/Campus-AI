import asyncio
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

logger = logging.getLogger("campusmate.database.mongodb")

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db = None
    is_connected: bool = False
    connection_status: str = "Disconnected"
    _loop = None

db_instance = MongoDB()

async def connect_to_mongo():
    """Initializes MongoDB Atlas connection via Motor async driver attached to current event loop."""
    try:
        current_loop = asyncio.get_running_loop()
        uri = settings.MONGODB_URI
        
        # If client exists on a different event loop, re-initialize client for current event loop
        if db_instance.client is not None and getattr(db_instance, "_loop", None) != current_loop:
            try:
                db_instance.client.close()
            except Exception:
                pass
            db_instance.client = None
            db_instance.db = None
            db_instance.is_connected = False

        if db_instance.client is None or not db_instance.is_connected:
            logger.info(f"Connecting to MongoDB at: {uri.split('@')[-1] if '@' in uri else uri}")
            db_instance.client = AsyncIOMotorClient(
                uri,
                serverSelectionTimeoutMS=4000,
                connectTimeoutMS=4000
            )
            db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
            db_instance._loop = current_loop
            
            # Test connection ping
            await db_instance.client.admin.command('ping')
            db_instance.is_connected = True
            if "mongodb.net" in uri or "+srv" in uri:
                db_instance.connection_status = "Connected to MongoDB Atlas"
            else:
                db_instance.connection_status = "Connected to Local MongoDB"
            logger.info(f"Successfully connected to MongoDB! ({db_instance.connection_status})")
    except Exception as e:
        db_instance.is_connected = False
        db_instance.connection_status = f"MongoDB connection failed ({str(e)})"
        logger.warning(f"MongoDB connection warning: {e}. App will start with fallback capabilities.")

async def close_mongo_connection():
    """Closes MongoDB connection."""
    if db_instance.client:
        db_instance.client.close()
        db_instance.client = None
        db_instance.db = None
        db_instance.is_connected = False
        db_instance.connection_status = "Disconnected"
        logger.info("MongoDB connection closed.")

def get_database():
    """Returns current active MongoDB database instance."""
    return db_instance.db

async def get_database_async():
    """Returns active database instance, re-connecting if event loop changed."""
    try:
        current_loop = asyncio.get_running_loop()
        if not db_instance.is_connected or getattr(db_instance, "_loop", None) != current_loop:
            await connect_to_mongo()
    except Exception:
        pass
    return db_instance.db if db_instance.is_connected else None
