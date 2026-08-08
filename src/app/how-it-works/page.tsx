import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AGENTS, AGENT_ORDER } from "@/lib/agents";

export const metadata: Metadata = {
  title: "How It Works — Contrary",
  description:
    "Five specialist forecasting agents work independently, then an aggregator combines them into one calibrated probability.",
};

const STEPS = [
  {
    n: "01",
    title: "Gather the evidence",
    body: "Every question pulls in published sources, each tagged with a publication, date, relevance score, and whether it supports YES or NO.",
  },
  {
    n: "02",
    title: "Five agents forecast independently",
    body: "Each specialist answers one narrow question and produces its own probability, confidence, and evidence — without seeing the others first.",
  },
  {
    n: "03",
    title: "The Skeptic audits everything",
    body: "Duplicated reporting, circular sourcing, unverified rumours, and recency bias are identified and down-weighted before aggregation.",
  },
  {
    n: "04",
    title: "The aggregator combines them",
    body: "Forecasts are weighted by confidence and by how independent their evidence is, producing one probability and a disagreement score against consensus.",
  },
  {
    n: "05",
    title: "Everything gets scored",
    body: "When a question resolves, every agent is scored with a Brier score. Accuracy is measured, not asserted.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-14 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-[38px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#e9ecf1] text-balance sm:text-[46px]">
          Prediction markets tell you what the crowd believes.
          <br />
          <span className="text-[#f0b429]">
            Contrary tells you where the crowd might be wrong.
          </span>
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-[#949cab]">
          A market price is one number with no explanation. Contrary produces a
          second, independent forecast and shows exactly which evidence moves it
          away from consensus — and how reliable that evidence is.
        </p>
      </header>

      <section className="mt-12">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.11em] text-[#646c7a]">
          The pipeline
        </h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-5">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-[#1e232c] bg-[#101318] p-5"
            >
              <div className="text-[11px] font-semibold tnum text-[#f0b429]">
                {s.n}
              </div>
              <h3 className="mt-2.5 text-[14.5px] font-medium leading-snug text-[#e9ecf1]">
                {s.title}
              </h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[#646c7a]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.11em] text-[#646c7a]">
          The five agents
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {AGENT_ORDER.map((id) => {
            const a = AGENTS[id];
            return (
              <div
                key={id}
                className="relative overflow-hidden rounded-xl border border-[#1e232c] bg-[#101318] p-5"
              >
                <span
                  className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ backgroundColor: a.accent, opacity: 0.7 }}
                />
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: a.accent }}
                  />
                  <h3 className="text-[15px] font-medium text-[#e9ecf1]">
                    {a.name} Agent
                  </h3>
                </div>
                <p className="mt-1 text-[11.5px] uppercase tracking-[0.07em] text-[#646c7a]">
                  {a.role}
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-[#949cab]">
                  “{a.mandate}”
                </p>
                <p className="mt-3 border-t border-[#1e232c] pt-3 text-[12px] text-[#646c7a]">
                  Returns a probability, a confidence level, {" "}
                  {a.keyPointsLabel.toLowerCase()}, and a short reasoning
                  summary.
                </p>
              </div>
            );
          })}

          <div className="flex flex-col justify-between rounded-xl border border-[#f0b429]/25 bg-[#f0b429]/[0.05] p-5">
            <div>
              <h3 className="text-[15px] font-medium text-[#f0b429]">
                Forecast Aggregator
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[#c4cad4]">
                Combines the five specialists into a single probability,
                weighting by confidence and evidence independence, and reports
                the disagreement score against market consensus.
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-[#f0b429]/20 bg-[#0d0f13]/60 p-3 font-mono text-[11px] leading-relaxed text-[#949cab]">
              {"{ probability, confidence, disagreementScore,"}
              <br />
              {"  keyPositiveSignals, keyNegativeSignals,"}
              <br />
              {"  uncertainties, forecastExplanation }"}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[#1e232c] bg-[#101318] p-5">
          <h3 className="text-[14.5px] font-medium text-[#e9ecf1]">
            Source quality is explicit
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[#949cab]">
            Every source is labelled Primary, Reliable secondary, Unverified, or
            Duplicate. The Skeptic Agent reduces the influence of the weak ones
            rather than silently averaging them in.
          </p>
        </div>
        <div className="rounded-xl border border-[#1e232c] bg-[#101318] p-5">
          <h3 className="text-[14.5px] font-medium text-[#e9ecf1]">
            No hindsight in the Time Machine
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[#949cab]">
            Rewinding a forecast shows only the evidence published on or before
            the selected date, so a past position can be judged on what was
            actually knowable.
          </p>
        </div>
        <div className="rounded-xl border border-[#1e232c] bg-[#101318] p-5">
          <h3 className="text-[14.5px] font-medium text-[#e9ecf1]">
            Scored, not asserted
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-[#949cab]">
            Every agent carries a public Brier score across resolved questions,
            including the market consensus baseline it is competing with.
          </p>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href="/forecast/gpt-next-2026">
            See the widest disagreement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/track-record">View the track record</Link>
        </Button>
      </div>
    </div>
  );
}
