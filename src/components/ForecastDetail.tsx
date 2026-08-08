"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Clock, TrendingDown, TrendingUp, Users } from "lucide-react";

import { AgentForecasts } from "@/components/AgentForecasts";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useDemoMode } from "@/components/DemoMode";
import { EvidencePanel } from "@/components/EvidencePanel";
import { ForecastPipeline } from "@/components/ForecastPipeline";
import { ChartLegend, ProbabilityChart } from "@/components/ProbabilityChart";
import { ScenarioSimulator } from "@/components/ScenarioSimulator";
import { SourceCard } from "@/components/SourceCard";
import { TimeMachine } from "@/components/TimeMachine";
import { WatchlistButton } from "@/components/WatchlistButton";
import { Badge } from "@/components/ui/badge";
import { PIPELINE_STAGES } from "@/lib/agents";
import { fetchForecast } from "@/lib/api";
import type { Forecast, Market } from "@/lib/types";
import {
  cn,
  formatCompact,
  formatDate,
  formatVolume,
  signed,
} from "@/lib/utils";

const STAGE_MS = 380;

export function ForecastDetail({ market }: { market: Market }) {
  const { report } = useDemoMode();
  const [forecast, setForecast] = React.useState<Forecast>(market.forecast);
  const [stage, setStage] = React.useState(0);
  const [running, setRunning] = React.useState(true);
  const [liveRun, setLiveRun] = React.useState(false);

  // Seeded data renders behind a short pipeline animation so the page never
  // waits on the network. Live Backboard runs are opt-in via runLive.
  // The page keys this component by market id, so mount state is the reset.
  React.useEffect(() => {
    const ticker = setInterval(() => {
      setStage((s) => Math.min(PIPELINE_STAGES.length - 1, s + 1));
    }, STAGE_MS);
    const done = setTimeout(
      () => setRunning(false),
      STAGE_MS * PIPELINE_STAGES.length
    );

    return () => {
      clearInterval(ticker);
      clearTimeout(done);
    };
  }, []);

  const runLive = React.useCallback(async () => {
    setRunning(true);
    setLiveRun(true);
    setStage(0);

    const ticker = setInterval(() => {
      setStage((s) => Math.min(PIPELINE_STAGES.length - 1, s + 1));
    }, 1200);

    try {
      const result = await fetchForecast(market.id);
      setForecast(result.forecast);
      report(result.origin, result.reason);
    } finally {
      clearInterval(ticker);
      setRunning(false);
    }
  }, [market.id, report]);

  const gap = forecast.probability - market.marketProbability;
  const rising = market.change7d >= 0;

  const enrichedMarket = React.useMemo(
    () => ({ ...market, forecast }),
    [market, forecast]
  );

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-8 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#646c7a] transition-colors hover:text-[#e9ecf1]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Discover
      </Link>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="outline">{market.category}</Badge>
          <span className="flex items-center gap-1.5 text-[12px] text-[#646c7a]">
            <Clock className="h-3 w-3" />
            Resolves {formatDate(market.resolutionDate)}
          </span>
          <span className="text-[12px] tnum text-[#646c7a]">
            {formatVolume(market.volume)} volume
          </span>
          <span className="flex items-center gap-1 text-[12px] tnum text-[#646c7a]">
            <Users className="h-3 w-3" />
            {formatCompact(market.forecasters)} forecasters
          </span>
          <span className="ml-auto">
            <WatchlistButton marketId={market.id} />
          </span>
        </div>

        <h1 className="mt-4 max-w-4xl text-[30px] font-semibold leading-[1.15] tracking-[-0.015em] text-[#e9ecf1] text-balance sm:text-[38px]">
          {market.question}
        </h1>

        <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-[#646c7a]">
          {market.description}
        </p>
      </header>

      <div className="mt-7 grid gap-px overflow-hidden rounded-[14px] border border-[#1e232c] bg-[#1e232c] sm:grid-cols-3">
        <div className="bg-[#101318] px-6 py-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#646c7a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6b8aff]" />
            Market probability
          </div>
          <div className="mt-2.5 text-[52px] font-semibold leading-none tracking-[-0.03em] tnum text-[#e9ecf1]">
            {market.marketProbability}%
          </div>
          <div
            className={cn(
              "mt-3 flex items-center gap-1.5 text-[13px] font-medium tnum",
              rising ? "text-[#5fd06f]" : "text-[#f0847a]"
            )}
          >
            {rising ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {signed(market.change7d)}% this week
          </div>
        </div>

        <div className="bg-[#101318] px-6 py-6">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#646c7a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f0b429]" />
            Contrary forecast
          </div>
          <div
            className={cn(
              "mt-2.5 text-[52px] font-semibold leading-none tracking-[-0.03em] text-[#f0b429] transition-opacity duration-500",
              running && "opacity-40"
            )}
          >
            <AnimatedNumber value={forecast.probability} suffix="%" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[13px] text-[#646c7a]">
            <span>Confidence</span>
            <span className="h-1 w-16 overflow-hidden rounded-full bg-[#1e232c]">
              <span
                className="block h-full rounded-full bg-[#f0b429]/70 transition-all duration-700"
                style={{ width: `${forecast.confidence * 100}%` }}
              />
            </span>
            <span className="tnum">
              {Math.round(forecast.confidence * 100)}%
            </span>
          </div>
        </div>

        <div
          className={cn(
            "px-6 py-6 transition-colors",
            Math.abs(gap) >= 15 ? "bg-[#15130d]" : "bg-[#101318]"
          )}
        >
          <div className="text-[11px] uppercase tracking-[0.1em] text-[#646c7a]">
            Difference
          </div>
          <div
            className={cn(
              "mt-2.5 text-[52px] font-semibold leading-none tracking-[-0.03em]",
              gap >= 0 ? "text-[#5fd06f]" : "text-[#f0847a]"
            )}
          >
            {gap >= 0 ? "+" : "−"}
            <AnimatedNumber value={Math.abs(gap)} suffix="%" />
          </div>
          <div className="mt-3 text-[13px] text-[#646c7a]">
            {Math.abs(gap) >= 15
              ? "Large disagreement with consensus"
              : Math.abs(gap) >= 7
                ? "Moderate disagreement with consensus"
                : "Broadly aligned with consensus"}
          </div>
        </div>
      </div>

      <section className="panel mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[16px] font-medium text-[#e9ecf1]">
            Probability over time
          </h2>
          <ChartLegend />
        </div>
        <div className="mt-4">
          <ProbabilityChart data={market.history} height={320} />
        </div>
      </section>

      <div className="mt-6">
        {running ? (
          <ForecastPipeline stage={stage} live={liveRun} />
        ) : (
          <div className="animate-in">
            <AgentForecasts
              forecast={forecast}
              marketProbability={market.marketProbability}
              onRunLive={runLive}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <EvidencePanel market={enrichedMarket} />
      </div>

      <div className="mt-6">
        <ScenarioSimulator
          baseProbability={forecast.probability}
          marketProbability={market.marketProbability}
          scenarios={market.scenarios}
        />
      </div>

      {market.timeline && market.timeline.length > 0 && (
        <div className="mt-6">
          <TimeMachine market={enrichedMarket} />
        </div>
      )}

      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-[#e9ecf1]">
              Sources
            </h2>
            <p className="mt-1.5 text-[13px] text-[#949cab]">
              Every factor traces to a source. The Skeptic Agent reduces the
              influence of weak, unverified, or duplicated reporting.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-[#646c7a]">
            {(["primary", "reliable-secondary", "unverified", "duplicate"] as const).map(
              (q) => (
                <span key={q} className="tnum">
                  {market.sources.filter((s) => s.quality === q).length}{" "}
                  {q.replace("-", " ")}
                </span>
              )
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {market.sources.map((s) => (
            <SourceCard key={s.id} source={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
