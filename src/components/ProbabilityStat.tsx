import type { ReactNode } from "react";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { SectionLabel } from "@/components/ui/section-label";
import { cn } from "@/lib/utils";

const TONES = {
  market: { label: "Market", color: "#6b8aff", value: "text-[#e9ecf1]" },
  contrary: { label: "Contrary", color: "#f0b429", value: "text-[#f0b429]" },
} as const;

export function ProbabilityStat({
  tone,
  value,
  size = "md",
  animate = false,
  label,
  footer,
}: {
  tone: keyof typeof TONES;
  value: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  label?: string;
  footer?: ReactNode;
}) {
  const t = TONES[tone];
  const sizeClass =
    size === "lg"
      ? "text-[52px] tracking-[-0.03em]"
      : size === "sm"
        ? "text-[28px]"
        : "text-[32px]";

  return (
    <div>
      <SectionLabel dot={t.color}>{label ?? t.label}</SectionLabel>
      <div
        className={cn(
          "mt-1.5 font-semibold leading-none tracking-tight tnum",
          sizeClass,
          t.value
        )}
      >
        {animate ? (
          <AnimatedNumber value={value} suffix="%" />
        ) : (
          <>{value}%</>
        )}
      </div>
      {footer && <div className="mt-1.5">{footer}</div>}
    </div>
  );
}
