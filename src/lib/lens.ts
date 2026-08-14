import { AGENTS } from "./agents";
import { combineAgents } from "./aggregate";
import type { AgentId, Category, Forecast, Market } from "./types";
import { CATEGORIES } from "./types";

export type LensFocus = AgentId | "balanced";

export const LENSES: { id: LensFocus; label: string; blurb: string; accent: string }[] =
  [
    {
      id: "balanced",
      label: "General",
      blurb: "Equal weight on every agent. Use this if you do not want a personal lean.",
      accent: "#8B93A7",
    },
    {
      id: "contrarian",
      label: "Challenge the crowd",
      blurb: "Weight the Contrarian agent more when you think consensus is lazy.",
      accent: "#F0B429",
    },
    {
      id: "base-rate",
      label: "Trust history",
      blurb: "Weight Base Rate more when similar events have a clear track record.",
      accent: "#7C9CF5",
    },
    {
      id: "news",
      label: "Follow what just changed",
      blurb: "Weight News more when a fresh development actually moves the question.",
      accent: "#4FB783",
    },
    {
      id: "skeptic",
      label: "Discount weak sources",
      blurb: "Weight the Skeptic more when the bullish case is mostly rumours.",
      accent: "#E07A5F",
    },
    {
      id: "market",
      label: "Respect the price",
      blurb: "Weight Market Analyst more when the book is deep and the move is slow.",
      accent: "#8B93A7",
    },
  ];

export interface Lens {
  name: string;
  categories: Category[];
  trustedAgent: LensFocus;
  note: string;
  assistantId?: string;
}

export const DEFAULT_LENS: Lens = {
  name: "",
  categories: [],
  trustedAgent: "balanced",
  note: "",
};

export function emptyLens(): Lens {
  return {
    name: "",
    categories: [],
    trustedAgent: "balanced",
    note: "",
  };
}

export function lensIsSet(lens: Lens) {
  return Boolean(
    lens.name.trim() ||
      lens.categories.length ||
      lens.note.trim() ||
      lens.trustedAgent !== "balanced"
  );
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "YOU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function lensToMemory(lens: Lens) {
  const cats =
    lens.categories.length > 0 ? lens.categories.join(", ") : "none chosen yet";
  const who = lens.name.trim() || "this user";
  const extra = lens.note.trim() ? ` Extra context: ${lens.note.trim()}` : "";
  if (lens.trustedAgent === "balanced") {
    return `${who} follows ${cats}. They want the default combined forecast, with no extra agent weight.${extra}`;
  }
  const agent = AGENTS[lens.trustedAgent];
  return `${who} follows ${cats}. They want forecasts weighted toward the ${agent.name} agent (${agent.mandate}).${extra}`;
}

export function readingForLens(forecast: Forecast, lens: Lens) {
  if (lens.trustedAgent === "balanced") return forecast.probability;
  const agents = forecast.agents.map((a) => ({
    ...a,
    weight: a.agent === lens.trustedAgent ? a.weight * 1.8 : a.weight,
  }));
  return combineAgents(agents).probability;
}

export function forYouScore(market: Market, lens: Lens, watched: boolean) {
  let score = market.forecast.disagreementScore;
  if (lens.categories.includes(market.category)) score += 20;
  if (watched) score += 12;
  return score;
}

export function whyThisMatters(market: Market, lens: Lens) {
  const follows = lens.categories.includes(market.category);
  const gap = market.forecast.disagreementScore;
  const named = lens.name.trim();
  const follow = named ? `${named} follows` : "You follow";
  const marked = named ? `${named} marked` : "You marked";
  const focus =
    lens.trustedAgent === "balanced"
      ? "general"
      : AGENTS[lens.trustedAgent].name;

  if (follows && gap >= 10) {
    return `${follow} ${market.category}, and this one is ${gap} points off consensus. Your ${focus} lens is the one that usually catches this kind of gap.`;
  }
  if (follows) {
    return `${marked} ${market.category} as a focus area. This sits in that set even if the crowd is not far off.`;
  }
  if (gap >= 10) {
    return `Not in your usual categories, but the gap is ${gap} points. Worth a look if you care about where the crowd might be wrong.`;
  }
  return `Your ${focus} lens does not change this much. Contrary and the market are close.`;
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}

export function isAgentId(value: string): value is AgentId {
  return value in AGENTS;
}

export function isLensFocus(value: string): value is LensFocus {
  return value === "balanced" || isAgentId(value);
}
