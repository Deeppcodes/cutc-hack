import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ForecastDetail } from "@/components/ForecastDetail";
import { getMarket, listMarkets } from "@/lib/api";

export function generateStaticParams() {
  return listMarkets().map((m) => ({ id: m.id }));
}

export async function generateMetadata(
  props: PageProps<"/forecast/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const market = getMarket(id);
  if (!market) return { title: "Forecast not found — Contrary" };
  return {
    title: `${market.shortTitle} — Contrary`,
    description: market.description,
  };
}

export default async function ForecastPage(
  props: PageProps<"/forecast/[id]">
) {
  const { id } = await props.params;
  const market = getMarket(id);
  if (!market) notFound();

  return <ForecastDetail market={market} />;
}
