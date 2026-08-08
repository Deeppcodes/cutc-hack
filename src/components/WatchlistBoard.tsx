"use client";

import Link from "next/link";
import * as React from "react";

import { PredictionCard } from "@/components/PredictionCard";
import { Button } from "@/components/ui/button";
import { searchMarkets } from "@/lib/api";
import type { Market } from "@/lib/types";
import { useWatchlist } from "@/lib/use-watchlist";

export function WatchlistBoard({
  markets,
  query,
}: {
  markets: Market[];
  query: string;
}) {
  const { ids, ready } = useWatchlist();

  const saved = React.useMemo(() => {
    const list = markets.filter((m) => ids.includes(m.id));
    return searchMarkets(list, query).sort(
      (a, b) => b.forecast.disagreementScore - a.forecast.disagreementScore
    );
  }, [markets, ids, query]);

  if (!ready) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="shimmer h-[264px] rounded-[14px] border border-[#1e232c] bg-[#0d0f13]"
          />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="panel flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-[15px] text-[#e9ecf1]">Your watchlist is empty</p>
        <p className="max-w-sm text-[13px] leading-relaxed text-[#646c7a]">
          Open any forecast and add it to your watchlist to track how the
          disagreement with consensus develops.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Browse forecasts</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="pb-4 text-[12px] tnum text-[#646c7a]">
        {saved.length} tracked forecast{saved.length === 1 ? "" : "s"}, sorted
        by disagreement
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {saved.map((m) => (
          <PredictionCard key={m.id} market={m} />
        ))}
      </div>
    </>
  );
}
