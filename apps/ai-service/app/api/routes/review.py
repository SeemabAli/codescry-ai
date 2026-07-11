from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.schemas.review import AnalyzeReviewRequest, AnalyzeReviewResponse
from app.services.review_analyzer import analyze_code_review
from app.services.llm_review_analyzer import analyze_code_review_with_llm

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.post("/analyze", response_model=AnalyzeReviewResponse)
def analyze_review(payload: AnalyzeReviewRequest):
    try:
        if settings.AI_ANALYZER_MODE == "local":
            return analyze_code_review(payload)

        return analyze_code_review_with_llm(payload)

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))