"use client";

import Link from "next/link";

import { AGENTS } from "@/lib/agents";
import { lensIsSet, readingForLens, whyThisMatters, type Lens } from "@/lib/lens";
import type { Forecast, Market } from "@/lib/types";

export function ForYouNote({
  market,
  forecast,
  lens,
  liveNote,
}: {
  market: Market;
  forecast: Forecast;
  lens: Lens;
  liveNote?: string;
}) {
  if (!lensIsSet(lens)) {
    return (
      <section className="panel mt-6 px-6 py-5">
        <p className="text-[14px] text-[#c4cad4]">
          Set a lens and this page will tell you why the question matters for
          you, plus a second reading if you weight one agent more.{" "}
          <Link href="/lens" className="text-[#f0b429] hover:underline">
            Set your lens
          </Link>
        </p>
      </section>
    );
  }

  const yours = readingForLens(forecast, lens);
  const official = forecast.probability;
  const focus =
    lens.trustedAgent === "balanced"
      ? "general view"
      : AGENTS[lens.trustedAgent].name;

  return (
    <section className="panel mt-6 px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#f0b429]">
            For you
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-[#c4cad4]">
            {liveNote || whyThisMatters({ ...market, forecast }, lens)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.1em] text-[#646c7a]">
            Your reading
          </div>
          <div className="mt-1 text-[32px] font-semibold leading-none tracking-tight tnum text-[#f0b429]">
            {yours}%
          </div>
          <div className="mt-1.5 text-[12px] text-[#646c7a]">
            Official Contrary {official}%
            {lens.trustedAgent === "balanced"
              ? " · general view"
              : ` · extra weight on ${focus}`}
          </div>
        </div>
      </div>
    </section>
  );
}
