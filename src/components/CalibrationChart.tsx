"use client";

import {
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import type { CalibrationBucket } from "@/lib/types";

interface Point {
  predicted: number;
  actual: number;
  count: number;
}

function CalTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: Point }[];
}) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="rounded-lg border border-[#2a303b] bg-[#0d0f13]/95 px-3 py-2 text-[12px] shadow-xl backdrop-blur">
      <div className="text-[#949cab]">
        Forecast <span className="tnum text-[#e9ecf1]">{p.predicted}%</span>
      </div>
      <div className="text-[#949cab]">
        Occurred <span className="tnum text-[#f0b429]">{p.actual}%</span>
      </div>
      <div className="mt-1 text-[11px] tnum text-[#646c7a]">
        {p.count} forecasts in this band
      </div>
    </div>
  );
}

export function CalibrationChart({
  buckets,
}: {
  buckets: CalibrationBucket[];
}) {
  const data: Point[] = buckets.map((b) => ({
    predicted: Math.round(b.predicted * 100),
    actual: Math.round(b.actual * 100),
    count: b.count,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 12, bottom: 6, left: -14 }}
        >
          <CartesianGrid stroke="#1a1f27" vertical={false} />
          <XAxis
            type="number"
            dataKey="predicted"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fill: "#646c7a", fontSize: 11 }}
            axisLine={{ stroke: "#1e232c" }}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="actual"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fill: "#646c7a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <ZAxis type="number" dataKey="count" range={[40, 240]} />
          <ReferenceLine
            segment={[
              { x: 0, y: 0 },
              { x: 100, y: 100 },
            ]}
            stroke="#3a4150"
            strokeDasharray="5 5"
          />
          <Tooltip content={<CalTooltip />} cursor={false} />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#f0b429"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Scatter dataKey="actual" fill="#f0b429" fillOpacity={0.85} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
