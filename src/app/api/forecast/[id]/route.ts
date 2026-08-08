import { NextResponse } from "next/server";

import { backboardConfigured } from "@/lib/backboard";
import { getDemoMarket } from "@/lib/demo/markets";
import { generateForecast } from "@/lib/forecast-engine";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const market = getDemoMarket(id);

  if (!market) {
    return NextResponse.json({ error: "Unknown market" }, { status: 404 });
  }

  if (!backboardConfigured()) {
    return NextResponse.json({
      forecast: market.forecast,
      origin: "demo",
      reason: "Backboard API key not configured",
    });
  }

  try {
    const forecast = await generateForecast(market);
    return NextResponse.json({ forecast, origin: forecast.origin });
  } catch (error) {
    return NextResponse.json({
      forecast: market.forecast,
      origin: "demo",
      reason: error instanceof Error ? error.message : "Forecast run failed",
    });
  }
}
