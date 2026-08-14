import type { Metadata } from "next";

import { LensForm } from "@/components/LensForm";

export const metadata: Metadata = {
  title: "Your lens · Contrary",
  description:
    "Tell Contrary what you follow and which agent to weight more. Stored in Backboard memory.",
};

export default function LensPage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 pb-24 pt-14 lg:px-8">
      <header className="pb-8">
        <h1 className="text-[38px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#e9ecf1]">
          Your lens
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#949cab]">
          Same questions, different reader. Pick what you follow, or leave it
          on General if you want the default combined forecast. Contrary keeps
          the official number, then shows a second reading if you weight one
          agent more. Clear lens removes it from this device. If Backboard is
          on, the next live run can recall what you saved.
        </p>
      </header>
      <LensForm />
    </div>
  );
}
