from enum import Enum
from typing import Literal, Optional
from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


IssueCategory = Literal[
    "Bug",
    "Security",
    "Performance",
    "Best Practice",
    "Maintainability",
    "Accessibility",
    "Architecture",
]


class IssueDetail(BaseModel):
    title: str = Field(
        ...,
        description="Concise description of the detected issue",
    )
    category: IssueCategory = Field(
        ...,
        description="Category classification of the issue",
    )
    severity_level: SeverityLevel = Field(
        ...,
        description="Severity of the issue: low, medium, high, or critical",
    )
    line_number: Optional[int] = Field(
        default=None,
        description="1-based line number where the issue occurs, or null if general",
    )
    explanation: str = Field(
        ...,
        description="Thorough explanation of why this is problematic",
    )
    recommendation: str = Field(
        ...,
        description="Actionable guidance on how to resolve the issue",
    )
    code_example: Optional[str] = Field(
        default="",
        description="Code snippet showing how to implement the recommendation",
    )


class CodeReviewRequest(BaseModel):
    file_name: str = Field(
        default="code_snippet.ts",
        min_length=1,
        max_length=255,
        description="Name of the file being reviewed",
    )
    code_type: str = Field(
        default="typescript",
        description="Programming language or framework (e.g., react, node, typescript)",
    )
    review_mode: str = Field(
        default="deep-review",
        description="Review focus (e.g., deep-review, security-focused, performance-focused)",
    )
    code: str = Field(
        ...,
        min_length=5,
        max_length=100000,
        description="Source code content to review",
    )


class CodeReviewStructuredResponse(BaseModel):
    code_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Overall code quality score between 0.0 and 100.0",
    )
    detected_issues: list[IssueDetail] = Field(
        default_factory=list,
        description="Structured list of all detected issues, vulnerabilities, and defects",
    )
    severity_level: SeverityLevel = Field(
        ...,
        description="Highest severity level detected across all issues (low, medium, high, critical)",
    )
    improved_code: str = Field(
        ...,
        description="Complete refactored and improved production-ready version of the code",
    )
    learning_recommendations: list[str] = Field(
        default_factory=list,
        description="Key technical takeaways and topics for developer growth",
    )
    summary: str = Field(
        default="",
        description="Executive summary of the review results",
    )
    ai_provider: str = Field(
        default="gemini",
        description="Gemini model and provider used for this evaluation",
    )
