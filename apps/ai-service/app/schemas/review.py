from typing import Literal, Optional
from pydantic import BaseModel, Field


CodeType = Literal[
    "react-component",
    "express-route",
    "express-controller",
    "mongoose-model",
    "javascript-utility",
]

ReviewMode = Literal[
    "quick-review",
    "deep-review",
    "security-focused",
    "performance-focused",
    "learning-mode",
]

Severity = Literal["Critical", "High", "Medium", "Low", "Suggestion"]

IssueCategory = Literal[
    "Bug",
    "Security",
    "Performance",
    "Best Practice",
    "Maintainability",
    "Accessibility",
]


class AnalyzeReviewRequest(BaseModel):
    fileName: str = Field(..., min_length=1, max_length=120)
    codeType: CodeType
    reviewMode: ReviewMode
    code: str = Field(..., min_length=10, max_length=50000)


class ReviewIssue(BaseModel):
    title: str = Field(..., description="Short title for the issue.")
    category: IssueCategory = Field(..., description="Main category of the issue.")
    severity: Severity = Field(..., description="Severity level of the issue.")
    lineNumber: Optional[int] = Field(
        default=None,
        description="Line number if confidently known, otherwise null.",
    )
    explanation: str = Field(
        ...,
        description="Clear explanation of why this is a problem.",
    )
    recommendation: str = Field(
        ...,
        description="Specific recommendation to fix the issue.",
    )
    codeExample: str = Field(
        default="",
        description="Optional small code example showing the fix.",
    )


class AnalyzeReviewResponse(BaseModel):
    score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall code quality score from 0 to 100.",
    )
    summary: str = Field(
        ...,
        description="High-level summary of the code review.",
    )
    issues: list[ReviewIssue] = Field(
        ...,
        description="List of detected issues.",
    )
    improvedCode: str = Field(
        ...,
        description="Improved/refactored version of the submitted code.",
    )
    learningNotes: list[str] = Field(
        ...,
        description="Important learning points for the developer.",
    )
    recommendedTopics: list[str] = Field(
        ...,
        description="Topics the developer should study next.",
    )
    aiProvider: str = Field(
        default="gemini",
        description="AI provider/model used for the review.",
    )