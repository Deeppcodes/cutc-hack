"use client";

import * as React from "react";
import { Eye, History, Pause, Play, Zap } from "lucide-react";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ChartLegend, ProbabilityChart } from "@/components/ProbabilityChart";
import { SourceQualityBadge } from "@/components/SourceCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Market } from "@/lib/types";
import { cn, formatDate, formatMonthYear, signed } from "@/lib/utils";

export function TimeMachine({ market }: { market: Market }) {
  const snapshots = market.timeline ?? [];
  const [index, setIndex] = React.useState(snapshots.length - 1);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIndex((i) => {
        if (i >= snapshots.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 1400);
    return () => clearInterval(timer);
  }, [playing, snapshots.length]);

  if (snapshots.length === 0) return null;

  const snap = snapshots[index];
  const isPresent = index === snapshots.length - 1;
  const gap = snap.contraryProbability - snap.marketProbability;
  const knownSources = market.sources.filter((s) => s.date <= snap.date);

  function play() {
    if (index >= snapshots.length - 1) setIndex(0);
    setPlaying(true);
  }

  return (
    <section className="panel overflow-hidden">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1e232c] px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#f0b429]" />
            <h2 className="text-[22px] font-semibold tracking-tight text-[#e9ecf1]">
              Time Machine
            </h2>
          </div>
          <p className="mt-1.5 max-w-xl text-[13px] text-[#949cab]">
            Rewind to any point and see only what was knowable then. Nothing
            published after the selected date is used.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => (playing ? setPlaying(false) : play())}
        >
          {playing ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              Replay the year
            </>
          )}
        </Button>
      </header>

      <div className="border-b border-[#1e232c] px-6 pb-5 pt-6">
        <div className="flex items-baseline justify-between">
          <div className="text-[26px] font-semibold tracking-tight text-[#e9ecf1]">
            {formatDate(snap.date)}
            {isPresent && (
              <span className="ml-2 text-[12px] font-medium uppercase tracking-[0.1em] text-[#5fd06f]">
                Today
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#646c7a]">
            Snapshot {index + 1} of {snapshots.length}
          </div>
        </div>

        <div className="mt-5">
          <Slider
            value={[index]}
            onValueChange={([v]) => {
              setPlaying(false);
              setIndex(v);
            }}
            min={0}
            max={snapshots.length - 1}
            step={1}
          />
          <div className="mt-3 flex justify-between">
            {snapshots.map((s, i) => (
              <button
                key={s.date}
                onClick={() => {
                  setPlaying(false);
                  setIndex(i);
                }}
                className={cn(
                  "text-[11px] transition-colors",
                  i === index
                    ? "font-medium text-[#f0b429]"
                    : "text-[#646c7a] hover:text-[#949cab]"
                )}
              >
                {i === snapshots.length - 1
                  ? "Today"
                  : formatMonthYear(s.date).split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-[#1e232c] lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="bg-[#101318] p-6">
          <div className="flex items-center justify-between">
            <ChartLegend />
            <span className="text-[11px] text-[#646c7a]">
              Data through {formatDate(snap.date, false)}
            </span>
          </div>
          <div className="mt-3">
            <ProbabilityChart
              data={market.history}
              cutoff={snap.date}
              height={252}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 bg-[#0d0f13] p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[#646c7a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6b8aff]" />
                Market
              </div>
              <div className="mt-1 text-[32px] font-semibold leading-none tracking-tight text-[#e9ecf1]">
                <AnimatedNumber value={snap.marketProbability} suffix="%" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[#646c7a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f0b429]" />
                Contrary
              </div>
              <div className="mt-1 text-[32px] font-semibold leading-none tracking-tight text-[#f0b429]">
                <AnimatedNumber value={snap.contraryProbability} suffix="%" />
              </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-[12px] tnum",
              Math.abs(gap) >= 12
                ? "border-[#f0b429]/25 bg-[#f0b429]/[0.07] text-[#f0b429]"
                : "border-[#1e232c] bg-[#101318] text-[#949cab]"
            )}
          >
            {signed(gap)} points of disagreement
          </div>

          <p className="text-[13px] leading-relaxed text-[#c4cad4]">
            {snap.stance}
          </p>

          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[#646c7a]">
              <Eye className="h-3 w-3" />
              What Contrary noticed
            </div>
            <ul className="mt-2 space-y-1.5">
              {snap.evidenceAvailable.map((e) => (
                <li
                  key={e}
                  className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#949cab]"
                >
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#f0b429]" />
                  {e}
                </li>
              ))}
            </ul>
          </div>

          {snap.events.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[#646c7a]">
                <Zap className="h-3 w-3" />
                Events that moved the forecast
              </div>
              <div className="mt-2 space-y-2">
                {snap.events.map((e) => (
                  <div
                    key={e.title}
                    className="rounded-lg border border-[#1e232c] bg-[#101318] px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[12.5px] font-medium text-[#e9ecf1]">
                        {e.title}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[12px] font-semibold tnum",
                          e.impact > 0 ? "text-[#5fd06f]" : "text-[#f0847a]"
                        )}
                      >
                        {signed(e.impact)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-[#646c7a]">
                      {e.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto border-t border-[#1e232c] pt-4">
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#646c7a]">
              Sources available on this date ({knownSources.length})
            </div>
            <div className="mt-2 space-y-1.5">
              {knownSources.length === 0 && (
                <p className="text-[12px] text-[#646c7a]">
                  No published sources yet at this point in the timeline.
                </p>
              )}
              {knownSources.slice(-4).map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <SourceQualityBadge quality={s.quality} />
                  <span className="truncate text-[11.5px] text-[#949cab]">
                    {s.publication}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
