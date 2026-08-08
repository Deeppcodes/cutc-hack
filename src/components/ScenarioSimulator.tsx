"use client";

import * as React from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Scenario } from "@/lib/types";
import { clamp, cn, signed } from "@/lib/utils";

export function ScenarioSimulator({
  baseProbability,
  marketProbability,
  scenarios,
}: {
  baseProbability: number;
  marketProbability: number;
  scenarios: Scenario[];
}) {
  const [active, setActive] = React.useState<Record<string, boolean>>({});

  const adjusted = React.useMemo(() => {
    const shift = scenarios
      .filter((s) => active[s.id])
      .reduce((a, s) => a + s.shift, 0);
    return clamp(Math.round(baseProbability + shift));
  }, [active, scenarios, baseProbability]);

  const activeCount = Object.values(active).filter(Boolean).length;
  const delta = adjusted - baseProbability;

  return (
    <section className="panel overflow-hidden">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1e232c] px-6 py-5">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight text-[#e9ecf1]">
            What would change the forecast?
          </h2>
          <p className="mt-1.5 max-w-xl text-[13px] text-[#949cab]">
            Toggle a scenario to see how Contrary would revise its probability
            if that development were confirmed.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.11em] text-[#646c7a]">
              Current
            </div>
            <div className="mt-0.5 text-[22px] font-semibold leading-none tnum text-[#949cab]">
              {baseProbability}%
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#3a4150]" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.11em] text-[#646c7a]">
              With scenarios
            </div>
            <div
              className={cn(
                "mt-0.5 text-[34px] font-semibold leading-none tracking-tight transition-colors",
                delta > 0
                  ? "text-[#5fd06f]"
                  : delta < 0
                    ? "text-[#f0847a]"
                    : "text-[#f0b429]"
              )}
            >
              <AnimatedNumber value={adjusted} suffix="%" />
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-[#1e232c] px-6 py-4">
        <div className="relative h-2 overflow-hidden rounded-full bg-[#151920]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#f0b429]/25 transition-all duration-700"
            style={{ width: `${baseProbability}%` }}
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
              delta >= 0 ? "bg-[#3fb950]" : "bg-[#f0655a]"
            )}
            style={{
              width: `${Math.min(baseProbability, adjusted)}%`,
              opacity: 0.9,
            }}
          />
          <div
            className={cn(
              "absolute inset-y-0 rounded-full transition-all duration-700",
              delta >= 0 ? "bg-[#3fb950]/50" : "bg-[#f0655a]/50"
            )}
            style={{
              left: `${Math.min(baseProbability, adjusted)}%`,
              width: `${Math.abs(delta)}%`,
            }}
          />
          <div
            className="absolute inset-y-0 w-px bg-[#8ba3ff]"
            style={{ left: `${marketProbability}%` }}
            title={`Market consensus ${marketProbability}%`}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-[#646c7a]">
          <span>
            {activeCount === 0
              ? "No scenarios applied"
              : `${activeCount} scenario${activeCount === 1 ? "" : "s"} applied · ${signed(delta)} points`}
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-px bg-[#8ba3ff]" />
              Market {marketProbability}%
            </span>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActive({})}
                className="h-6 px-2 text-[11px]"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </span>
        </div>
      </div>

      <div className="grid gap-px bg-[#1e232c] sm:grid-cols-2">
        {scenarios.map((s) => {
          const on = Boolean(active[s.id]);
          const outcome = clamp(baseProbability + s.shift);
          return (
            <label
              key={s.id}
              className={cn(
                "group flex cursor-pointer flex-col gap-3 bg-[#101318] p-5 transition-colors",
                on ? "bg-[#15181f]" : "hover:bg-[#131720]"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium leading-snug text-[#e9ecf1]">
                    {s.title}
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#646c7a]">
                    {s.detail}
                  </p>
                </div>
                <Switch
                  checked={on}
                  onCheckedChange={(v) =>
                    setActive((prev) => ({ ...prev, [s.id]: v }))
                  }
                  aria-label={`Apply scenario: ${s.title}`}
                />
              </div>

              <div className="flex items-center justify-between border-t border-[#1a1f27] pt-3">
                <div className="flex items-center gap-2 text-[15px] font-semibold tnum">
                  <span className="text-[#646c7a]">{baseProbability}%</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#3a4150]" />
                  <span
                    className={
                      s.shift > 0 ? "text-[#5fd06f]" : "text-[#f0847a]"
                    }
                  >
                    {outcome}%
                  </span>
                </div>
                <span className="text-[11px] tnum text-[#646c7a]">
                  {Math.round(s.likelihood * 100)}% likely
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
