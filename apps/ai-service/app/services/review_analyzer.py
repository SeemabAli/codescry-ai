from app.schemas.review import AnalyzeReviewRequest, AnalyzeReviewResponse, ReviewIssue


def analyze_code_review(payload: AnalyzeReviewRequest) -> AnalyzeReviewResponse:
    """
    Temporary local analyzer.

    This is used when AI_ANALYZER_MODE=local.
    It gives structured review output without calling OpenAI.
    """

    issues: list[ReviewIssue] = []
    code = payload.code

    if "req.body" in code:
        issues.append(
            ReviewIssue(
                title="Direct use of req.body",
                category="Security",
                severity="High",
                lineNumber=None,
                explanation="The code directly uses req.body. This can allow invalid or unexpected input to reach your database or business logic.",
                recommendation="Validate and sanitize request body data before using it. Use Zod, Joi, or express-validator.",
                codeExample='const schema = z.object({ email: z.string().email() });',
            )
        )

    if "try" not in code and "catch" not in code and "async" in code:
        issues.append(
            ReviewIssue(
                title="Missing async error handling",
                category="Bug",
                severity="Medium",
                lineNumber=None,
                explanation="Async route logic can throw errors. Without try/catch or an async error wrapper, errors may not be handled properly.",
                recommendation="Wrap async code in try/catch and pass errors to Express error middleware using next(error).",
                codeExample="try { ... } catch (error) { next(error); }",
            )
        )

    if "res.json(user)" in code or "res.send(user)" in code:
        issues.append(
            ReviewIssue(
                title="Returning full user object",
                category="Security",
                severity="Medium",
                lineNumber=None,
                explanation="Returning the full user object can accidentally expose sensitive fields like password hashes or internal metadata.",
                recommendation="Return only safe public fields such as id, name, and email.",
                codeExample="return res.status(201).json({ id: user._id, name: user.name, email: user.email });",
            )
        )

    if "useEffect" in code and "[]" not in code:
        issues.append(
            ReviewIssue(
                title="Check useEffect dependencies",
                category="Performance",
                severity="Suggestion",
                lineNumber=None,
                explanation="A useEffect without a clear dependency array may run more often than expected.",
                recommendation="Review the dependency array and include only the values that should trigger the effect.",
                codeExample="useEffect(() => { ... }, [dependency]);",
            )
        )

    if not issues:
        issues.append(
            ReviewIssue(
                title="No major issue detected by local analyzer",
                category="Best Practice",
                severity="Suggestion",
                lineNumber=None,
                explanation="The temporary local analyzer did not detect common beginner-level issues.",
                recommendation="Use the LLM analyzer for deeper review feedback.",
                codeExample="",
            )
        )

    base_score = 90

    penalty = (
        len(
            [
                issue
                for issue in issues
                if issue.severity in ["High", "Critical"]
            ]
        )
        * 12
    )

    penalty += (
        len(
            [
                issue
                for issue in issues
                if issue.severity == "Medium"
            ]
        )
        * 7
    )

    penalty += (
        len(
            [
                issue
                for issue in issues
                if issue.severity in ["Low", "Suggestion"]
            ]
        )
        * 3
    )

    score = max(40, base_score - penalty)

    improved_code = code

    if payload.codeType == "express-route" and "req.body" in code:
        improved_code = '''import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

app.post("/api/users", async (req, res, next) => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const user = await User.create(validatedData);

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
});'''

    return AnalyzeReviewResponse(
        score=score,
        summary=(
            f"CodeScry local analyzer reviewed {payload.fileName}. "
            f"It found {len(issues)} issue(s). This is the local rule-based analyzer."
        ),
        issues=issues,
        improvedCode=improved_code,
        learningNotes=[
            "Validate external input before using it in application logic.",
            "Use centralized error handling in Express applications.",
            "Avoid returning full database documents from API responses.",
        ],
        recommendedTopics=[
            "Express error middleware",
            "Zod validation",
            "API security basics",
            "MERN backend best practices",
        ],
        aiProvider="local-rule-analyzer",
    )