"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

export function Slider({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-[3px] w-full grow overflow-hidden rounded-full bg-[#252b36]">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#6b8aff]/60 to-[#f0b429]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label="Timeline position"
        className="block h-4 w-4 rounded-full border-2 border-[#f0b429] bg-[#0b0d10] shadow-[0_0_0_4px_rgba(240,180,41,0.12)] transition-shadow hover:shadow-[0_0_0_6px_rgba(240,180,41,0.18)]"
      />
    </SliderPrimitive.Root>
  );
}
