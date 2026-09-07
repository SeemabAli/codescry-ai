import json
import logging
import re
from typing import Optional

from google import genai
from google.genai import types
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.structured_review import (
    CodeReviewRequest,
    CodeReviewStructuredResponse,
    IssueDetail,
    SeverityLevel,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are CodeScry AI, an elite Staff Software Engineer and Automated Code Reviewer.
Your task is to perform an exhaustive, rigorous, and constructive code review.

Evaluation Dimensions:
1. Bugs & Edge Cases: Unhandled promises, null references, off-by-one errors, mutation bugs, missing return paths.
2. Security: Injection vulnerabilities (SQL/NoSQL/Command), XSS, CSRF, insecure deserialization, sensitive data leakage, improper authorization.
3. Performance: Algorithmic complexity (O(n^2)), blocking event loop operations, N+1 queries, unmemoized components, memory leaks.
4. Clean Architecture & Best Practices: DRY, SOLID principles, type safety, modularity, error boundary/propagation patterns.
5. Code Health & Standards: WCAG accessibility, descriptive naming, proper modern idioms.

Requirements:
- code_score: Float between 0.0 and 100.0 reflecting code quality.
- detected_issues: A list of structured IssueDetail objects. Line numbers must be accurate; set to null if the issue spans the whole file.
- severity_level: The single overall highest severity level ('low', 'medium', 'high', 'critical'). If issues contain critical, use 'critical'. If no issues, use 'low'.
- improved_code: A complete, fully functional, refactored version of the submitted code that addresses all detected issues. Do not output placeholders or omissions.
- learning_recommendations: Bullet-point takeaways and best-practice principles for developer learning.
- summary: A concise executive summary of the review findings.

You MUST conform strictly to the specified JSON response schema.
"""


def _extract_json(text: str) -> dict:
    """Safely extracts JSON even if enclosed in markdown backticks."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()
    return json.loads(text)


def _build_prompt(payload: CodeReviewRequest, retry_context: Optional[str] = None) -> str:
    prompt = f"""Review the following code file:
File: {payload.file_name}
Language/Type: {payload.code_type}
Mode: {payload.review_mode}

```
{payload.code}
```
"""
    if retry_context:
        prompt += f"""
IMPORTANT: The previous output failed schema validation with:
{retry_context}
Please strictly correct the output and satisfy all Pydantic v2 schema constraints.
"""
    return prompt


def _rule_based_fallback(payload: CodeReviewRequest) -> CodeReviewStructuredResponse:
    """Deterministic fallback for local testing or when GEMINI_API_KEY is not configured."""
    code = payload.code
    issues: list[IssueDetail] = []

    if "eval(" in code or "exec(" in code:
        issues.append(
            IssueDetail(
                title="Use of dangerous execution function (eval/exec)",
                category="Security",
                severity_level=SeverityLevel.CRITICAL,
                line_number=None,
                explanation="Executing raw strings as code can lead to Arbitrary Code Execution.",
                recommendation="Replace eval with structured parsing or a secure interpreter.",
                code_example="// Avoid eval; use JSON.parse or strict AST mapping.",
            )
        )

    if "req.body" in code and "validate" not in code.lower() and "zod" not in code.lower():
        issues.append(
            IssueDetail(
                title="Unvalidated Request Body Access",
                category="Security",
                severity_level=SeverityLevel.HIGH,
                line_number=None,
                explanation="Directly consuming req.body without schema validation invites malicious payloads.",
                recommendation="Validate incoming payloads using Zod, Joi, or Pydantic before processing.",
                code_example="const validated = UserSchema.parse(req.body);",
            )
        )

    if "catch" not in code and "async" in code:
        issues.append(
            IssueDetail(
                title="Missing Error Handling in Async Flow",
                category="Bug",
                severity_level=SeverityLevel.MEDIUM,
                line_number=None,
                explanation="Unhandled promise rejections can cause process termination or hanging requests.",
                recommendation="Wrap asynchronous operations in try/catch blocks or use an async boundary.",
                code_example="try { await action(); } catch (err) { next(err); }",
            )
        )

    highest_severity = SeverityLevel.LOW
    for issue in issues:
        if issue.severity_level == SeverityLevel.CRITICAL:
            highest_severity = SeverityLevel.CRITICAL
            break
        elif issue.severity_level == SeverityLevel.HIGH:
            highest_severity = SeverityLevel.HIGH
        elif issue.severity_level == SeverityLevel.MEDIUM and highest_severity != SeverityLevel.HIGH:
            highest_severity = SeverityLevel.MEDIUM

    deduction = len(issues) * 15.0
    score = max(30.0, 95.0 - deduction)

    return CodeReviewStructuredResponse(
        code_score=round(score, 1),
        detected_issues=issues,
        severity_level=highest_severity,
        improved_code=payload.code,
        learning_recommendations=[
            "Always validate external boundary inputs with schemas.",
            "Guard asynchronous logic with centralized error middleware.",
            "Write comprehensive unit tests covering edge cases.",
        ],
        summary=f"Automated review completed for {payload.file_name}. Detected {len(issues)} issue(s).",
        ai_provider="rule-based-engine",
    )


def analyze_code_structured(payload: CodeReviewRequest) -> CodeReviewStructuredResponse:
    """
    Executes code analysis with Gemini API enforcing the strict Pydantic response schema.
    Implements automatic one-time retry on schema validation failure.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not configured. Falling back to deterministic rule engine.")
        return _rule_based_fallback(payload)

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    model_name = settings.GEMINI_MODEL or "gemini-2.5-pro"

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        response_mime_type="application/json",
        response_schema=CodeReviewStructuredResponse,
        temperature=0.2,
    )

    last_error: Optional[Exception] = None

    # Try up to 2 times (initial attempt + 1 retry on validation failure)
    for attempt in range(2):
        retry_msg = str(last_error) if attempt > 0 else None
        prompt = _build_prompt(payload, retry_context=retry_msg)

        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config,
            )

            raw_text = response.text or ""
            if not raw_text.strip():
                raise ValueError("Gemini returned an empty response text.")

            # Validate against Pydantic schema
            try:
                structured_review = CodeReviewStructuredResponse.model_validate_json(raw_text)
            except (ValidationError, ValueError):
                parsed = _extract_json(raw_text)
                structured_review = CodeReviewStructuredResponse.model_validate(parsed)

            structured_review.ai_provider = f"gemini:{model_name}"
            if not structured_review.improved_code.strip():
                structured_review.improved_code = payload.code

            return structured_review

        except (ValidationError, json.JSONDecodeError, ValueError) as val_err:
            logger.warning(
                f"Structured validation attempt {attempt + 1} failed: {val_err}. Retrying once..."
            )
            last_error = val_err
            if attempt == 1:
                logger.error(f"Validation failed after retry: {val_err}")
                raise RuntimeError(
                    f"Gemini output failed schema validation after retry: {str(val_err)}"
                ) from val_err
        except Exception as api_err:
            logger.error(f"Gemini API request error: {api_err}", exc_info=True)
            raise RuntimeError(f"Gemini API review call failed: {str(api_err)}") from api_err

    raise RuntimeError(f"Code review failed: {last_error}")
