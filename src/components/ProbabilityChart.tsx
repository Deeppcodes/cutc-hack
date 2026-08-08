"use client";

import * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PricePoint } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  data: PricePoint[];
  height?: number;
  /** Truncates the series, so the Time Machine cannot show future data. */
  cutoff?: string;
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const market = payload.find((p) => p.dataKey === "market")?.value;
  const contrary = payload.find((p) => p.dataKey === "contrary")?.value;
  if (market == null || contrary == null) return null;

  return (
    <div className="rounded-lg border border-[#2a303b] bg-[#0d0f13]/95 px-3 py-2 shadow-xl backdrop-blur">
      <div className="text-[11px] text-[#646c7a]">{formatDate(label)}</div>
      <div className="mt-1.5 flex items-center gap-4 text-[12px]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#6b8aff]" />
          <span className="text-[#949cab]">Market</span>
          <span className="tnum text-[#e9ecf1]">{market.toFixed(0)}%</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#f0b429]" />
          <span className="text-[#949cab]">Contrary</span>
          <span className="tnum text-[#f0b429]">{contrary.toFixed(0)}%</span>
        </span>
      </div>
      <div className="mt-1 text-[11px] tnum text-[#646c7a]">
        Gap {Math.abs(market - contrary).toFixed(0)} points
      </div>
    </div>
  );
}

export function ProbabilityChart({ data, height = 300, cutoff }: Props) {
  const visible = React.useMemo(
    () => (cutoff ? data.filter((d) => d.date <= cutoff) : data),
    [data, cutoff]
  );

  const domain = React.useMemo(() => {
    const all = data.flatMap((d) => [d.market, d.contrary]);
    const min = Math.max(0, Math.floor(Math.min(...all) / 10) * 10 - 5);
    const max = Math.min(100, Math.ceil(Math.max(...all) / 10) * 10 + 5);
    return [min, max] as [number, number];
  }, [data]);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={visible}
          margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
        >
          <defs>
            <linearGradient id="marketArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6b8aff" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#6b8aff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#1a1f27"
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => formatDate(v, false)}
            tick={{ fill: "#646c7a", fontSize: 11 }}
            axisLine={{ stroke: "#1e232c" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={domain}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fill: "#646c7a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <ReferenceLine y={50} stroke="#232833" strokeDasharray="4 4" />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "#3a4150", strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey="market"
            stroke="none"
            fill="url(#marketArea)"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="market"
            stroke="#6b8aff"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="contrary"
            stroke="#f0b429"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartLegend() {
  return (
    <div className="flex items-center gap-5 text-[12px]">
      <span className="flex items-center gap-2 text-[#949cab]">
        <span className="h-[2px] w-5 rounded bg-[#6b8aff]" />
        Market consensus
      </span>
      <span className="flex items-center gap-2 text-[#949cab]">
        <span
          className="h-[2px] w-5 rounded"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,#f0b429 0 5px,transparent 5px 9px)",
          }}
        />
        Contrary forecast
      </span>
    </div>
  );
}
