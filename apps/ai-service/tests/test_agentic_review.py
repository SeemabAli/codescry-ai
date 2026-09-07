import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.structured_review import (
    CodeReviewRequest,
    CodeReviewStructuredResponse,
    IssueDetail,
    SeverityLevel,
)
from app.services.rag_service import rag_service
from app.services.structured_analyzer import analyze_code_structured
from app.agents.agent_graph import (
    start_pr_review_run,
    get_pr_review_state,
    resume_pr_review_run,
)


@pytest.fixture
def client():
    return TestClient(app)


def test_pydantic_schema_conformance():
    """Verify strict Pydantic v2 schema requirements from Task 1."""
    issue = IssueDetail(
        title="SQL Injection Vulnerability",
        category="Security",
        severity_level=SeverityLevel.CRITICAL,
        line_number=42,
        explanation="Raw concatenation allows injection.",
        recommendation="Use parameterized queries.",
        code_example="db.query('SELECT * FROM users WHERE id = $1', [id])",
    )
    assert issue.severity_level == SeverityLevel.CRITICAL

    response = CodeReviewStructuredResponse(
        code_score=85.5,
        detected_issues=[issue],
        severity_level=SeverityLevel.CRITICAL,
        improved_code="const safe = true;",
        learning_recommendations=["Always parameterize inputs."],
        summary="Found 1 critical issue.",
        ai_provider="gemini-2.5-pro",
    )
    assert response.code_score == 85.5
    assert len(response.detected_issues) == 1
    assert response.severity_level == SeverityLevel.CRITICAL
    assert isinstance(response.learning_recommendations, list)


def test_structured_analyzer_execution():
    """Verify structured analyzer produces valid schema output."""
    req = CodeReviewRequest(
        file_name="user.routes.js",
        code_type="express-route",
        review_mode="deep-review",
        code="""
        app.post("/login", async (req, res) => {
            const { user, pass } = req.body;
            eval("console.log(user)");
            res.json({ token: "abc" });
        });
        """,
    )
    result = analyze_code_structured(req)
    assert isinstance(result, CodeReviewStructuredResponse)
    assert result.code_score >= 0.0 and result.code_score <= 100.0
    assert len(result.detected_issues) > 0
    assert result.severity_level in [SeverityLevel.LOW, SeverityLevel.MEDIUM, SeverityLevel.HIGH, SeverityLevel.CRITICAL]
    assert len(result.improved_code) > 0


def test_rag_chunking_and_qdrant_retrieval():
    """Verify LangChain chunking and Qdrant best practice matching."""
    sample_diff = """
    + const user = await User.findOne({ email: req.body.email });
    + useEffect(() => { fetchData(); });
    """
    chunks = rag_service.split_code(sample_diff)
    assert len(chunks) >= 1

    practices = rag_service.retrieve_relevant_practices("SQL and NoSQL injection prevention with Mongo", top_k=2)
    assert len(practices) >= 1
    assert "guideline" in practices[0]


def test_fastapi_review_code_endpoint(client):
    """Verify POST /api/review-code endpoint."""
    payload = {
        "file_name": "auth.js",
        "code_type": "javascript",
        "review_mode": "security-focused",
        "code": "const express = require('express'); app.post('/data', (req, res) => { eval(req.body.code); });",
    }
    response = client.post("/api/review-code", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "code_score" in data
    assert "detected_issues" in data
    assert "severity_level" in data
    assert "improved_code" in data
    assert "learning_recommendations" in data


def test_langgraph_human_in_the_loop_lifecycle(client):
    """Verify LangGraph start, pause at checkpoint, and resume with decision."""
    thread_id = "test_thread_pr_999"

    # Step 1: Start PR review
    start_payload = {
        "owner": "test-org",
        "repo": "test-app",
        "pull_number": 999,
        "custom_diff": "diff --git a/test.ts b/test.ts\n+ const secret = 'plain_secret';",
        "thread_id": thread_id,
    }
    start_res = client.post("/api/agent/review-pr", json=start_payload)
    assert start_res.status_code == 200
    start_data = start_res.json()
    assert start_data["success"] is True
    assert start_data["status"] == "pending_approval"

    # Step 2: Get state from checkpointer
    state_res = client.get(f"/api/agent/review-pr/{thread_id}/state")
    assert state_res.status_code == 200
    state_data = state_res.json()
    assert state_data["state"]["thread_id"] == thread_id
    assert state_data["state"]["status"] == "pending_approval"

    # Step 3: Resume graph with operator approval
    resume_payload = {
        "decision": "approved",
        "feedback": "LGTM! Approved via automated test.",
    }
    resume_res = client.post(f"/api/agent/review-pr/{thread_id}/resume", json=resume_payload)
    assert resume_res.status_code == 200
    resume_data = resume_res.json()
    assert resume_data["success"] is True
    assert resume_data["status"] == "completed"
    assert resume_data["state"]["github_action_result"] is not None
