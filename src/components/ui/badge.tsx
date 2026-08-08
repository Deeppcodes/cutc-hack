import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border-[#2a303b] bg-[#151920] text-[#949cab]",
        outline: "border-[#2a303b] bg-transparent text-[#949cab]",
        pos: "border-[#3fb950]/25 bg-[#3fb950]/10 text-[#5fd06f]",
        neg: "border-[#f0655a]/25 bg-[#f0655a]/10 text-[#f0847a]",
        contrary: "border-[#f0b429]/30 bg-[#f0b429]/10 text-[#f0b429]",
        market: "border-[#6b8aff]/30 bg-[#6b8aff]/10 text-[#8ba3ff]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
