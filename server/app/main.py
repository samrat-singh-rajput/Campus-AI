import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.chromadb import init_chromadb
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.resume import router as resume_router
from app.routes.rag import router as rag_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("campusmate.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    logger.info("🚀 Starting CampusMate AI Backend Server...")
    
    # 1. Initialize MongoDB Atlas connection
    await connect_to_mongo()
    
    # 2. Initialize Persistent ChromaDB Vector Store
    init_chromadb()
    
    logger.info("✅ CampusMate AI Foundation Ready!")
    yield
    
    # Clean shutdown
    logger.info("Shutting down CampusMate AI Backend Server...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="CampusMate AI — Production Full-Stack AI Career Platform Backend API",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local React dev server frontend connection
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(rag_router)

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "tagline": "Your AI Career Companion",
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
