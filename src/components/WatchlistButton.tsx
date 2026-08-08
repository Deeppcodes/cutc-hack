"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/lib/use-watchlist";
import { cn } from "@/lib/utils";

export function WatchlistButton({ marketId }: { marketId: string }) {
  const { has, toggle, ready } = useWatchlist();
  const saved = ready && has(marketId);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toggle(marketId)}
      aria-pressed={saved}
    >
      <Star
        className={cn(
          "h-3.5 w-3.5 transition-colors",
          saved ? "fill-[#f0b429] text-[#f0b429]" : "text-[#949cab]"
        )}
      />
      {saved ? "In watchlist" : "Add to watchlist"}
    </Button>
  );
}
