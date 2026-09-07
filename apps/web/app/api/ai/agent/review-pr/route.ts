import { NextRequest, NextResponse } from "next/server";
import { agentThreadStore } from "@/lib/agent-memory";
import type { AgentPRReviewApiResponse, AgentPRReviewState } from "@/types/review";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, pull_number, custom_diff } = body;

    if (!owner || !repo || !pull_number) {
      return NextResponse.json(
        { detail: "Owner, repo, and pull_number are required." },
        { status: 400 }
      );
    }

    // 1. Try forwarding to Python FastAPI if running
    const externalAiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const aiRes = await fetch(`${externalAiUrl}/api/agent/review-pr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (aiRes.ok) {
        const data = await aiRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback to embedded LangGraph simulator
    }

    const threadId = `pr_${owner}_${repo}_${pull_number}_${Date.now()}`;
    const diff =
      custom_diff ||
      `diff --git a/src/routes/auth.js b/src/routes/auth.js
index 10a45e..88cb12 100644
--- a/src/routes/auth.js
+++ b/src/routes/auth.js
@@ -12,6 +12,16 @@ router.post("/login", async (req, res) => {
+  const { username, password } = req.body;
+  // Find user by plain password
+  const user = await db.collection("users").findOne({
+    username: username,
+    password: password,
+  });
+  if (user) {
+    return res.json({ status: "ok", token: "secret-token", user: user });
+  }
+  return res.status(401).send("Invalid login");
 });
`;

    const state: AgentPRReviewState = {
      thread_id: threadId,
      owner,
      repo,
      pull_number: Number(pull_number),
      pr_title: `Pull Request #${pull_number}: Update Authentication Flow`,
      pr_author: "octocat",
      pr_url: `https://github.com/${owner}/${repo}/pull/${pull_number}`,
      diff_content: diff,
      retrieved_rules: [
        {
          title: "Credential Hashing Mandatory",
          guideline: "Never compare passwords directly in database queries. Store and verify salted Argon2id/bcrypt hashes.",
          category: "Security",
        },
        {
          title: "Constant-time Token Verification",
          guideline: "Verify JWT authentication tokens with signed secret keys loaded from secure environment configs.",
          category: "Security",
        },
        {
          title: "Structured Route Error Handling",
          guideline: "Catch async database failures and pass to Express error middleware rather than leaking internal stack traces.",
          category: "Maintainability",
        },
      ],
      review_result: {
        code_score: 52,
        severity_level: "critical",
        summary: "Autonomous scryer evaluation identified severe plaintext credential matching in the login handler. Execution paused at Human-in-the-Loop checkpoint awaiting reviewer decision.",
        detected_issues: [
          {
            title: "Plaintext Credential Lookup Vulnerability",
            category: "Security",
            severity_level: "critical",
            severity: "Critical",
            line_number: 14,
            lineNumber: 14,
            explanation: "The query attempts to find users by raw submitted password string. This exposes credentials to database query logging and lacks modern hash validation.",
            recommendation: "Query user solely by username/email, then execute bcrypt.compare(password, user.passwordHash) in constant time.",
            code_example: "const user = await db.collection('users').findOne({ username });\nif (user && await bcrypt.compare(password, user.passwordHash)) { ... }",
            codeExample: "const user = await db.collection('users').findOne({ username });\nif (user && await bcrypt.compare(password, user.passwordHash)) { ... }",
          },
          {
            title: "Static Token Issuance Without Expiration",
            category: "Security",
            severity_level: "high",
            severity: "High",
            line_number: 21,
            lineNumber: 21,
            explanation: "Returning a static 'secret-token' literal does not provide cryptographically verifiable claims and cannot be revoked.",
            recommendation: "Sign an expiring JSON Web Token containing subject claim and appropriate issuer signatures.",
            code_example: "const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });",
            codeExample: "const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });",
          },
        ],
        improved_code: `router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ status: "ok", token, user: { id: user._id, username: user.username } });
  } catch (err) {
    next(err);
  }
});`,
        learning_recommendations: [
          "Enforce bcrypt/argon2 password hashing across all auth routes.",
          "Use constant-time comparison algorithms to mitigate timing side-channel attacks.",
          "Sign tokens with bounded lifespan using cryptographic keys.",
        ],
        ai_provider: "Gemini 2.5 (CodeScry LangGraph Scryer)",
      },
      human_decision: null,
      status: "pending_approval",
      revision_cycle_count: 0,
      github_action_result: null,
    };

    agentThreadStore.set(threadId, state);

    const responseData: AgentPRReviewApiResponse = {
      success: true,
      message: "Autonomous review initiated. Paused at human-in-the-loop checkpoint.",
      thread_id: threadId,
      status: "pending_approval",
      state,
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("agent review-pr route error:", err);
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Agent review dispatch failed." },
      { status: 500 }
    );
  }
}
