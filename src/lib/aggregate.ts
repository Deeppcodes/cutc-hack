import type { AgentForecast } from "./types";
import { clamp } from "./utils";

export function combineAgents(agents: AgentForecast[]) {
  const weights = agents.map((a) => a.weight * a.confidence);
  const total = weights.reduce((a, w) => a + w, 0);
  const probability = clamp(
    Math.round(
      agents.reduce((a, x, i) => a + x.probability * weights[i], 0) / total
    )
  );

  const mean =
    agents.reduce((a, x) => a + x.probability, 0) / agents.length;
  const spread = Math.sqrt(
    agents.reduce((a, x) => a + (x.probability - mean) ** 2, 0) / agents.length
  );
  const meanConfidence =
    agents.reduce((a, x) => a + x.confidence, 0) / agents.length;
  const confidence =
    Math.round(
      Math.min(0.95, Math.max(0.2, meanConfidence - spread / 100)) * 100
    ) / 100;

  return { probability, confidence };
}
