import "server-only";

import { AGENTS, AGENT_ORDER } from "./agents";
import { combineAgents } from "./aggregate";
import { backboardMessage, parseJsonResponse } from "./backboard";
import { lensToMemory, type Lens } from "./lens";
import type { AgentForecast, AgentId, Forecast, Market } from "./types";
import { clamp } from "./utils";

interface AgentReply {
  probability: number;
  confidence: number;
  keyPoints: string[];
  reasoningSummary: string;
}

interface AggregatorReply {
  uncertainties: string[];
  forecastExplanation: string;
}

const HOUSE_RULES = `You are one specialist inside Contrary, a forecasting system that looks for places where prediction-market consensus may be wrong.

Rules:
- Never reveal step-by-step reasoning. Return only conclusions and short evidence statements.
- Every key point must be a single concrete sentence, under 140 characters.
- Probabilities are integers from 1 to 99. Confidence is a decimal from 0 to 1.
- Never use betting language (bet, wager, gamble, odds). Use forecast, probability, confidence, consensus, signal, evidence.
- Respond with a single JSON object and nothing else.`;

function agentInstruction(id: AgentId): string {
  const meta = AGENTS[id];
  const specific: Record<AgentId, string> = {
    "base-rate":
      "Pick an explicit reference class of comparable past events and estimate how often they occurred within a comparable window. Ignore the current news cycle entirely. The sources are context only. Deadlines are missed far more often than intuition suggests, so anchor on observed frequency rather than stated intent. Every key point must cite a frequency or a historical count.",
    news: "Identify recent developments that genuinely change the forecast. Separate real signal from restatement, and say plainly when a development is suggestive rather than decisive.",
    contrarian:
      "Find assumptions that may be wrong. Check whether the popular view is answering a looser question than the resolution criteria actually require, and whether any strong precondition is missing. Your estimate should differ from the obvious reading unless the evidence genuinely leaves no room.",
    market:
      "Analyse the market probability, its recent movement, and how much information the price carries. A fast move on thin volume is weaker evidence than a stable, well-traded consensus.",
    skeptic:
      "Audit the evidence for duplicated reporting, weak sources, unverified rumours, circular reporting, unsupported assumptions and recency bias. Treat unverified and duplicate sources as near-worthless. Your probability is the forecast that survives after discounting everything that fails the audit.",
  };

  return `${HOUSE_RULES}

Your role: ${meta.name} Agent, ${meta.role}.
Your mandate: ${meta.mandate}
${specific[id]}

Return JSON of exactly this shape:
{"probability": number, "confidence": number, "keyPoints": [string, string, string], "reasoningSummary": string}
The reasoningSummary must be one or two sentences summarising your conclusion, never your process.`;
}

function marketBrief(
  market: Market,
  includeConsensus: boolean,
  lens?: Lens
): string {
  const sources = market.sources
    .map(
      (s) =>
        `- [${s.quality}] ${s.publication} (${s.date}): ${s.headline}, supports ${s.supports}`
    )
    .join("\n");

  const consensus = includeConsensus
    ? `\nCURRENT MARKET CONSENSUS: ${market.marketProbability}% YES (${
        market.change7d >= 0 ? "+" : ""
      }${market.change7d} points over 7 days)
ACTIVITY: ${market.forecasters.toLocaleString("en-US")} forecasters\n`
    : "\nThe current market price has been deliberately withheld. Form your own estimate from the evidence alone.\n";

  return `QUESTION: ${market.question}
RESOLUTION CRITERIA: ${market.description}
RESOLVES BY: ${market.resolutionDate}
CATEGORY: ${market.category}
TODAY: ${market.updatedAt.slice(0, 10)}
${consensus}
AVAILABLE SOURCES:
${sources}${lens ? `\n\nREADER LENS (do not change your independent probability for this):\n${lensToMemory(lens)}` : ""}`;
}

