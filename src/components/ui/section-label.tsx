import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#646c7a]",
        className
      )}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </div>
  );
}
