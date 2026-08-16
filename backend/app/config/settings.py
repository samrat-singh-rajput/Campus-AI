import os
from typing import List, Union
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "CampusMate AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # MongoDB Atlas
    MONGODB_URI: str = "mongodb://localhost:27017/campusmate_db"
    MONGODB_DB_NAME: str = "campusmate_db"
    
    # ChromaDB Vector Store
    CHROMA_PATH: str = "./chroma_data"
    CHROMA_COLLECTION_NAME: str = "campusmate_docs"
    
    # JWT
    JWT_SECRET: str = "campusmate_ai_secure_jwt_secret_key_2026_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # LLM
    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