async function runAgent(
  market: Market,
  id: AgentId,
  fallback: AgentForecast,
  lens?: Lens
): Promise<AgentForecast> {
  try {
    const res = await backboardMessage({
      systemPrompt: agentInstruction(id),
      content: marketBrief(market, id === "market", lens),
      json: true,
      timeoutMs: 40_000,
      assistantId: lens?.assistantId,
      memory: lens?.assistantId ? "Readonly" : "off",
    });
    const parsed = parseJsonResponse<AgentReply>(res.content);

    return {
      ...fallback,
      probability: clamp(Math.round(parsed.probability)),
      confidence: Math.min(1, Math.max(0.05, Number(parsed.confidence) || 0.5)),
      keyPoints: (parsed.keyPoints ?? []).slice(0, 4).filter(Boolean),
      reasoningSummary: parsed.reasoningSummary || fallback.reasoningSummary,
    };
  } catch {
    return fallback;
  }
}

async function runAggregator(
  market: Market,
  agents: AgentForecast[],
  combined: number,
  fallback: Forecast,
  lens?: Lens
): Promise<AggregatorReply> {
  const summary = agents
    .map(
      (a) =>
        `${a.name}: ${a.probability}% (confidence ${a.confidence.toFixed(
          2
        )}), ${a.reasoningSummary}`
    )
    .join("\n");

  const gap = combined - market.marketProbability;

  try {
    const res = await backboardMessage({
      systemPrompt: `${HOUSE_RULES}

You are the Forecast Aggregator. The combined probability has already been computed from the specialists by weighting each one by its confidence. Your job is to explain it, not to revise it.

Return JSON of exactly this shape:
{"uncertainties": [string, string, string], "forecastExplanation": string}

forecastExplanation must be two or three sentences naming the specific evidence that drives the difference from market consensus. Do not restate the numbers, do not hedge toward consensus, and never describe your process.
uncertainties must each name one concrete thing that could make this forecast wrong.`,
      content: `${marketBrief(market, true, lens)}

SPECIALIST FORECASTS (four of five never saw the market price):
${summary}

COMBINED CONTRARY FORECAST: ${combined}%
DIFFERENCE FROM CONSENSUS: ${gap >= 0 ? "+" : ""}${gap} points`,
      json: true,
      timeoutMs: 40_000,
      assistantId: lens?.assistantId,
      memory: lens?.assistantId ? "Readonly" : "off",
    });

    const parsed = parseJsonResponse<AggregatorReply>(res.content);
    return {
      uncertainties: (parsed.uncertainties ?? []).slice(0, 4).filter(Boolean),
      forecastExplanation:
        parsed.forecastExplanation || fallback.forecastExplanation,
    };
  } catch {
    return {
      uncertainties: fallback.uncertainties,
      forecastExplanation: fallback.forecastExplanation,
    };
  }
}

export async function generateForecast(
  market: Market,
  lens?: Lens
): Promise<Forecast> {
  const seeded = market.forecast;
  const byId = new Map(seeded.agents.map((a) => [a.agent, a]));

  const agents = await Promise.all(
    AGENT_ORDER.map((id) => runAgent(market, id, byId.get(id)!, lens))
  );

  const { probability, confidence } = combineAgents(agents);
  const narrative = await runAggregator(
    market,
    agents,
    probability,
    seeded,
    lens
  );

  return {
    ...seeded,
    agents,
    probability,
    confidence,
    disagreementScore: Math.abs(probability - market.marketProbability),
    uncertainties: narrative.uncertainties.length
      ? narrative.uncertainties
      : seeded.uncertainties,
    forecastExplanation: narrative.forecastExplanation,
    generatedAt: new Date().toISOString(),
    origin: "live",
  };
}

export async function generateForYouNote(
  market: Market,
  lens: Lens
): Promise<string> {
  if (!lens.assistantId) return "";
  try {
    const res = await backboardMessage({
      systemPrompt: `You write one or two short sentences for a forecasting product. No betting language. Do not change any probability. Explain why this question matters for this specific reader, using retrieved memory about them. Plain language. Return JSON {"note": string}.`,
      content: `QUESTION: ${market.question}
CATEGORY: ${market.category}
MARKET: ${market.marketProbability}%
CONTRARY: ${market.forecast.probability}%
GAP: ${market.forecast.disagreementScore} points
READER: ${lensToMemory(lens)}`,
      json: true,
      timeoutMs: 25_000,
      assistantId: lens.assistantId,
      memory: "Readonly",
    });
    const parsed = parseJsonResponse<{ note: string }>(res.content);
    return parsed.note?.trim() ?? "";
  } catch {
    return "";
  }
}
