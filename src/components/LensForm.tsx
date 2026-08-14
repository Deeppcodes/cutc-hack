"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { syncLens } from "@/lib/api";
import { emptyLens, LENSES, lensIsSet, type Lens } from "@/lib/lens";
import { CATEGORIES, type Category } from "@/lib/types";
import { useLens } from "@/lib/use-lens";
import { cn } from "@/lib/utils";

export function LensForm() {
  const { lens, ready, save, clear } = useLens();
  const [draft, setDraft] = React.useState<Lens>(lens);
  const [status, setStatus] = React.useState<
    "idle" | "saving" | "saved" | "local" | "cleared"
  >("idle");

  React.useEffect(() => {
    if (ready) setDraft(lens);
  }, [ready, lens]);

  function toggleCategory(cat: Category) {
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(cat)
        ? d.categories.filter((c) => c !== cat)
        : [...d.categories, cat],
    }));
  }

  async function onSave() {
    setStatus("saving");
    save(draft);
    const result = await syncLens(draft);
    const next = {
      ...draft,
      assistantId: result.assistantId ?? draft.assistantId,
    };
    save(next);
    setDraft(next);
    setStatus(result.synced ? "saved" : "local");
  }

  function onClear() {
    clear();
    setDraft(emptyLens());
    setStatus("cleared");
  }

  if (!ready) {
    return (
      <div className="shimmer h-64 rounded-[14px] border border-[#1e232c] bg-[#0d0f13]" />
    );
  }

  return (
    <div className="panel space-y-7 p-6">
      <div>
        <label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#646c7a]">
          What should we call you
        </label>
        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="e.g. Deepika"
          className="mt-2 h-10 w-full rounded-lg border border-[#1e232c] bg-[#0d0f13] px-3 text-[14px] text-[#e9ecf1] placeholder:text-[#646c7a] focus:border-[#2a303b] focus:outline-none"
        />
      </div>

      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#646c7a]">
          Categories you follow
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const on = draft.categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  on
                    ? "border-[#f0b429]/40 bg-[#f0b429]/10 text-[#f0b429]"
                    : "border-[#1e232c] text-[#949cab] hover:border-[#2a303b] hover:text-[#e9ecf1]"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#646c7a]">
          How should we weight the agents
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {LENSES.map((option) => {
            const on = draft.trustedAgent === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  setDraft((d) => ({ ...d, trustedAgent: option.id }))
                }
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  on
                    ? "border-[#f0b429]/35 bg-[#15130d]"
                    : "border-[#1e232c] bg-[#0d0f13] hover:border-[#2a303b]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: option.accent }}
                  />
                  <span className="text-[14px] font-medium text-[#e9ecf1]">
                    {option.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#646c7a]">
                  {option.blurb}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#646c7a]">
          Anything else the agents should remember
        </label>
        <textarea
          value={draft.note}
          onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
          placeholder="e.g. I work on model evals. I care more about general availability than announcements."
          rows={3}
          className="mt-2 w-full rounded-lg border border-[#1e232c] bg-[#0d0f13] px-3 py-2 text-[14px] leading-relaxed text-[#e9ecf1] placeholder:text-[#646c7a] focus:border-[#2a303b] focus:outline-none"
        />
        <p className="mt-2 text-[12px] text-[#646c7a]">
          Saved on this device. If Backboard is configured, it is also stored as
          assistant memory and used on the next live run.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onSave} disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save my lens"}
        </Button>
        {(lensIsSet(draft) || lensIsSet(lens)) && (
          <Button variant="outline" onClick={onClear} type="button">
            Clear lens
          </Button>
        )}
        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-[13px] text-[#5fd06f]">
            <Check className="h-3.5 w-3.5" />
            Saved, including Backboard memory
          </span>
        )}
        {status === "local" && (
          <span className="text-[13px] text-[#949cab]">
            Saved on this device
          </span>
        )}
        {status === "cleared" && (
          <span className="text-[13px] text-[#949cab]">
            Back to the general view
          </span>
        )}
      </div>
    </div>
  );
}
