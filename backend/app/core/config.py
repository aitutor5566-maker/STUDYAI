import os
from typing import List
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "STUDYAI Central API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "https://studyai.com",
        "https://admin.studyai.com",
        "https://superadmin.studyai.com"
    ]
    
    # Security & JWT Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "studyai_production_jwt_super_secret_key_2026_change_in_prod")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    SUPERADMIN_MFA_REQUIRED: bool = True
    
    # Security Feature Flags (Strictly disabled across all roles and clients)
    FEATURE_VIDEO_GENERATION: bool = False
    
    # Database Configuration (PostgreSQL / Supabase)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://studyai_user:studyai_secure_pass_2026@localhost:5432/studyai_production")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "dummy_anon_key")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "dummy_service_role_key")
    
    # File Storage Security
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024 # 10 MB
    ALLOWED_UPLOAD_MIME_TYPES: List[str] = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/svg+xml",
        "text/markdown",
        "text/plain"
    ]
    
    # External AI Providers (Kept strictly on backend)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")


settings = Settings()
