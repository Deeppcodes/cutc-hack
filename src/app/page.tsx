import { DiscoverBoard } from "@/components/DiscoverBoard";
import { listMarkets } from "@/lib/api";

export default async function DiscoverPage(props: PageProps<"/">) {
  const params = await props.searchParams;
  const raw = params.q;
  const query = Array.isArray(raw) ? raw[0] : raw ?? "";
  const markets = listMarkets();

  const widest = markets.reduce((a, b) =>
    a.forecast.disagreementScore > b.forecast.disagreementScore ? a : b
  );

  return (
    <>
      <section className="mx-auto max-w-[1240px] px-5 pb-10 pt-16 lg:px-8 lg:pt-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1e232c] bg-[#0d0f13] px-3 py-1 text-[11px] text-[#949cab]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f0b429]" />
            Five forecasting agents ·{" "}
            <span className="text-[#e9ecf1]">{markets.length} live questions</span>
          </div>

          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#e9ecf1] text-balance sm:text-[56px]">
            See what the world thinks happens next.
          </h1>

          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#949cab]">
            Prediction markets show consensus.
            <br />
            <span className="text-[#e9ecf1]">
              Contrary finds the disagreement.
            </span>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-[13px] text-[#646c7a]">
            <div>
              <div className="text-[11px] uppercase tracking-[0.09em]">
                Widest gap today
              </div>
              <div className="mt-1 text-[15px] text-[#f0b429] tnum">
                {widest.forecast.disagreementScore} points
              </div>
            </div>
            <div className="h-8 w-px bg-[#1e232c]" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.09em]">
                Brier score vs market
              </div>
              <div className="mt-1 text-[15px] text-[#5fd06f] tnum">
                0.146 vs 0.178
              </div>
            </div>
            <div className="h-8 w-px bg-[#1e232c]" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.09em]">
                Questions resolved
              </div>
              <div className="mt-1 text-[15px] text-[#e9ecf1] tnum">214</div>
            </div>
          </div>
        </div>
      </section>

      <DiscoverBoard markets={markets} query={query} />
    </>
  );
}
