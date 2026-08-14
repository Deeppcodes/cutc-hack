import Link from "next/link";
import { TrendingDown, TrendingUp, Users } from "lucide-react";

import { ProbabilityStat } from "@/components/ProbabilityStat";
import { Sparkline } from "@/components/Sparkline";
import { Badge } from "@/components/ui/badge";
import type { Market } from "@/lib/types";
import {
  cn,
  disagreementTone,
  formatCompact,
  formatVolume,
  signed,
} from "@/lib/utils";

export function PredictionCard({ market }: { market: Market }) {
  const { forecast } = market;
  const gap = forecast.probability - market.marketProbability;
  const tone = disagreementTone(forecast.disagreementScore);
  const rising = market.change7d >= 0;

  return (
    <Link
      href={`/forecast/${market.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[14px] border bg-[#101318]/90 p-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:bg-[#141820]",
        tone === "high"
          ? "border-[#f0b429]/35 shadow-[0_0_0_1px_rgba(240,180,41,0.06),0_18px_40px_-24px_rgba(240,180,41,0.35)] hover:border-[#f0b429]/55"
          : "border-[#1e232c] hover:border-[#2a303b]"
      )}
    >
      {tone === "high" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0b429]/60 to-transparent" />
      )}

      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">{market.category}</Badge>
        <div className="flex items-center gap-3 text-[11px] text-[#646c7a] tnum">
          <span>{formatVolume(market.volume)}</span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatCompact(market.forecasters)}
          </span>
        </div>
      </div>

      <h3 className="mt-3 text-[15px] font-medium leading-snug text-[#e9ecf1] text-balance">
        {market.question}
      </h3>

      <div className="mt-4 -mx-1">
        <Sparkline data={market.history} id={market.id} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#1e232c] pt-4">
        <ProbabilityStat
          tone="market"
          value={market.marketProbability}
          size="sm"
          footer={
            <div
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium tnum",
                rising ? "text-[#5fd06f]" : "text-[#f0847a]"
              )}
            >
              {rising ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {signed(market.change7d)}% this week
            </div>
          }
        />
        <ProbabilityStat
          tone="contrary"
          value={forecast.probability}
          size="sm"
          footer={
            <Badge
              variant={tone === "high" ? "contrary" : "default"}
              className="tnum"
            >
              {signed(gap)}% disagreement
            </Badge>
          }
        />
      </div>
    </Link>
  );
}
