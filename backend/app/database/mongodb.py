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

db_instance = MongoDB()

async def connect_to_mongo():
    """Initializes MongoDB Atlas connection via Motor async driver."""
    try:
        uri = settings.MONGODB_URI
        logger.info(f"Connecting to MongoDB at: {uri.split('@')[-1] if '@' in uri else uri}")
        
        db_instance.client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=4000,
            connectTimeoutMS=4000
        )
        db_instance.db = db_instance.client[settings.MONGODB_DB_NAME]
        
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
        db_instance.is_connected = False
        db_instance.connection_status = "Disconnected"
        logger.info("MongoDB connection closed.")

def get_database():
    """Returns current active MongoDB database instance."""
    return db_instance.db
