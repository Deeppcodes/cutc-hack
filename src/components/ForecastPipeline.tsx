"use client";

import { Check, Loader2 } from "lucide-react";

import { PIPELINE_STAGES } from "@/lib/agents";
import { cn } from "@/lib/utils";

export function ForecastPipeline({
  stage,
  live = false,
}: {
  stage: number;
  live?: boolean;
}) {
  return (
    <section className="panel px-6 py-8">
      <div className="flex items-center gap-2.5">
        <Loader2 className="h-4 w-4 animate-spin text-[#f0b429]" />
        <h2 className="text-[15px] font-medium text-[#e9ecf1]">
          {live ? "Running five agents on Backboard" : "Running the forecast"}
        </h2>
        {live && (
          <span className="text-[12px] text-[#646c7a]">
            Independent runs, up to 30 seconds
          </span>
        )}
      </div>

      <ol className="mt-5 space-y-2.5">
        {PIPELINE_STAGES.map((label, i) => {
          const done = i < stage;
          const current = i === stage;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-3 text-[13.5px] transition-all duration-300",
                done && "text-[#646c7a]",
                current && "text-[#e9ecf1]",
                !done && !current && "text-[#3a4150]"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  done && "border-[#3fb950]/40 bg-[#3fb950]/10",
                  current && "border-[#f0b429] bg-[#f0b429]/10",
                  !done && !current && "border-[#252b36]"
                )}
              >
                {done && <Check className="h-2.5 w-2.5 text-[#5fd06f]" />}
                {current && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f0b429]" />
                )}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="shimmer h-[86px] rounded-xl border border-[#1e232c] bg-[#0d0f13]"
          />
        ))}
      </div>
    </section>
  );
}
