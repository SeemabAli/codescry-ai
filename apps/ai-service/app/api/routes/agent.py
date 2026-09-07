import logging
from typing import Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.agents.agent_graph import (
    get_pr_review_state,
    resume_pr_review_run,
    start_pr_review_run,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agent", tags=["agent"])


class StartPRReviewRequest(BaseModel):
    owner: str = Field(..., min_length=1, max_length=100, description="GitHub repository owner/organization")
    repo: str = Field(..., min_length=1, max_length=100, description="GitHub repository name")
    pull_number: int = Field(..., ge=1, description="Pull request number")
    custom_diff: Optional[str] = Field(
        default=None,
        description="Optional custom diff override or simulated pull request content",
    )
    thread_id: Optional[str] = Field(
        default=None,
        description="Optional unique identifier for the LangGraph state thread",
    )


class ResumePRReviewRequest(BaseModel):
    decision: str = Field(
        ...,
        description="Human operator decision: 'approved', 'rejected', or 'revise'",
    )
    feedback: Optional[str] = Field(
        default="",
        description="Operator comments or revision instructions",
    )


class AgentPRReviewResponse(BaseModel):
    success: bool
    message: str
    thread_id: str
    status: str
    state: dict[str, Any]


@router.post("/review-pr", response_model=AgentPRReviewResponse)
def start_pr_review(payload: StartPRReviewRequest):
    """
    Kicks off an autonomous agent PR review.
    Runs RAG retrieval, Gemini deep evaluation, and pauses at the human-in-the-loop gate.
    """
    try:
        thread_id = payload.thread_id or f"pr_{payload.owner}_{payload.repo}_{payload.pull_number}"
        state = start_pr_review_run(
            owner=payload.owner,
            repo=payload.repo,
            pull_number=payload.pull_number,
            custom_diff=payload.custom_diff,
            thread_id=thread_id,
        )
        return AgentPRReviewResponse(
            success=True,
            message="PR review initiated and paused at human-in-the-loop checkpoint.",
            thread_id=thread_id,
            status=state.get("status", "pending_approval"),
            state=state,
        )
    except Exception as err:
        logger.error(f"Failed to start PR review: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to initiate PR review: {str(err)}")


@router.get("/review-pr/{thread_id}/state", response_model=AgentPRReviewResponse)
def get_pr_state(thread_id: str):
    """
    Retrieves the persisted state of a PR review thread from the LangGraph checkpointer.
    """
    try:
        state = get_pr_review_state(thread_id)
        if not state:
            raise HTTPException(
                status_code=404,
                detail=f"No active or persisted review session found for thread_id: '{thread_id}'",
            )
        return AgentPRReviewResponse(
            success=True,
            message="Review state retrieved successfully.",
            thread_id=thread_id,
            status=state.get("status", "pending_approval"),
            state=state,
        )
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Failed to retrieve PR state: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(err))


@router.post("/review-pr/{thread_id}/resume", response_model=AgentPRReviewResponse)
def resume_pr_review(thread_id: str, payload: ResumePRReviewRequest):
    """
    Submits a human operator decision ('approved', 'rejected', 'revise')
    and resumes execution from the LangGraph checkpoint to post reviews or cycle back.
    """
    try:
        valid_decisions = ["approved", "rejected", "revise"]
        decision_clean = payload.decision.lower().strip()
        if decision_clean not in valid_decisions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid decision '{payload.decision}'. Must be one of: {valid_decisions}",
            )

        updated_state = resume_pr_review_run(
            thread_id=thread_id,
            decision=decision_clean,
            feedback=payload.feedback,
        )
        return AgentPRReviewResponse(
            success=True,
            message=f"Review resumed with decision '{decision_clean}' and completed.",
            thread_id=thread_id,
            status=updated_state.get("status", "completed"),
            state=updated_state,
        )
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Failed to resume PR review: {err}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to resume PR review: {str(err)}")
