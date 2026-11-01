from fastapi import APIRouter
from ....core.config import settings
from ....schemas.contracts import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Production health-check endpoint reporting service, DB, and AI provider status."""
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        video_generation={
            "enabled": settings.FEATURE_VIDEO_GENERATION,
            "status": "strictly_disabled",
            "policy": "Server-enforced restriction per Section 7"
        },
        database={
            "engine": "PostgreSQL / Supabase",
            "status": "configured" if settings.DATABASE_URL else "unconfigured"
        },
        ai_providers={
            "gemini": bool(settings.GEMINI_API_KEY),
            "openai": bool(settings.OPENAI_API_KEY),
            "groq": bool(settings.GROQ_API_KEY),
            "ollama_local": bool(settings.OLLAMA_URL)
        }
    )
