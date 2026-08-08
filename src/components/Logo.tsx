import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10.25" stroke="#2a303b" strokeWidth="1.5" />
        <path
          d="M3.2 15.2C6.4 15.2 8 8.8 12 8.8s5.6 6.4 8.8 6.4"
          stroke="#6b8aff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M3.2 9.4C6.4 9.4 8 15.6 12 15.6s5.6-6.2 8.8-6.2"
          stroke="#f0b429"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="2.6 2.6"
        />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-[#e9ecf1]">
        Contrary
      </span>
    </span>
  );
}
