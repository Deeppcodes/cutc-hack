"use client";

import * as React from "react";
import { AlertTriangle, ChevronDown, Minus, Plus } from "lucide-react";

import { SourceQualityBadge } from "@/components/SourceCard";
import { AGENTS } from "@/lib/agents";
import type { Evidence, Market } from "@/lib/types";
import { cn, signed } from "@/lib/utils";

function ContributionWaterfall({ market }: { market: Market }) {
  const signals = [
    ...market.forecast.keyPositiveSignals,
    ...market.forecast.keyNegativeSignals,
  ];
  const totalMagnitude = signals.reduce((a, s) => a + Math.abs(s.impact), 0);

  return (
    <div className="rounded-xl border border-[#1e232c] bg-[#0d0f13] p-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.11em] text-[#646c7a]">
            Market consensus
          </div>
          <div className="mt-1 text-[26px] font-semibold leading-none tnum text-[#8ba3ff]">
            {market.marketProbability}%
          </div>
        </div>
        <div className="pb-1 text-center text-[11px] text-[#646c7a]">
          {signals.length} weighted signals
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.11em] text-[#646c7a]">
            Contrary forecast
          </div>
          <div className="mt-1 text-[26px] font-semibold leading-none tnum text-[#f0b429]">
            {market.forecast.probability}%
          </div>
        </div>
      </div>

      <div className="mt-4 flex h-9 w-full overflow-hidden rounded-lg border border-[#1e232c]">
        {signals.map((s) => {
          const width = (Math.abs(s.impact) / totalMagnitude) * 100;
          const positive = s.impact > 0;
          return (
            <div
              key={s.id}
              title={`${s.title}: ${signed(s.impact)} points`}
              className={cn(
                "group relative flex items-center justify-center transition-opacity hover:opacity-100",
                positive ? "bg-[#3fb950]/25" : "bg-[#f0655a]/25",
                s.discounted && "opacity-60"
              )}
              style={{ width: `${width}%` }}
            >
              <span
                className={cn(
                  "text-[11px] font-semibold tnum",
                  positive ? "text-[#5fd06f]" : "text-[#f0847a]"
                )}
              >
                {signed(s.impact)}
              </span>
              <span className="absolute inset-y-0 right-0 w-px bg-[#08090b]/60" />
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#646c7a]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[#3fb950]/40" />
          Pushes toward YES
        </span>
        <span className="tnum">
          Net{" "}
          <span
            className={
              market.forecast.probability >= market.marketProbability
                ? "text-[#5fd06f]"
                : "text-[#f0847a]"
            }
          >
            {signed(market.forecast.probability - market.marketProbability)}{" "}
            points
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          Pushes toward NO
          <span className="h-2 w-2 rounded-sm bg-[#f0655a]/40" />
        </span>
      </div>
    </div>
  );
}

function SignalRow({
  signal,
  market,
}: {
  signal: Evidence;
  market: Market;
}) {
  const [open, setOpen] = React.useState(false);
  const positive = signal.impact > 0;
  const agent = AGENTS[signal.agent];
  const sources = market.sources.filter((s) =>
    signal.sourceIds.includes(s.id)
  );

  return (
    <div
      className={cn(
        "rounded-xl border bg-[#101318] transition-colors",
        open ? "border-[#2a303b]" : "border-[#1e232c] hover:border-[#252b36]"
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            positive
              ? "bg-[#3fb950]/12 text-[#5fd06f]"
              : "bg-[#f0655a]/12 text-[#f0847a]"
          )}
        >
          {positive ? (
            <Plus className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[14px] text-[#e9ecf1]">
              {signal.title}
            </span>
            {signal.discounted && (
              <AlertTriangle className="h-3 w-3 shrink-0 text-[#e07a5f]" />
            )}
          </span>
          <span className="mt-0.5 block text-[11px] text-[#646c7a]">
            {agent.name} Agent
            {sources.length > 0 &&
              ` · ${sources.length} source${sources.length === 1 ? "" : "s"}`}
          </span>
        </span>

        <span
          className={cn(
            "shrink-0 text-[17px] font-semibold tnum",
            positive ? "text-[#5fd06f]" : "text-[#f0847a]"
          )}
        >
          {signed(signal.impact)}%
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#646c7a] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-[#1e232c] px-4 py-3.5">
          <p className="text-[13px] leading-relaxed text-[#949cab]">
            {signal.explanation}
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#646c7a]">
            <span>Confidence</span>
            <span className="h-1 w-20 overflow-hidden rounded-full bg-[#1e232c]">
              <span
                className={cn(
                  "block h-full rounded-full",
                  positive ? "bg-[#3fb950]/70" : "bg-[#f0655a]/70"
                )}
                style={{ width: `${signal.confidence * 100}%` }}
              />
            </span>
            <span className="tnum">
              {Math.round(signal.confidence * 100)}%
            </span>
          </div>

          {signal.skepticNote && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#e07a5f]/20 bg-[#e07a5f]/[0.06] px-3 py-2">
              <AlertTriangle className="mt-[1px] h-3 w-3 shrink-0 text-[#e07a5f]" />
              <p className="text-[11.5px] leading-relaxed text-[#c08a76]">
                <span className="font-medium text-[#e07a5f]">
                  Skeptic Agent:{" "}
                </span>
                {signal.skepticNote}
              </p>
            </div>
          )}

          {sources.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-[#1a1f27] bg-[#0d0f13] px-3 py-2"
                >
                  <SourceQualityBadge quality={s.quality} />
                  <span className="text-[12px] text-[#949cab]">
                    {s.publication}
                  </span>
                  <span className="truncate text-[12px] text-[#646c7a]">
                    {s.headline}
                  </span>
                </div>
              ))}
            </div>
          )}

          {sources.length === 0 && (
            <p className="mt-3 text-[11.5px] text-[#646c7a]">
              Derived from historical reference classes rather than a single
              published source.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function EvidencePanel({ market }: { market: Market }) {
  const { keyPositiveSignals, keyNegativeSignals } = market.forecast;

  return (
    <section className="panel p-6">
      <header>
        <h2 className="text-[22px] font-semibold tracking-tight text-[#e9ecf1]">
          Why we disagree
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-[#949cab]">
          {market.forecast.forecastExplanation}
        </p>
      </header>

      <div className="mt-5">
        <ContributionWaterfall market={market} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.09em] text-[#5fd06f]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
            Pushes toward YES
          </div>
          <div className="space-y-2">
            {keyPositiveSignals.map((s) => (
              <SignalRow key={s.id} signal={s} market={market} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.09em] text-[#f0847a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f0655a]" />
            Pushes toward NO
          </div>
          <div className="space-y-2">
            {keyNegativeSignals.map((s) => (
              <SignalRow key={s.id} signal={s} market={market} />
            ))}
          </div>
        </div>
      </div>

      {market.forecast.uncertainties.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#1e232c] bg-[#0d0f13] p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.09em] text-[#646c7a]">
            What could make this wrong
          </div>
          <ul className="mt-2.5 space-y-2">
            {market.forecast.uncertainties.map((u) => (
              <li
                key={u}
                className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#949cab]"
              >
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#646c7a]" />
                {u}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
