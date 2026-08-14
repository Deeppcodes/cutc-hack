export type Category = "AI" | "Technology" | "Economy" | "Science" | "Culture";

export const CATEGORIES: Category[] = [
  "AI",
  "Technology",
  "Economy",
  "Science",
  "Culture",
];

export type AgentId =
  | "base-rate"
  | "news"
  | "contrarian"
  | "market"
  | "skeptic";

export type SourceQuality =
  | "primary"
  | "reliable-secondary"
  | "unverified"
  | "duplicate";

export type Stance = "YES" | "NO" | "NEUTRAL";

export interface Source {
  id: string;
  publication: string;
  headline: string;
  date: string;
  url?: string;
  /** 0..1. How relevant this source is to the question. */
  relevance: number;
  supports: Stance;
  quality: SourceQuality;
  /** Set by the Skeptic Agent when a source's influence is reduced */
  skepticFlag?: string;
}

export interface Evidence {
  id: string;
  title: string;
  explanation: string;
  /** Signed contribution in percentage points, e.g. +8 or -11 */
  impact: number;
  /** 0..1 */
  confidence: number;
  sourceIds: string[];
  agent: AgentId;
  /** True when the Skeptic Agent down-weighted this signal */
  discounted?: boolean;
  skepticNote?: string;
}

export interface AgentForecast {
  agent: AgentId;
  name: string;
  role: string;
  /** The question this agent is built to answer */
  mandate: string;
  probability: number;
  confidence: number;
  /** Label for keyPoints, e.g. "Key evidence" / "Important developments" */
  keyPointsLabel: string;
  keyPoints: string[];
  reasoningSummary: string;
  /** Relative weight in the aggregate, 0..1 */
  weight: number;
}

export interface Forecast {
  probability: number;
  confidence: number;
  /** Absolute gap vs. market consensus, in percentage points */
  disagreementScore: number;
  keyPositiveSignals: Evidence[];
  keyNegativeSignals: Evidence[];
  uncertainties: string[];
  forecastExplanation: string;
  agents: AgentForecast[];
  generatedAt: string;
  /** live = Backboard run; demo = seeded dataset */
  origin: "live" | "demo";
}

export interface Scenario {
  id: string;
  title: string;
  detail: string;
  /** Signed shift in percentage points applied when toggled on */
  shift: number;
  /** 0..1. How likely this scenario is to occur. */
  likelihood: number;
}

export interface PricePoint {
  date: string;
  market: number;
  contrary: number;
}

export interface TimelineEvent {
  title: string;
  description: string;
  /** Signed shift attributed to this event */
  impact: number;
}

export interface HistoricalSnapshot {
  date: string;
  marketProbability: number;
  contraryProbability: number;
  /** Only what was knowable on this date. */
  evidenceAvailable: string[];
  events: TimelineEvent[];
  /** One-line narrative of Contrary's stance at this point in time */
  stance: string;
}

export interface Market {
  id: string;
  question: string;
  /** Compact label for tight spaces */
  shortTitle: string;
  category: Category;
  description: string;
  resolutionDate: string;
  marketProbability: number;
  /** Change in market probability over the last 7 days, in points */
  change7d: number;
  volume: number;
  forecasters: number;
  history: PricePoint[];
  sources: Source[];
  scenarios: Scenario[];
  forecast: Forecast;
  /** Rich time-travel data. Only present for deeply researched markets. */
  timeline?: HistoricalSnapshot[];
  /** ISO string */
  updatedAt: string;
}

export interface ResolvedPrediction {
  id: string;
  question: string;
  category: Category;
  resolvedOn: string;
  outcome: "YES" | "NO";
  marketProbability: number;
  contraryProbability: number;
}

export interface CalibrationBucket {
  /** Bucket midpoint, e.g. 0.15 for the 10-20% bucket */
  predicted: number;
  actual: number;
  count: number;
}

export interface ForecasterRecord {
  id: AgentId | "combined" | "market-consensus";
  name: string;
  brierScore: number;
  accuracy: number;
  resolved: number;
  /** Signed change in Brier score over the last 30 days (lower is better) */
  trend: number;
}

export interface TrackRecord {
  accuracy: number;
  brierScore: number;
  marketBrierScore: number;
  resolvedCount: number;
  calibrationError: number;
  buckets: CalibrationBucket[];
  leaderboard: ForecasterRecord[];
  recent: ResolvedPrediction[];
}

export type SortKey =
  | "trending"
  | "disagreement"
  | "certain"
  | "recent"
  | "foryou";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "foryou", label: "For you" },
  { key: "trending", label: "Trending" },
  { key: "disagreement", label: "Largest Disagreement" },
  { key: "certain", label: "Most Certain" },
  { key: "recent", label: "Recently Changed" },
];
