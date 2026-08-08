/**
 * Checks the two invariants the Disagreement Engine depends on: agent forecasts
 * aggregate to the published probability, and evidence contributions sum to the
 * gap against consensus. Run with `npx tsx scripts/verify-data.ts`.
 */
import { DEMO_MARKETS, aggregate } from "../src/lib/demo/markets";

let failures = 0;

for (const m of DEMO_MARKETS) {
  const signals = [
    ...m.forecast.keyPositiveSignals,
    ...m.forecast.keyNegativeSignals,
  ];
  const impactSum = signals.reduce((a, s) => a + s.impact, 0);
  const gap = m.forecast.probability - m.marketProbability;
  const agg = aggregate(m.forecast.agents);

  const impactOk = impactSum === gap;
  const aggOk = agg === m.forecast.probability;

  if (!impactOk || !aggOk) failures++;

  console.log(
    [
      impactOk && aggOk ? "PASS" : "FAIL",
      m.id.padEnd(28),
      `market ${String(m.marketProbability).padStart(2)}%`,
      `contrary ${String(m.forecast.probability).padStart(2)}%`,
      `gap ${String(gap).padStart(3)}`,
      `impacts ${String(impactSum).padStart(3)}`,
      `weighted ${String(agg).padStart(2)}`,
      `history ${m.history.length}pts`,
      m.timeline ? `timeline ${m.timeline.length}` : "",
    ].join("  ")
  );
}

console.log(
  failures === 0
    ? `\nAll ${DEMO_MARKETS.length} markets consistent.`
    : `\n${failures} market(s) inconsistent.`
);

process.exit(failures === 0 ? 0 : 1);
