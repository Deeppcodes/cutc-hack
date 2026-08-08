import { DEMO_MARKETS, getDemoMarket } from "./demo/markets";
import { DEMO_TRACK_RECORD } from "./demo/track-record";
import type { Forecast, Market, SortKey, TrackRecord } from "./types";

/**
 * The single boundary between the UI and wherever data comes from.
 *
 * Everything is served from the seeded dataset today. Swapping in a live
 * prediction-market feed means changing these functions only — no component
 * imports demo data directly.
 */

export function listMarkets(): Market[] {
  return DEMO_MARKETS;
}

export function getMarket(id: string): Market | undefined {
  return getDemoMarket(id);
}

export function getTrackRecord(): TrackRecord {
  return DEMO_TRACK_RECORD;
}

export interface ForecastResponse {
  forecast: Forecast;
  origin: "live" | "demo";
  reason?: string;
}

/**
 * Requests a freshly-run multi-agent forecast. Falls back to the seeded
 * forecast if the backend or Backboard is unavailable, so the UI never breaks.
 */
export async function fetchForecast(
  marketId: string,
  signal?: AbortSignal
): Promise<ForecastResponse> {
  const fallback = getDemoMarket(marketId)?.forecast;

  try {
    const res = await fetch(`/api/forecast/${marketId}`, {
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = (await res.json()) as ForecastResponse;
    if (!data.forecast) throw new Error("Malformed forecast response");
    return data;
  } catch (error) {
    if (!fallback) throw error;
    return {
      forecast: fallback,
      origin: "demo",
      reason: error instanceof Error ? error.message : "Network unavailable",
    };
  }
}

export function sortMarkets(markets: Market[], key: SortKey): Market[] {
  const copy = [...markets];
  switch (key) {
    case "disagreement":
      return copy.sort(
        (a, b) => b.forecast.disagreementScore - a.forecast.disagreementScore
      );
    case "certain":
      return copy.sort(
        (a, b) =>
          Math.abs(b.forecast.probability - 50) -
          Math.abs(a.forecast.probability - 50)
      );
    case "recent":
      return copy.sort(
        (a, b) => Math.abs(b.change7d) - Math.abs(a.change7d)
      );
    case "trending":
    default:
      return copy.sort((a, b) => b.volume - a.volume);
  }
}

export function searchMarkets(markets: Market[], query: string): Market[] {
  const q = query.trim().toLowerCase();
  if (!q) return markets;
  return markets.filter(
    (m) =>
      m.question.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
  );
}
