import { NextRequest, NextResponse } from "next/server";
import { agentThreadStore } from "@/lib/agent-memory";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await context.params;

    // 1. Try forwarding to Python FastAPI service if alive
    const externalAiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const aiRes = await fetch(
        `${externalAiUrl}/api/agent/review-pr/${encodeURIComponent(threadId)}/state`,
        { signal: controller.signal }
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
        { detail: "Thread state not found or expired." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "State retrieved.",
      thread_id: threadId,
      status: state.status,
      state,
    });
  } catch (err) {
    console.error("agent review-pr state error:", err);
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Failed to fetch agent state." },
      { status: 500 }
    );
  }
}
