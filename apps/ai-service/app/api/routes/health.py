from datetime import datetime, timezone
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "success": True,
        "message": f"{settings.AI_SERVICE_NAME} is running",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }