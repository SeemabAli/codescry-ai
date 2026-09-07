import type { AgentPRReviewState } from "@/types/review";

declare global {
  // eslint-disable-next-line no-var
  var agentThreadCache: Map<string, AgentPRReviewState> | undefined;
}

export const agentThreadStore: Map<string, AgentPRReviewState> =
  global.agentThreadCache || new Map<string, AgentPRReviewState>();

if (!global.agentThreadCache) {
  global.agentThreadCache = agentThreadStore;
}
