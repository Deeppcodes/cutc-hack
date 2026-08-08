import type { AgentId } from "./types";

export interface AgentMeta {
  id: AgentId;
  name: string;
  role: string;
  mandate: string;
  /** Tailwind-friendly accent used in the forecast panel */
  accent: string;
  keyPointsLabel: string;
  loadingLabel: string;
}

export const AGENTS: Record<AgentId, AgentMeta> = {
  "base-rate": {
    id: "base-rate",
    name: "Base Rate",
    role: "Historical frequency",
    mandate: "How often do events like this actually occur?",
    accent: "#7C9CF5",
    keyPointsLabel: "Key evidence",
    loadingLabel: "Checking historical base rates…",
  },
  news: {
    id: "news",
    name: "News",
    role: "Recent developments",
    mandate: "What changed recently that genuinely moves the forecast?",
    accent: "#4FB783",
    keyPointsLabel: "Important developments",
    loadingLabel: "Gathering evidence…",
  },
  contrarian: {
    id: "contrarian",
    name: "Contrarian",
    role: "Consensus stress test",
    mandate: "What is the crowd assuming that may not hold?",
    accent: "#F0B429",
    keyPointsLabel: "Overlooked assumptions",
    loadingLabel: "Challenging assumptions…",
  },
  market: {
    id: "market",
    name: "Market Analyst",
    role: "Consensus pricing",
    mandate: "What does the market price imply, and how is it moving?",
    accent: "#8B93A7",
    keyPointsLabel: "Market movement",
    loadingLabel: "Comparing against market consensus…",
  },
  skeptic: {
    id: "skeptic",
    name: "Skeptic",
    role: "Evidence audit",
    mandate: "Which of this evidence does not survive scrutiny?",
    accent: "#E07A5F",
    keyPointsLabel: "Evidence challenged",
    loadingLabel: "Auditing sources for circular reporting…",
  },
};

export const AGENT_ORDER: AgentId[] = [
  "base-rate",
  "news",
  "contrarian",
  "market",
  "skeptic",
];

/** The staged pipeline shown while a forecast is being produced. */
export const PIPELINE_STAGES = [
  "Gathering evidence…",
  "Checking historical base rates…",
  "Reading recent developments…",
  "Challenging assumptions…",
  "Comparing against market consensus…",
  "Auditing sources for circular reporting…",
  "Aggregating agent forecasts…",
] as const;
