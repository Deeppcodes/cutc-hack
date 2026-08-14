import { NextResponse } from "next/server";

import { backboardConfigured } from "@/lib/backboard";
import { getDemoMarket } from "@/lib/demo/markets";
import { generateForecast, generateForYouNote } from "@/lib/forecast-engine";
import { isLensFocus, isCategory, type Lens } from "@/lib/lens";

export const dynamic = "force-dynamic";

function parseLens(request: Request): Lens | undefined {
  const url = new URL(request.url);
  const assistantId = url.searchParams.get("assistantId") ?? undefined;
  const trustedAgent = url.searchParams.get("trustedAgent");
  const name = url.searchParams.get("name") ?? "";
  const note = url.searchParams.get("note") ?? "";
  const categories = (url.searchParams.get("categories") ?? "")
    .split(",")
    .filter(isCategory);
  if (!assistantId && !trustedAgent && !name) return undefined;
  return {
    name,
    note,
    categories,
    trustedAgent:
      trustedAgent && isLensFocus(trustedAgent) ? trustedAgent : "balanced",
    assistantId,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const market = getDemoMarket(id);

  if (!market) {
    return NextResponse.json({ error: "Unknown market" }, { status: 404 });
  }

  const lens = parseLens(request);

  if (!backboardConfigured()) {
    return NextResponse.json({
      forecast: market.forecast,
      origin: "demo",
      reason: "Backboard API key not configured",
    });
  }

  try {
    const forecast = await generateForecast(market, lens);
    const forYou =
      lens && lens.assistantId
        ? await generateForYouNote({ ...market, forecast }, lens)
        : undefined;
    return NextResponse.json({
      forecast,
      origin: forecast.origin,
      forYou,
    });
  } catch (error) {
    return NextResponse.json({
      forecast: market.forecast,
      origin: "demo",
      reason: error instanceof Error ? error.message : "Forecast run failed",
    });
  }
}
