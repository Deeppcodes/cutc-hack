import type { Metadata } from "next";
import { Check, X } from "lucide-react";

import { CalibrationChart } from "@/components/CalibrationChart";
import { Badge } from "@/components/ui/badge";
import { getTrackRecord } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Track Record — Contrary",
  description:
    "Accuracy, Brier score, and calibration for every Contrary forecasting agent, measured against resolved questions.",
};

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "pos" | "neutral";
}) {
  return (
    <div className="bg-[#101318] px-6 py-6">
      <div className="text-[11px] uppercase tracking-[0.1em] text-[#646c7a]">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-[38px] font-semibold leading-none tracking-[-0.02em] tnum",
          tone === "pos" ? "text-[#5fd06f]" : "text-[#e9ecf1]"
        )}
      >
        {value}
      </div>
      <div className="mt-2 text-[12px] text-[#646c7a]">{hint}</div>
    </div>
  );
}

export default function TrackRecordPage() {
  const record = getTrackRecord();
  const best = Math.min(...record.leaderboard.map((l) => l.brierScore));
  const worst = Math.max(...record.leaderboard.map((l) => l.brierScore));

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-14 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="text-[38px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#e9ecf1]">
          Track Record
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#949cab]">
          Every forecast is scored once the question resolves. Claiming
          intelligence is easy; this page is the measurement.
        </p>
      </header>

      <div className="mt-8 grid gap-px overflow-hidden rounded-[14px] border border-[#1e232c] bg-[#1e232c] sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Accuracy"
          value={`${(record.accuracy * 100).toFixed(1)}%`}
          hint="Correct side of 50% on resolved questions"
        />
        <Stat
          label="Brier score"
          value={record.brierScore.toFixed(3)}
          hint={`Market consensus: ${record.marketBrierScore.toFixed(3)} · lower is better`}
          tone="pos"
        />
        <Stat
          label="Calibration error"
          value={record.calibrationError.toFixed(3)}
          hint="Mean gap between forecast and observed frequency"
        />
        <Stat
          label="Resolved"
          value={String(record.resolvedCount)}
          hint="Questions scored to date"
        />
      </div>

      <div className="mt-6 rounded-[14px] border border-[#3fb950]/20 bg-[#3fb950]/[0.04] px-6 py-4">
        <p className="text-[14px] text-[#c4cad4]">
          Across {record.resolvedCount} resolved questions, Contrary beat market
          consensus by{" "}
          <span className="font-semibold tnum text-[#5fd06f]">
            {(record.marketBrierScore - record.brierScore).toFixed(3)}
          </span>{" "}
          Brier points — an{" "}
          <span className="tnum">
            {(
              ((record.marketBrierScore - record.brierScore) /
                record.marketBrierScore) *
              100
            ).toFixed(0)}
            %
          </span>{" "}
          reduction in forecast error.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold tracking-tight text-[#e9ecf1]">
                Calibration
              </h2>
              <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[#949cab]">
                When Contrary forecasts 70%, roughly 70% of those events should
                occur. Points on the dashed line are perfectly calibrated.
              </p>
            </div>
            <Badge variant="contrary">Well calibrated</Badge>
          </div>

          <div className="mt-5">
            <CalibrationChart buckets={record.buckets} />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#646c7a]">
            <span>Forecast probability</span>
            <span>Point size reflects sample count</span>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="text-[18px] font-semibold tracking-tight text-[#e9ecf1]">
            AI Forecaster Leaderboard
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#949cab]">
            Each agent is scored independently on the same resolved questions,
            alongside the market consensus baseline.
          </p>

          <div className="mt-5 space-y-1">
            <div className="grid grid-cols-[24px_minmax(0,1fr)_64px_64px] items-center gap-3 px-2 pb-2 text-[10px] uppercase tracking-[0.09em] text-[#646c7a]">
              <span />
              <span>Forecaster</span>
              <span className="text-right">Brier</span>
              <span className="text-right">Accuracy</span>
            </div>

            {record.leaderboard.map((f, i) => {
              const isCombined = f.id === "combined";
              const isMarket = f.id === "market-consensus";
              const fill =
                1 - (f.brierScore - best) / Math.max(0.001, worst - best);

              return (
                <div
                  key={f.id}
                  className={cn(
                    "relative grid grid-cols-[24px_minmax(0,1fr)_64px_64px] items-center gap-3 overflow-hidden rounded-lg px-2 py-2.5",
                    isCombined
                      ? "border border-[#f0b429]/25 bg-[#f0b429]/[0.05]"
                      : isMarket
                        ? "border border-[#6b8aff]/20 bg-[#6b8aff]/[0.04]"
                        : "border border-transparent hover:bg-[#151920]"
                  )}
                >
                  <span
                    className="absolute inset-y-0 left-0 -z-10 bg-[#1a1f27]"
                    style={{ width: `${fill * 100}%` }}
                  />
                  <span className="text-[12px] tnum text-[#646c7a]">
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "truncate text-[13.5px]",
                      isCombined
                        ? "font-medium text-[#f0b429]"
                        : isMarket
                          ? "text-[#8ba3ff]"
                          : "text-[#c4cad4]"
                    )}
                  >
                    {f.name}
                  </span>
                  <span className="text-right text-[13.5px] font-medium tnum text-[#e9ecf1]">
                    {f.brierScore.toFixed(3)}
                  </span>
                  <span className="text-right text-[13px] tnum text-[#949cab]">
                    {(f.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 border-t border-[#1e232c] pt-3 text-[11.5px] leading-relaxed text-[#646c7a]">
            The combined forecast outperforms every individual agent, which is
            the point of aggregation — the Contrarian Agent adds the most value
            on its own, and the Market Analyst the least.
          </p>
        </section>
      </div>

      <section className="panel mt-6 overflow-hidden">
        <div className="border-b border-[#1e232c] px-6 py-5">
          <h2 className="text-[18px] font-semibold tracking-tight text-[#e9ecf1]">
            Recently resolved
          </h2>
          <p className="mt-1.5 text-[13px] text-[#949cab]">
            Performance versus market consensus on the questions that have
            already settled.
          </p>
        </div>

        <div className="divide-y divide-[#1e232c]">
          {record.recent.map((r) => {
            const yes = r.outcome === "YES";
            const contraryRight =
              (yes && r.contraryProbability > 50) ||
              (!yes && r.contraryProbability < 50);
            const marketRight =
              (yes && r.marketProbability > 50) ||
              (!yes && r.marketProbability < 50);
            const beatMarket =
              Math.abs((yes ? 100 : 0) - r.contraryProbability) <
              Math.abs((yes ? 100 : 0) - r.marketProbability);

            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-4 px-6 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.category}</Badge>
                    <span className="text-[11px] text-[#646c7a]">
                      {formatDate(r.resolvedOn)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[14px] leading-snug text-[#e9ecf1]">
                    {r.question}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.09em] text-[#646c7a]">
                      Market
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 flex items-center justify-end gap-1 text-[15px] font-medium tnum",
                        marketRight ? "text-[#c4cad4]" : "text-[#f0847a]"
                      )}
                    >
                      {r.marketProbability}%
                      {marketRight ? (
                        <Check className="h-3 w-3 text-[#5fd06f]" />
                      ) : (
                        <X className="h-3 w-3 text-[#f0655a]" />
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.09em] text-[#646c7a]">
                      Contrary
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 flex items-center justify-end gap-1 text-[15px] font-medium tnum",
                        contraryRight ? "text-[#f0b429]" : "text-[#f0847a]"
                      )}
                    >
                      {r.contraryProbability}%
                      {contraryRight ? (
                        <Check className="h-3 w-3 text-[#5fd06f]" />
                      ) : (
                        <X className="h-3 w-3 text-[#f0655a]" />
                      )}
                    </div>
                  </div>

                  <div className="w-[74px] text-right">
                    <Badge variant={yes ? "pos" : "neg"}>
                      Resolved {r.outcome}
                    </Badge>
                    <div
                      className={cn(
                        "mt-1 text-[10px]",
                        beatMarket ? "text-[#5fd06f]" : "text-[#646c7a]"
                      )}
                    >
                      {beatMarket ? "Beat market" : "Trailed market"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
