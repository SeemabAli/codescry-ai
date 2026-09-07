import logging
from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.schemas.review import AnalyzeReviewRequest, AnalyzeReviewResponse
from app.schemas.structured_review import (
    CodeReviewRequest,
    CodeReviewStructuredResponse,
)
from app.services.llm_review_analyzer import analyze_code_review_with_llm
from app.services.review_analyzer import analyze_code_review
from app.services.structured_analyzer import analyze_code_structured

logger = logging.getLogger(__name__)

router = APIRouter(tags=["reviews"])


@router.post("/api/review-code", response_model=CodeReviewStructuredResponse)
def review_code_structured(payload: CodeReviewRequest):
    """
    Task 1: Structured Code Review Endpoint.
    Enforces strict Pydantic v2 schema via Gemini response_schema with automatic retry.
    Returns code_score (float), detected_issues, severity_level, improved_code, learning_recommendations.
    """
    try:
        return analyze_code_structured(payload)
    except Exception as error:
        logger.error(f"Structured review failed: {error}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/api/reviews/analyze", response_model=AnalyzeReviewResponse)
def analyze_review(payload: AnalyzeReviewRequest):
    """
    Legacy review endpoint for backward compatibility with the Express API service.
    """
    try:
        if settings.AI_ANALYZER_MODE == "local":
            return analyze_code_review(payload)

        return analyze_code_review_with_llm(payload)

    except Exception as error:
        logger.error(f"Analysis error: {error}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(error))