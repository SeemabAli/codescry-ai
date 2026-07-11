from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.schemas.review import AnalyzeReviewRequest, AnalyzeReviewResponse


SYSTEM_PROMPT = """
You are CodeScry AI, a senior MERN stack code reviewer and mentor.

Your job is to review JavaScript, TypeScript, React, Node.js, Express, and MongoDB code.

You must provide practical, specific, educational feedback.

Focus on:
- Bugs and logic errors
- Security vulnerabilities
- Performance problems
- Maintainability
- Best practices
- Accessibility for frontend React code
- MERN stack conventions
- Cleaner refactoring

Rules:
- Do not give generic advice.
- If a line number is uncertain, use null.
- Preserve the original intent of the code.
- Improved code should be complete enough to be useful.
- Explain issues like a senior developer teaching an intermediate developer.
- Do not wrap output in markdown.
- Return structured data matching the schema exactly.
"""


def build_review_prompt(payload: AnalyzeReviewRequest) -> str:
    return f"""
Review the following code.

File name:
{payload.fileName}

Code type:
{payload.codeType}

Review mode:
{payload.reviewMode}

Code:
{payload.code}

Return:
1. A score from 0 to 100
2. A concise summary
3. Specific issues with severity and category
4. Improved code
5. Learning notes
6. Recommended study topics

Review mode instructions:
- quick-review: prioritize the most important issues only.
- deep-review: give a complete review.
- security-focused: focus heavily on security vulnerabilities.
- performance-focused: focus heavily on performance and scalability.
- learning-mode: explain more clearly and educationally.
"""


def analyze_code_review_with_llm(
    payload: AnalyzeReviewRequest,
) -> AnalyzeReviewResponse:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is missing in AI service environment.")

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