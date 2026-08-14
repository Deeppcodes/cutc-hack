"use client";

import Link from "next/link";

import { initials, lensIsSet } from "@/lib/lens";
import { useLens } from "@/lib/use-lens";

export function LensAvatar() {
  const { lens, ready } = useLens();
  const set = ready && lensIsSet(lens);
  const label = set ? initials(lens.name) : "YOU";
  const focus =
    lens.trustedAgent === "balanced" ? "general" : lens.trustedAgent.replace("-", " ");
  const title = set
    ? `${lens.name || "Your lens"} · ${focus}`
    : "Set your lens";

  return (
    <Link
      href="/lens"
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2a303b] bg-gradient-to-br from-[#232a36] to-[#151920] text-[10px] font-semibold tracking-wide text-[#c4cad4] hover:border-[#f0b429]/40 hover:text-[#f0b429]"
    >
      {label}
    </Link>
  );
}
