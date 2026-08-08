import type { PricePoint } from "../types";
import { clamp, seeded } from "../utils";

export type Keyframe = [iso: string, market: number, contrary: number];

const WEEK = 7 * 86_400_000;

/** Jitter is seeded so server and client renders match. */
export function series(keys: Keyframe[], seed: number): PricePoint[] {
  const out: PricePoint[] = [];
  let n = 0;

  for (let k = 0; k < keys.length - 1; k++) {
    const [fromIso, m0, c0] = keys[k];
    const [toIso, m1, c1] = keys[k + 1];
    const start = new Date(fromIso).getTime();
    const end = new Date(toIso).getTime();
    const span = end - start;

    for (let t = start; t < end; t += WEEK) {
      const p = (t - start) / span;
      const wobble = (seeded((n + 1) * seed) - 0.5) * 2.4;
      const wobble2 = (seeded((n + 41) * seed) - 0.5) * 2.0;
      out.push({
        date: new Date(t).toISOString().slice(0, 10),
        market: clamp(Math.round((m0 + (m1 - m0) * p + wobble) * 10) / 10),
        contrary: clamp(Math.round((c0 + (c1 - c0) * p + wobble2) * 10) / 10),
      });
      n++;
    }
  }

  const [lastIso, lm, lc] = keys[keys.length - 1];
  out.push({ date: lastIso, market: lm, contrary: lc });
  return out;
}
