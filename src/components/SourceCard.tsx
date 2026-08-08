import {
  AlertTriangle,
  Copy,
  FileCheck2,
  HelpCircle,
  Newspaper,
} from "lucide-react";

import type { Source, SourceQuality } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const QUALITY: Record<
  SourceQuality,
  { label: string; className: string; Icon: typeof FileCheck2 }
> = {
  primary: {
    label: "Primary",
    className: "border-[#3fb950]/25 bg-[#3fb950]/10 text-[#5fd06f]",
    Icon: FileCheck2,
  },
  "reliable-secondary": {
    label: "Reliable secondary",
    className: "border-[#6b8aff]/25 bg-[#6b8aff]/10 text-[#8ba3ff]",
    Icon: Newspaper,
  },
  unverified: {
    label: "Unverified",
    className: "border-[#f0b429]/25 bg-[#f0b429]/10 text-[#f0b429]",
    Icon: HelpCircle,
  },
  duplicate: {
    label: "Duplicate",
    className: "border-[#f0655a]/25 bg-[#f0655a]/10 text-[#f0847a]",
    Icon: Copy,
  },
};

export function SourceQualityBadge({ quality }: { quality: SourceQuality }) {
  const q = QUALITY[quality];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        q.className
      )}
    >
      <q.Icon className="h-2.5 w-2.5" />
      {q.label}
    </span>
  );
}

export function SourceCard({ source }: { source: Source }) {
  const weakened =
    source.quality === "duplicate" || source.quality === "unverified";

  return (
    <article
      className={cn(
        "rounded-xl border border-[#1e232c] bg-[#101318] p-4 transition-colors hover:border-[#2a303b]",
        weakened && "opacity-80"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#646c7a]">
            {source.publication}
          </div>
          <h4 className="mt-1.5 text-[14px] leading-snug text-[#e9ecf1]">
            {source.headline}
          </h4>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold",
            source.supports === "YES"
              ? "border-[#3fb950]/25 bg-[#3fb950]/10 text-[#5fd06f]"
              : source.supports === "NO"
                ? "border-[#f0655a]/25 bg-[#f0655a]/10 text-[#f0847a]"
                : "border-[#2a303b] text-[#949cab]"
          )}
        >
          {source.supports}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SourceQualityBadge quality={source.quality} />
        <span className="text-[11px] text-[#646c7a]">
          {formatDate(source.date)}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-[#646c7a]">
          Relevance
          <span className="h-1 w-12 overflow-hidden rounded-full bg-[#1e232c]">
            <span
              className="block h-full rounded-full bg-[#3a4150]"
              style={{ width: `${source.relevance * 100}%` }}
            />
          </span>
          <span className="tnum">{Math.round(source.relevance * 100)}</span>
        </span>
      </div>

      {source.skepticFlag && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#e07a5f]/20 bg-[#e07a5f]/[0.06] px-3 py-2">
          <AlertTriangle className="mt-[1px] h-3 w-3 shrink-0 text-[#e07a5f]" />
          <p className="text-[11.5px] leading-relaxed text-[#c08a76]">
            <span className="font-medium text-[#e07a5f]">Skeptic Agent: </span>
            {source.skepticFlag}
          </p>
        </div>
      )}
    </article>
  );
}
