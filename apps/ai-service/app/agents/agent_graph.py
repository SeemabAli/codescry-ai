import logging
import sqlite3
from typing import Any, Literal, Optional, TypedDict

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

from app.core.config import settings
from app.schemas.structured_review import (
    CodeReviewRequest,
    CodeReviewStructuredResponse,
)
from app.services.github_service import (
    GitHubPRMetadata,
    fetch_pull_request,
    post_github_review,
)
from app.services.rag_service import rag_service
from app.services.structured_analyzer import analyze_code_structured

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    thread_id: str
    owner: str
    repo: str
    pull_number: int
    pr_title: str
    pr_author: str
    pr_url: str
    diff_content: str
    retrieved_rules: list[dict[str, Any]]
    review_result: Optional[dict[str, Any]]
    human_decision: Optional[dict[str, Any]]
    status: str  # "evaluating", "pending_approval", "approved", "rejected", "completed", "revised"
    revision_cycle_count: int
    github_action_result: Optional[dict[str, Any]]
    error: Optional[str]


# -------------------------------------------------------------------------
# Graph Nodes
# -------------------------------------------------------------------------

def evaluate_node(state: AgentState) -> dict[str, Any]:
    """
    RAG Evaluation Node:
    1. Chunks the PR diff and queries Qdrant for relevant coding best practices.
    2. Runs deep reasoning evaluation using Gemini API.
    """
    logger.info(f"[{state['thread_id']}] Evaluating PR #{state['pull_number']} ({state['owner']}/{state['repo']})")

    diff_text = state.get("diff_content", "")
    retrieved_rules = rag_service.retrieve_relevant_practices(diff_text, top_k=3)

    # Build evaluation request
    review_req = CodeReviewRequest(
        file_name=f"PR_{state['pull_number']}.diff",
        code_type="pull-request-diff",
        review_mode="deep-review",
        code=diff_text[:30000] if diff_text else "// Empty diff",
    )

    try:
        structured_resp: CodeReviewStructuredResponse = analyze_code_structured(review_req)
        review_dict = structured_resp.model_dump()
    except Exception as exc:
        logger.error(f"Error during structured analysis: {exc}")
        review_dict = {
            "code_score": 70.0,
            "detected_issues": [],
            "severity_level": "medium",
            "improved_code": diff_text,
            "learning_recommendations": ["Ensure thorough testing for PR changes."],
            "summary": f"Review generated for PR #{state['pull_number']} with default fallback.",
            "ai_provider": "gemini-fallback",
        }

    return {
        "retrieved_rules": retrieved_rules,
        "review_result": review_dict,
        "status": "evaluating",
    }


def pause_for_approval_node(state: AgentState) -> dict[str, Any]:
    """
    Human-In-The-Loop Checkpoint Node:
    Interrupts graph execution, persists state in SQLite, and yields to external API.
    Resumes when human operator calls /api/agent/review-pr/{thread_id}/resume.
    """
    review = state.get("review_result") or {}
    logger.info(
        f"[{state['thread_id']}] Pausing at Human-in-the-Loop gate. Score: {review.get('code_score')}"
    )

    # Interruption payload exposed to callers inspectable via checkpointer
    gate_payload = {
        "action": "awaiting_approval",
        "thread_id": state["thread_id"],
        "pr_title": state.get("pr_title", ""),
        "pr_url": state.get("pr_url", ""),
        "code_score": review.get("code_score", 0.0),
        "severity_level": review.get("severity_level", "low"),
        "issues_count": len(review.get("detected_issues", [])),
        "summary": review.get("summary", ""),
    }

    # LangGraph 1.2 interrupt primitive
    human_input = interrupt(gate_payload)

    # When execution is resumed with Command(resume={...}):
    if not isinstance(human_input, dict):
        decision_dict = {"decision": "approved", "feedback": str(human_input)}
    else:
        decision_dict = human_input

    decision_type = decision_dict.get("decision", "approved").lower()
    logger.info(f"[{state['thread_id']}] Resumed with decision: {decision_type}")

    return {
        "human_decision": decision_dict,
        "status": decision_type,
    }


def act_or_route_node(state: AgentState) -> dict[str, Any]:
    """
    Action Node:
    Delegates to autonomous GitHub review tooling:
    - If approved: posts approval or review comments to GitHub PR.
    - If rejected: requests changes and posts revision requirements.
    - If revise: increments cycle count and triggers cyclic re-evaluation.
    """
    decision_info = state.get("human_decision") or {"decision": "approved"}
    decision = decision_info.get("decision", "approved").lower()
    feedback = decision_info.get("feedback", "")
    review = state.get("review_result") or {}
    thread_id = state["thread_id"]

    logger.info(f"[{thread_id}] Executing action for decision: {decision}")

    if decision == "revise":
        new_count = state.get("revision_cycle_count", 0) + 1
        logger.info(f"[{thread_id}] Revision requested. Starting cycle #{new_count}")
        return {
            "revision_cycle_count": new_count,
            "status": "revised",
        }

    # Format review comment body
    score = review.get("code_score", 100.0)
    summary = review.get("summary", "Automated code review completed.")
    issues = review.get("detected_issues", [])

    body_lines = [
        f"### 🧙‍♂️ CodeScry AI Autonomous Review",
        f"**Quality Score:** {score}/100 | **Severity Level:** {review.get('severity_level', 'low').upper()}",
        f"",
        f"{summary}",
        f"",
    ]

    if feedback:
        body_lines.append(f"**Human Operator Feedback:** {feedback}\n")

    if issues:
        body_lines.append(f"#### Detected Issues ({len(issues)}):")
        for i, issue in enumerate(issues[:5], start=1):
            body_lines.append(
                f"- **{issue.get('title', 'Issue')}** ({issue.get('category', 'General')}) - {issue.get('severity_level', 'medium').upper()}"
            )
            body_lines.append(f"  > {issue.get('explanation', '')}")

    if review.get("learning_recommendations"):
        body_lines.append(f"\n#### Learning Recommendations:")
        for rec in review.get("learning_recommendations", []):
            body_lines.append(f"- {rec}")

    review_body = "\n".join(body_lines)
    gh_event = "APPROVE" if decision == "approved" else "REQUEST_CHANGES"

    # Post to GitHub PR
    action_result = post_github_review(
        owner=state["owner"],
        repo=state["repo"],
        pull_number=state["pull_number"],
        event=gh_event,
        body=review_body,
    )

    final_status = "completed" if decision == "approved" else "rejected"
    return {
        "github_action_result": action_result.model_dump(),
        "status": final_status,
    }


def route_decision(state: AgentState) -> Literal["evaluate", "end"]:
    """
    Conditional Edge: Creates a directed cyclic graph.
    If the human requests revision and we have not exceeded max cycles (3),
    route back to evaluate; otherwise proceed to END.
    """
    decision_info = state.get("human_decision") or {}
    decision = decision_info.get("decision", "").lower()
    cycle_count = state.get("revision_cycle_count", 0)

    if decision == "revise" and cycle_count < 3:
        logger.info(f"Cycling graph back to 'evaluate' (Cycle {cycle_count}/3)")
        return "evaluate"

    return "end"


# -------------------------------------------------------------------------
# Graph Compilation with Persistent SqliteSaver
# -------------------------------------------------------------------------

_sqlite_conn = sqlite3.connect(
    settings.CHECKPOINT_DB_PATH,
    check_same_thread=False,
)
_checkpointer = SqliteSaver(_sqlite_conn)

builder = StateGraph(AgentState)
builder.add_node("evaluate", evaluate_node)
builder.add_node("pause_for_approval", pause_for_approval_node)
builder.add_node("act_or_route", act_or_route_node)

builder.add_edge(START, "evaluate")
builder.add_edge("evaluate", "pause_for_approval")
builder.add_edge("pause_for_approval", "act_or_route")

# Directed cyclic routing
builder.add_conditional_edges(
    "act_or_route",
    route_decision,
    {
        "evaluate": "evaluate",
        "end": END,
    },
)

agent_graph = builder.compile(checkpointer=_checkpointer)


# -------------------------------------------------------------------------
# Helper Functions for API Route Invocation
# -------------------------------------------------------------------------

def start_pr_review_run(
    owner: str,
    repo: str,
    pull_number: int,
    custom_diff: Optional[str] = None,
    thread_id: Optional[str] = None,
) -> dict[str, Any]:
    """
    Initiates an agent run for a GitHub PR.
    Runs until the human-in-the-loop pause, saving state in SqliteSaver.
    """
    pr_meta: GitHubPRMetadata = fetch_pull_request(
        owner=owner,
        repo=repo,
        pull_number=pull_number,
        custom_diff=custom_diff,
    )

    t_id = thread_id or f"pr_{owner}_{repo}_{pull_number}"
    config = {"configurable": {"thread_id": t_id}}

    initial_state: AgentState = {
        "thread_id": t_id,
        "owner": owner,
        "repo": repo,
        "pull_number": pull_number,
        "pr_title": pr_meta.title,
        "pr_author": pr_meta.author,
        "pr_url": pr_meta.html_url,
        "diff_content": pr_meta.diff_content,
        "retrieved_rules": [],
        "review_result": None,
        "human_decision": None,
        "status": "pending_approval",
        "revision_cycle_count": 0,
        "github_action_result": None,
        "error": None,
    }

    # Execute graph until pause_for_approval interrupt
    agent_graph.invoke(initial_state, config=config)

    # Return snapshot from checkpoint
    snapshot = agent_graph.get_state(config)
    current_values = dict(snapshot.values) if snapshot and snapshot.values else initial_state
    current_values["status"] = "pending_approval"
    return current_values


def get_pr_review_state(thread_id: str) -> Optional[dict[str, Any]]:
    """Retrieves current state of an agent thread from the checkpointer."""
    config = {"configurable": {"thread_id": thread_id}}
    snapshot = agent_graph.get_state(config)
    if not snapshot or not snapshot.values:
        return None
    data = dict(snapshot.values)
    # If the graph is currently halted at an interrupt, reflect pending_approval
    if snapshot.next and "pause_for_approval" in snapshot.next:
        data["status"] = "pending_approval"
    return data


def resume_pr_review_run(
    thread_id: str,
    decision: str,  # "approved", "rejected", "revise"
    feedback: Optional[str] = None,
) -> dict[str, Any]:
    """
    Resumes execution of a paused review from its checkpoint with the operator decision.
    """
    config = {"configurable": {"thread_id": thread_id}}
    command = Command(resume={"decision": decision, "feedback": feedback or ""})

    # Resume graph execution
    agent_graph.invoke(command, config=config)

    snapshot = agent_graph.get_state(config)
    return dict(snapshot.values) if snapshot and snapshot.values else {}
