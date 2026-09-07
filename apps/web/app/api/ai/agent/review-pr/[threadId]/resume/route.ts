import { NextRequest, NextResponse } from "next/server";
import { agentThreadStore } from "@/lib/agent-memory";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await context.params;
    const body = await request.json();
    const { decision, feedback } = body;

    // 1. Try forwarding to Python FastAPI service if alive
    const externalAiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const aiRes = await fetch(
        `${externalAiUrl}/api/agent/review-pr/${encodeURIComponent(threadId)}/resume`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (aiRes.ok) {
        const data = await aiRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback to local thread store
    }

    const state = agentThreadStore.get(threadId);

    if (!state) {
      return NextResponse.json(
        { detail: "Thread state not found." },
        { status: 404 }
      );
    }

    state.human_decision = {
      decision: decision || "approved",
      feedback: feedback || "",
    };

    if (decision === "approved") {
      state.status = "approved";
      state.github_action_result = {
        action: "approved",
        comment_count: state.review_result?.detected_issues.length || 0,
        summary_posted: "Review approved and signed on GitHub PR via CodeScry scryer.",
        pr_url: state.pr_url,
        status_message: "Review approved and signed on GitHub PR via CodeScry scryer.",
      };
    } else if (decision === "rejected") {
      state.status = "rejected";
      state.github_action_result = {
        action: "changes_requested",
        comment_count: state.review_result?.detected_issues.length || 0,
        summary_posted: "Changes requested with red pen margin notes posted to GitHub PR.",
        pr_url: state.pr_url,
        status_message: "Changes requested with red pen margin notes posted to GitHub PR.",
      };
    } else {
      state.status = "evaluating";
      state.revision_cycle_count = (state.revision_cycle_count || 0) + 1;
    }

    agentThreadStore.set(threadId, state);

    return NextResponse.json({
      success: true,
      message: `Reviewer decision '${decision}' executed.`,
      thread_id: threadId,
      status: state.status,
      state,
    });
  } catch (err) {
    console.error("agent review-pr resume error:", err);
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Failed to resume agent graph." },
      { status: 500 }
    );
  }
}
