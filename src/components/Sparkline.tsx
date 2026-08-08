import type { PricePoint } from "@/lib/types";

interface Props {
  data: PricePoint[];
  width?: number;
  height?: number;
  id: string;
}

export function Sparkline({ data, width = 220, height = 44, id }: Props) {
  const points = data.slice(-26);
  const market = points.map((p) => p.market);
  const contrary = points.map((p) => p.contrary);

  const all = [...market, ...contrary];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = Math.max(1, max - min);
  const scale = (v: number) => 2 + (1 - (v - min) / range) * (height - 4);

  const marketPath = market
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${((i / (market.length - 1)) * width).toFixed(
          1
        )},${scale(v).toFixed(1)}`
    )
    .join(" ");

  const contraryPath = contrary
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${((i / (contrary.length - 1)) * width).toFixed(
          1
        )},${scale(v).toFixed(1)}`
    )
    .join(" ");

  const fillId = `spark-fill-${id}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b8aff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6b8aff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${marketPath} L${width},${height} L0,${height} Z`}
        fill={`url(#${fillId})`}
      />
      <path
        d={contraryPath}
        fill="none"
        stroke="#f0b429"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
      <path
        d={marketPath}
        fill="none"
        stroke="#6b8aff"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
