from datetime import datetime, timezone
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health_check():
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_openai = bool(settings.OPENAI_API_KEY)

    active_provider = "local"
    if settings.AI_ANALYZER_MODE == "llm":
        if settings.AI_PROVIDER == "openai" and has_openai:
            active_provider = f"openai ({settings.OPENAI_MODEL})"
        elif has_gemini:
            active_provider = f"gemini ({settings.GEMINI_MODEL})"
        elif has_openai:
            active_provider = f"openai ({settings.OPENAI_MODEL})"
        else:
            active_provider = "missing_api_key"

    return {
        "success": True,
        "message": f"{settings.AI_SERVICE_NAME} is running",
        "environment": settings.ENVIRONMENT,
        "analyzerMode": settings.AI_ANALYZER_MODE,
        "aiProvider": active_provider,
        "geminiConfigured": has_gemini,
        "geminiModel": settings.GEMINI_MODEL,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }