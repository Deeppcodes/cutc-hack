"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function AnimatedNumber({
  value,
  duration = 700,
  decimals = 0,
  suffix = "",
  className,
}: Props) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  const frameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(from + (value - from) * easeOut(t));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return (
    <span className={cn("tnum", className)}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
