import type { Metadata } from "next";

import { WatchlistBoard } from "@/components/WatchlistBoard";
import { listMarkets } from "@/lib/api";

export const metadata: Metadata = {
  title: "Watchlist — Contrary",
  description: "Forecasts you are tracking, sorted by disagreement.",
};

export default async function WatchlistPage(
  props: PageProps<"/watchlist">
) {
  const params = await props.searchParams;
  const raw = params.q;
  const query = Array.isArray(raw) ? raw[0] : raw ?? "";

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-14 lg:px-8">
      <header className="max-w-2xl pb-8">
        <h1 className="text-[38px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#e9ecf1]">
          Watchlist
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#949cab]">
          The questions you are tracking. Widest disagreement first, so the most
          contested forecasts stay at the top.
        </p>
      </header>

      <WatchlistBoard markets={listMarkets()} query={query} />
    </div>
  );
}
