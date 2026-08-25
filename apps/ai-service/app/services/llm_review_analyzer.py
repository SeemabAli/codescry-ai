import json
import logging
import re
from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.review import AnalyzeReviewRequest, AnalyzeReviewResponse

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are CodeScry AI, an expert senior MERN stack code reviewer, security auditor, and mentor.

Your job is to perform an in-depth, structured code review of JavaScript, TypeScript, React, Node.js, Express, and MongoDB code.

You must provide practical, specific, and actionable feedback tailored to modern web development standards.

Evaluation Criteria:
1. Bugs and logic errors (unhandled promises, race conditions, mutation bugs, missing returns)
2. Security vulnerabilities (injection, unsanitized inputs, missing auth/cors/helmet, sensitive data leaks, insecure headers)
3. Performance problems (unnecessary re-renders, N+1 database queries, unindexed queries, blocking event loop)
4. Maintainability & Clean Code (modularity, readability, DRY, naming conventions, type safety)
5. Modern Best Practices (proper React hooks usage, Zod schema validation, async/await patterns, Express error handling)
6. Accessibility (WCAG standards for React components, ARIA attributes, semantic HTML)

Review Rules:
- Score: Accurate numeric score from 0 (terrible/broken) to 100 (production-ready).
- Do not give generic or vague advice. Quote specific variable names or functions.
- If a line number is uncertain, use null.
- Preserve the original intent and core business logic of the code.
- improvedCode: Must provide a clean, complete, fully working refactored version of the submitted code.
- Explain issues clearly and educationally like a senior staff engineer mentoring a colleague.
- Output MUST strictly conform to the requested JSON schema.
"""


def build_review_prompt(payload: AnalyzeReviewRequest) -> str:
    mode_instructions = {
        "quick-review": "Prioritize the top most critical issues and fast actionable wins.",
        "deep-review": "Perform an exhaustive, thorough review covering all aspects: bugs, architecture, security, performance, and style.",
        "security-focused": "Focus primarily on OWASP Top 10, sanitization, authentication, authorization, and data exposure vulnerabilities.",
        "performance-focused": "Focus heavily on execution speed, rendering efficiency, memory usage, and database query optimization.",
        "learning-mode": "Provide detailed educational explanations, explain WHY each issue is a problem, and how to think about better patterns.",
    }

    instruction = mode_instructions.get(payload.reviewMode, "Perform a comprehensive review.")

    return f"""
Please review the following code submission:

Target File: {payload.fileName}
Code Type: {payload.codeType}
Review Mode: {payload.reviewMode}

Review Mode Focus:
{instruction}

Submitted Code:
```{payload.codeType}
{payload.code}
```

Please evaluate the code and return structured JSON matching the schema:
- score: integer (0-100)
- summary: concise executive summary of the review
- issues: array of issues with title, category, severity, lineNumber, explanation, recommendation, codeExample
- improvedCode: the complete refactored and improved code
- learningNotes: key takeaways for the developer
- recommendedTopics: specific search terms/topics to study next
"""


def _extract_json_from_text(text: str) -> dict:
    """Extract and parse JSON from a response string, even if enclosed in markdown backticks."""
    text = text.strip()
    # Remove markdown code block fences if present
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()
    return json.loads(text)


def analyze_with_gemini(payload: AnalyzeReviewRequest) -> AnalyzeReviewResponse:
    if not settings.GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY is missing. Please set GEMINI_API_KEY in apps/ai-service/.env "
            "(Get a free API key from https://aistudio.google.com/app/apikey)"
        )

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=build_review_prompt(payload),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=AnalyzeReviewResponse,
                temperature=0.2,
            ),
        )

        response_text = response.text
        if not response_text:
            raise ValueError("Gemini API returned an empty response.")

        # Parse and validate with Pydantic
        try:
            review = AnalyzeReviewResponse.model_validate_json(response_text)
        except Exception:
            parsed_data = _extract_json_from_text(response_text)
            review = AnalyzeReviewResponse.model_validate(parsed_data)

        review.aiProvider = f"gemini:{settings.GEMINI_MODEL}"

        if not review.improvedCode.strip():
            review.improvedCode = payload.code

        return review

    except Exception as err:
        logger.error(f"Gemini analysis error: {err}", exc_info=True)
        raise RuntimeError(f"Gemini AI review failed: {str(err)}") from err


def analyze_with_openai(payload: AnalyzeReviewRequest) -> AnalyzeReviewResponse:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is missing in AI service environment.")

    try:
        from langchain_core.messages import HumanMessage, SystemMessage
        from langchain_openai import ChatOpenAI

        llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            temperature=0.1,
            api_key=settings.OPENAI_API_KEY,
        )

        structured_llm = llm.with_structured_output(AnalyzeReviewResponse)
        result = structured_llm.invoke(
            [
                SystemMessage(content=SYSTEM_PROMPT),
                HumanMessage(content=build_review_prompt(payload)),
            ]
        )

        if isinstance(result, AnalyzeReviewResponse):
            review = result
        else:
            review = AnalyzeReviewResponse.model_validate(result)

        review.aiProvider = f"openai:{settings.OPENAI_MODEL}"

        if not review.improvedCode.strip():
            review.improvedCode = payload.code

        return review
    except Exception as err:
        logger.error(f"OpenAI analysis error: {err}", exc_info=True)
        raise RuntimeError(f"OpenAI review failed: {str(err)}") from err


def analyze_code_review_with_llm(
    payload: AnalyzeReviewRequest,
) -> AnalyzeReviewResponse:
    # Prioritize Gemini
    if settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        return analyze_with_openai(payload)

    if settings.GEMINI_API_KEY:
        return analyze_with_gemini(payload)

    if settings.OPENAI_API_KEY:
        return analyze_with_openai(payload)

    raise ValueError(
        "No AI API key found. Please set GEMINI_API_KEY in apps/ai-service/.env "
        "(Get a free API key at https://aistudio.google.com/app/apikey)"
    )