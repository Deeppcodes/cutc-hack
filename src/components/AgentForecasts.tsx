"use client";

import * as React from "react";
import { ChevronRight, Sparkles } from "lucide-react";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { AGENTS } from "@/lib/agents";
import type { Forecast } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AgentForecasts({
  forecast,
  marketProbability,
  onRunLive,
}: {
  forecast: Forecast;
  marketProbability: number;
  onRunLive?: () => void;
}) {
  const [selected, setSelected] = React.useState(forecast.agents[0].agent);
  const active =
    forecast.agents.find((a) => a.agent === selected) ?? forecast.agents[0];
  const meta = AGENTS[active.agent];
  const maxWeight = Math.max(...forecast.agents.map((a) => a.weight));

  return (
    <section className="panel overflow-hidden">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1e232c] px-6 py-5">
        <div>
          <h2 className="text-[19px] font-semibold tracking-tight text-[#e9ecf1]">
            AI Forecast Panel
          </h2>
          <p className="mt-1 text-[13px] text-[#949cab]">
            Five specialists forecast independently, then an aggregator combines
            them by confidence and evidence independence.
          </p>
        </div>
        <div className="flex items-center gap-5">
          {onRunLive && (
            <div className="text-right">
              <Button variant="outline" size="sm" onClick={onRunLive}>
                <Sparkles className="h-3.5 w-3.5 text-[#f0b429]" />
                Re-run live agents
              </Button>
              <div className="mt-1.5 text-[10px] text-[#646c7a]">
                {forecast.origin === "live"
                  ? "Live Backboard run"
                  : "Showing seeded forecast"}
              </div>
            </div>
          )}
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.11em] text-[#646c7a]">
              Combined Contrary Forecast
            </div>
            <div className="mt-0.5 text-[34px] font-semibold leading-none tracking-tight text-[#f0b429]">
              <AnimatedNumber value={forecast.probability} suffix="%" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-px bg-[#1e232c] sm:grid-cols-3 lg:grid-cols-5">
        {forecast.agents.map((agent) => {
          const m = AGENTS[agent.agent];
          const isActive = agent.agent === selected;
          const delta = agent.probability - marketProbability;

          return (
            <button
              key={agent.agent}
              onClick={() => setSelected(agent.agent)}
              className={cn(
                "group relative bg-[#101318] px-4 py-4 text-left transition-colors",
                isActive ? "bg-[#161b23]" : "hover:bg-[#141820]"
              )}
            >
              <span
                className="absolute inset-x-0 top-0 h-[2px] transition-opacity"
                style={{
                  backgroundColor: m.accent,
                  opacity: isActive ? 1 : 0.18,
                }}
              />
              <div className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: m.accent }}
                />
                <span className="text-[12px] font-medium text-[#c4cad4]">
                  {m.name}
                </span>
              </div>

              <div className="mt-2 text-[28px] font-semibold leading-none tracking-tight tnum text-[#e9ecf1]">
                <AnimatedNumber value={agent.probability} suffix="%" />
              </div>

              <div className="mt-1 text-[11px] tnum text-[#646c7a]">
                {delta > 0 ? "+" : delta < 0 ? "−" : ""}
                {Math.abs(delta)} vs market
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-[#646c7a]">
                  <span>Confidence</span>
                  <span className="tnum">
                    {Math.round(agent.confidence * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#1e232c]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${agent.confidence * 100}%`,
                      backgroundColor: m.accent,
                      opacity: 0.75,
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#1e232c] bg-[#0d0f13] px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-medium"
            style={{
              backgroundColor: `${meta.accent}1a`,
              color: meta.accent,
            }}
          >
            {meta.name} Agent
          </span>
          <span className="text-[12px] text-[#646c7a]">{meta.mandate}</span>
        </div>

        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[#c4cad4]">
          {active.reasoningSummary}
        </p>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-[0.11em] text-[#646c7a]">
            {active.keyPointsLabel}
          </div>
          <ul className="mt-2 space-y-1.5">
            {active.keyPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-[13px] leading-relaxed text-[#949cab]"
              >
                <ChevronRight
                  className="mt-[3px] h-3.5 w-3.5 shrink-0"
                  style={{ color: meta.accent }}
                />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[#1e232c] pt-3 text-[11px] text-[#646c7a]">
          <span>Weight in aggregate</span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-[#1e232c]">
            <div
              className="h-full rounded-full bg-[#3a4150]"
              style={{ width: `${(active.weight / maxWeight) * 100}%` }}
            />
          </div>
          <span className="tnum">{Math.round(active.weight * 100)}%</span>
        </div>
      </div>
    </section>
  );
}
