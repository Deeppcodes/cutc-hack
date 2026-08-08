"use client";

import * as React from "react";

import { PredictionCard } from "@/components/PredictionCard";
import { searchMarkets, sortMarkets } from "@/lib/api";
import { CATEGORIES, SORT_OPTIONS, type Market, type SortKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS = ["All", ...CATEGORIES] as const;

export function DiscoverBoard({
  markets,
  query,
}: {
  markets: Market[];
  query: string;
}) {
  const [category, setCategory] = React.useState<(typeof FILTERS)[number]>(
    "All"
  );
  const [sort, setSort] = React.useState<SortKey>("trending");

  const visible = React.useMemo(() => {
    let list = searchMarkets(markets, query);
    if (category !== "All") list = list.filter((m) => m.category === category);
    return sortMarkets(list, sort);
  }, [markets, query, category, sort]);

  const widest = React.useMemo(
    () =>
      markets.reduce(
        (max, m) => Math.max(max, m.forecast.disagreementScore),
        0
      ),
    [markets]
  );

  return (
    <section className="mx-auto max-w-[1240px] px-5 pb-20 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[#1e232c] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setCategory(f)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                category === f
                  ? "border-[#3a4150] bg-[#1c212a] text-[#e9ecf1]"
                  : "border-[#1e232c] text-[#949cab] hover:border-[#2a303b] hover:text-[#e9ecf1]"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.09em] text-[#646c7a]">
            Sort
          </span>
          <div className="flex rounded-lg border border-[#1e232c] p-0.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={cn(
                  "whitespace-nowrap rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors",
                  sort === opt.key
                    ? "bg-[#1c212a] text-[#e9ecf1]"
                    : "text-[#646c7a] hover:text-[#e9ecf1]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-4 text-[12px] text-[#646c7a]">
        <span className="tnum">
          {visible.length} forecast{visible.length === 1 ? "" : "s"}
          {query ? ` matching “${query}”` : ""}
        </span>
        <span className="tnum">
          Widest disagreement today:{" "}
          <span className="text-[#f0b429]">{widest} points</span>
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center gap-2 py-20 text-center">
          <p className="text-[15px] text-[#e9ecf1]">No forecasts match</p>
          <p className="text-[13px] text-[#646c7a]">
            Try a different category or clear the search.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => (
            <PredictionCard key={m.id} market={m} />
          ))}
        </div>
      )}
    </section>
  );
}
