import { AGENTS } from "../agents";
import type {
  AgentForecast,
  AgentId,
  Evidence,
  Market,
  Scenario,
  Source,
} from "../types";
import { series, type Keyframe } from "./series";

export const DEMO_TODAY = "2026-08-08";

type AgentSpec = {
  p: number;
  c: number;
  w: number;
  points: string[];
  summary: string;
};

function buildAgents(spec: Record<AgentId, AgentSpec>): AgentForecast[] {
  return (Object.keys(spec) as AgentId[]).map((id) => {
    const meta = AGENTS[id];
    const s = spec[id];
    return {
      agent: id,
      name: meta.name,
      role: meta.role,
      mandate: meta.mandate,
      keyPointsLabel: meta.keyPointsLabel,
      probability: s.p,
      confidence: s.c,
      weight: s.w,
      keyPoints: s.points,
      reasoningSummary: s.summary,
    };
  });
}

export function aggregate(agents: AgentForecast[]): number {
  const total = agents.reduce((a, x) => a + x.weight, 0);
  const sum = agents.reduce((a, x) => a + x.probability * x.weight, 0);
  return Math.round(sum / total);
}

function split(evidence: Evidence[]) {
  const byWeight = (a: Evidence, b: Evidence) =>
    Math.abs(b.impact) - Math.abs(a.impact);
  return {
    keyPositiveSignals: evidence.filter((e) => e.impact > 0).sort(byWeight),
    keyNegativeSignals: evidence.filter((e) => e.impact < 0).sort(byWeight),
  };
}

interface MarketInput
  extends Omit<
    Market,
    "forecast" | "history" | "marketProbability" | "updatedAt"
  > {
  marketProbability: number;
  keyframes: Keyframe[];
  seed: number;
  evidence: Evidence[];
  agentSpec: Record<AgentId, AgentSpec>;
  uncertainties: string[];
  explanation: string;
  updatedAt: string;
}

function buildMarket(input: MarketInput): Market {
  const {
    keyframes,
    seed,
    evidence,
    agentSpec,
    uncertainties,
    explanation,
    ...rest
  } = input;

  const agents = buildAgents(agentSpec);
  const probability = aggregate(agents);
  const history = series(keyframes, seed);

  return {
    ...rest,
    history,
    forecast: {
      probability,
      confidence:
        Math.round(
          (agents.reduce((a, x) => a + x.confidence * x.weight, 0) /
            agents.reduce((a, x) => a + x.weight, 0)) *
            100
        ) / 100,
      disagreementScore: Math.abs(probability - rest.marketProbability),
      ...split(evidence),
      uncertainties,
      forecastExplanation: explanation,
      agents,
      generatedAt: `${DEMO_TODAY}T13:20:00.000Z`,
      origin: "demo",
    },
  };
}

const gptSources: Source[] = [
  {
    id: "gpt-s1",
    publication: "The Information",
    headline:
      "OpenAI expands inference cluster capacity ahead of next training run",
    date: "2026-02-18",
    relevance: 0.78,
    supports: "YES",
    quality: "reliable-secondary",
  },
  {
    id: "gpt-s2",
    publication: "OpenAI Careers",
    headline: "14 new post-training evaluation and safety roles posted",
    date: "2026-03-06",
    relevance: 0.62,
    supports: "YES",
    quality: "primary",
  },
  {
    id: "gpt-s3",
    publication: "Reuters",
    headline: "Two rival labs ship frontier updates within three weeks",
    date: "2026-05-11",
    relevance: 0.7,
    supports: "YES",
    quality: "reliable-secondary",
  },
  {
    id: "gpt-s4",
    publication: "TechCrunch",
    headline: "Sources say next flagship model slips toward early 2027",
    date: "2026-06-24",
    relevance: 0.66,
    supports: "NO",
    quality: "unverified",
    skepticFlag: "Single anonymous source, no corroborating reporting",
  },
  {
    id: "gpt-s5",
    publication: "Social aggregator",
    headline: "Screenshot claims an internal model card leaked",
    date: "2026-07-02",
    relevance: 0.28,
    supports: "YES",
    quality: "unverified",
    skepticFlag: "Image unverifiable; original post deleted within hours",
  },
  {
    id: "gpt-s6",
    publication: "Ars Technica",
    headline: "What we know so far about OpenAI's next model",
    date: "2026-07-29",
    relevance: 0.34,
    supports: "YES",
    quality: "duplicate",
    skepticFlag: "Restates The Information reporting; adds no new sourcing",
  },
  {
    id: "gpt-s7",
    publication: "OpenAI developer changelog",
    headline: "No new preview endpoints registered in the last 90 days",
    date: "2026-08-04",
    relevance: 0.72,
    supports: "NO",
    quality: "primary",
  },
];

const gptEvidence: Evidence[] = [
  {
    id: "gpt-e1",
    title: "Recent hiring activity",
    explanation:
      "Fourteen post-training evaluation and safety roles opened in March. Staffing of this shape has historically clustered in the six months before a flagship launch.",
    impact: 8,
    confidence: 0.62,
    sourceIds: ["gpt-s2"],
    agent: "news",
  },
  {
    id: "gpt-e2",
    title: "Competitive pressure",
    explanation:
      "Two rival labs shipped frontier updates inside a three-week window in May, which historically compresses release timelines across the field.",
    impact: 6,
    confidence: 0.7,
    sourceIds: ["gpt-s3"],
    agent: "news",
  },
  {
    id: "gpt-e3",
    title: "Historical release delays",
    explanation:
      "Across the last six flagship launches, the gap between the first credible rumoured date and general availability slipped by a median of five months.",
    impact: -11,
    confidence: 0.78,
    sourceIds: [],
    agent: "base-rate",
  },
  {
    id: "gpt-e4",
    title: "No developer preview detected",
    explanation:
      "Every prior flagship was preceded by a public preview endpoint six to ten weeks ahead. The developer changelog shows none in 90 days.",
    impact: -9,
    confidence: 0.74,
    sourceIds: ["gpt-s7"],
    agent: "contrarian",
  },
  {
    id: "gpt-e5",
    title: "Recent rumours lack primary sourcing",
    explanation:
      "Three of the bullish reports trace back to one original story, and the July model-card screenshot could not be verified. The bullish evidence base is narrower than the headline count suggests.",
    impact: -12,
    confidence: 0.68,
    sourceIds: ["gpt-s4", "gpt-s5", "gpt-s6"],
    agent: "skeptic",
    discounted: true,
    skepticNote:
      "Two sources down-weighted for circular reporting, one for being unverifiable.",
  },
];

const gptScenarios: Scenario[] = [
  {
    id: "gpt-sc1",
    title: "Official developer preview announced",
    detail:
      "A public preview endpoint appears on the developer platform, the single strongest leading indicator in the dataset.",
    shift: 29,
    likelihood: 0.35,
  },
  {
    id: "gpt-sc2",
    title: "No announcement by October 1",
    detail:
      "Passing October without an announcement leaves too little runway for general availability before the December cutoff.",
    shift: -15,
    likelihood: 0.45,
  },
  {
    id: "gpt-sc3",
    title: "Major competitor launches first",
    detail:
      "A rival frontier release would compress the schedule, as it has in three of the last four cycles.",
    shift: 12,
    likelihood: 0.3,
  },
  {
    id: "gpt-sc4",
    title: "Verified benchmark leak appears",
    detail:
      "A benchmark entry traceable to a primary source would confirm a model exists in evaluation.",
    shift: 22,
    likelihood: 0.25,
  },
];

const gptMarket = buildMarket({
  id: "gpt-next-2026",
  question:
    "Will OpenAI release its next major GPT model before December 2026?",
  shortTitle: "Next major GPT model before December",
  category: "AI",
  description:
    "Resolves YES if a new flagship GPT-series model becomes generally available to the public before December 1, 2026. Point releases, distilled variants, and research previews without general availability do not count.",
  resolutionDate: "2026-12-01",
  marketProbability: 72,
  change7d: 8,
  volume: 4_820_000,
  forecasters: 12_400,
  seed: 3.1,
  updatedAt: `${DEMO_TODAY}T13:20:00.000Z`,
  keyframes: [
    ["2026-01-05", 41, 40],
    ["2026-03-02", 52, 45],
    ["2026-04-20", 58, 47],
    ["2026-06-08", 64, 51],
    ["2026-07-13", 71, 56],
    [DEMO_TODAY, 72, 54],
  ],
  sources: gptSources,
  evidence: gptEvidence,
  scenarios: gptScenarios,
  uncertainties: [
    "The question turns on general availability, but most reporting describes announcements, the two have diverged by months before.",
    "What counts as a 'major' model is contested; a strongly-marketed point release could trigger a resolution dispute.",
    "A late-November launch window is plausible and sits within days of the cutoff.",
  ],
  explanation:
    "Contrary sits 18 points below consensus. The market is pricing an imminent flagship, but this question requires general availability before December 1, and the most reliable leading indicator, a public developer preview, is absent after 90 days. Three bullish reports share a single original source, so the evidence base is narrower than its headline count.",
  agentSpec: {
    "base-rate": {
      p: 48,
      c: 0.72,
      w: 0.22,
      points: [
        "Only 2 of the last 6 flagship releases landed inside their rumoured quarter",
        "Median slip from first credible rumour to general availability: 5.1 months",
        "Frontier labs ship majors every 11–16 months; the last one was 13 months ago",
      ],
      summary:
        "Comparable-event frequency lands just below even. The 13-month gap since the last flagship argues for a release soon, but rumoured dates have historically arrived late.",
    },
    news: {
      p: 67,
      c: 0.58,
      w: 0.18,
      points: [
        "Inference capacity expansion reported in February",
        "Fourteen post-training evaluation roles opened in March",
        "Two competing frontier releases inside three weeks in May",
      ],
      summary:
        "Recent activity is consistent with a launch already in motion. The signal is genuine but indirect, capacity and hiring precede releases by an unpredictable margin.",
    },
    contrarian: {
      p: 39,
      c: 0.65,
      w: 0.24,
      points: [
        "The crowd is pricing an announcement; the question requires general availability",
        "No preview endpoint in 90 days, where every prior flagship had one 6–10 weeks ahead",
        "A December 1 cutoff removes the December launch window consensus implicitly relies on",
      ],
      summary:
        "Consensus appears to conflate 'announced' with 'generally available', and is discounting a missing developer preview that preceded every previous flagship.",
    },
    market: {
      p: 70,
      c: 0.8,
      w: 0.21,
      points: [
        "72% YES, up 8 points over seven days",
        "Volume concentrated in the last 10 days, a fast, thin move",
        "Order book thins above 75%, suggesting limited conviction higher",
      ],
      summary:
        "The market is confident and rising, but the move is recent and thinly traded. A price this fresh carries less information than a stable consensus.",
    },
    skeptic: {
      p: 46,
      c: 0.6,
      w: 0.15,
      points: [
        "Two of three bullish leak stories trace to the same original report",
        "The July model-card screenshot is unverifiable and was deleted",
        "Hiring-activity evidence shows recency bias, similar hiring in 2025 produced no release",
      ],
      summary:
        "After removing duplicated reporting and unverifiable leaks, the bullish case is thinner than it appears. Two signals were down-weighted and one source excluded.",
    },
  },
  timeline: [
    {
      date: "2026-01-05",
      marketProbability: 41,
      contraryProbability: 40,
      evidenceAvailable: [
        "13 months elapsed since the last flagship release",
        "Routine infrastructure procurement filings",
      ],
      events: [],
      stance:
        "Contrary and the market agree. Nothing yet separates this from a normal inter-release period.",
    },
    {
      date: "2026-03-02",
      marketProbability: 52,
      contraryProbability: 45,
      evidenceAvailable: [
        "Inference cluster capacity expansion reported",
        "Post-training evaluation roles posted",
        "Base rate: median 5.1-month slip from rumour to availability",
      ],
      events: [
        {
          title: "Capacity expansion reported",
          description:
            "The Information describes a cluster build-out consistent with a new training run.",
          impact: 6,
        },
      ],
      stance:
        "The market reads capacity build-out as a launch signal. Contrary weights it lower because the same pattern preceded two non-events.",
    },
    {
      date: "2026-04-20",
      marketProbability: 58,
      contraryProbability: 47,
      evidenceAvailable: [
        "Hiring activity sustained through Q1",
        "Still no developer preview endpoint",
      ],
      events: [
        {
          title: "Preview window opens without a preview",
          description:
            "The point at which prior flagships had a public preview passes quietly.",
          impact: -5,
        },
      ],
      stance:
        "The gap widens. Contrary begins discounting consensus for relying on announcement timing rather than availability.",
    },
    {
      date: "2026-06-08",
      marketProbability: 64,
      contraryProbability: 51,
      evidenceAvailable: [
        "Two rival frontier releases in May",
        "Competitive-pressure base rate updated",
        "No preview endpoint after 60 days",
      ],
      events: [
        {
          title: "Rival labs ship",
          description:
            "Competitive pressure historically compresses timelines, lifting both forecasts.",
          impact: 6,
        },
      ],
      stance:
        "Both forecasts rise on competitive pressure, but Contrary lifts less because the constraint is availability, not intent.",
    },
    {
      date: "2026-07-13",
      marketProbability: 71,
      contraryProbability: 56,
      evidenceAvailable: [
        "Model card screenshot circulating",
        "Recap coverage amplifying earlier reporting",
        "Delay reporting from June",
      ],
      events: [
        {
          title: "Leak cycle begins",
          description:
            "A screenshot drives a seven-point market move in four days.",
          impact: 4,
        },
      ],
      stance:
        "The market rallies on a leak. Contrary flags the source as unverifiable and moves far less.",
    },
    {
      date: DEMO_TODAY,
      marketProbability: 72,
      contraryProbability: 54,
      evidenceAvailable: [
        "Developer changelog confirms no preview in 90 days",
        "Skeptic audit collapses three reports into one original source",
      ],
      events: [
        {
          title: "Skeptic audit lands",
          description:
            "Circular reporting identified; bullish evidence re-weighted downward.",
          impact: -4,
        },
      ],
      stance:
        "The widest disagreement of the year. Contrary is 18 points below consensus, driven by a missing preview and a narrow source base.",
    },
  ],
});

const foldSources: Source[] = [
  {
    id: "fold-s1",
    publication: "DigiTimes",
    headline: "Panel supplier books capacity for a new ultra-thin foldable",
    date: "2026-02-09",
    relevance: 0.74,
    supports: "YES",
    quality: "reliable-secondary",
  },
  {
    id: "fold-s2",
    publication: "USPTO filing record",
    headline: "Nine hinge and cover-glass patents granted in eight weeks",
    date: "2026-03-11",
    relevance: 0.68,
    supports: "YES",
    quality: "primary",
  },
  {
    id: "fold-s3",
    publication: "Supply-chain analyst note",
    headline: "Unit build forecast revised up for the 2027 model year",
    date: "2026-04-22",
    relevance: 0.71,
    supports: "YES",
    quality: "reliable-secondary",
  },
  {
    id: "fold-s4",
    publication: "The Elec",
    headline: "Crease-free display yields still below the production threshold",
    date: "2026-06-15",
    relevance: 0.69,
    supports: "NO",
    quality: "reliable-secondary",
  },
  {
    id: "fold-s5",
    publication: "Component vendor disclosure",
    headline: "Tooling order confirmed for a dual-panel assembly line",
    date: "2026-07-18",
    relevance: 0.8,
    supports: "YES",
    quality: "primary",
  },
  {
    id: "fold-s6",
    publication: "Tech blog roundup",
    headline: "Everything we know about the foldable iPhone",
    date: "2026-07-30",
    relevance: 0.22,
    supports: "YES",
    quality: "duplicate",
    skepticFlag: "Aggregates DigiTimes and analyst notes without new reporting",
  },
];

const foldEvidence: Evidence[] = [
  {
    id: "fold-e1",
    title: "Supplier production ramp confirmed",
    explanation:
      "A tooling order for a dual-panel assembly line is a hard commitment. Orders of this size have preceded a launch within 14 months in every comparable case.",
    impact: 9,
    confidence: 0.81,
    sourceIds: ["fold-s5", "fold-s1"],
    agent: "news",
  },
  {
    id: "fold-e2",
    title: "Hinge patent activity accelerating",
    explanation:
      "Nine hinge and cover-glass grants in eight weeks, clustered around manufacturing tolerances rather than concept designs.",
    impact: 5,
    confidence: 0.7,
    sourceIds: ["fold-s2"],
    agent: "contrarian",
  },
  {
    id: "fold-e3",
    title: "Manufacturing forecasts revised up",
    explanation:
      "Independent build forecasts moved up for the 2027 model year, and these have tracked actual production within one quarter historically.",
    impact: 4,
    confidence: 0.66,
    sourceIds: ["fold-s3"],
    agent: "base-rate",
  },
  {
    id: "fold-e4",
    title: "Display yields below threshold",
    explanation:
      "Crease-free panel yields remain under the level normally required before volume production is committed.",
    impact: -6,
    confidence: 0.72,
    sourceIds: ["fold-s4"],
    agent: "skeptic",
  },
  {
    id: "fold-e5",
    title: "History of delay on new form factors",
    explanation:
      "New Apple product categories have slipped past their first credible supply-chain window in four of the last five cases.",
    impact: -5,
    confidence: 0.76,
    sourceIds: [],
    agent: "base-rate",
  },
];

const foldMarket = buildMarket({
  id: "foldable-2027",
  question: "Will Apple announce a foldable iPhone before September 2027?",
  shortTitle: "Foldable iPhone announced before Sept 2027",
  category: "Technology",
  description:
    "Resolves YES if Apple publicly announces a foldable iPhone at an official event or via press release before September 1, 2027. Shipping is not required; a formal announcement is sufficient.",
  resolutionDate: "2027-09-01",
  marketProbability: 64,
  change7d: 2,
  volume: 2_140_000,
  forecasters: 7_880,
  seed: 7.7,
  updatedAt: `${DEMO_TODAY}T11:05:00.000Z`,
  keyframes: [
    ["2026-01-12", 24, 33],
    ["2026-03-14", 31, 46],
    ["2026-04-27", 38, 52],
    ["2026-06-21", 58, 63],
    ["2026-07-20", 62, 68],
    [DEMO_TODAY, 64, 71],
  ],
  sources: foldSources,
  evidence: foldEvidence,
  scenarios: [
    {
      id: "fold-sc1",
      title: "Volume production order confirmed",
      detail:
        "A confirmed volume order would remove the yield question almost entirely.",
      shift: 18,
      likelihood: 0.4,
    },
    {
      id: "fold-sc2",
      title: "Display yields reported above threshold",
      detail:
        "Yield parity with conventional panels would clear the last hard technical blocker.",
      shift: 12,
      likelihood: 0.45,
    },
    {
      id: "fold-sc3",
      title: "Assembly line retooled for another product",
      detail:
        "Reallocation of the line would indicate the programme has slipped a model year.",
      shift: -24,
      likelihood: 0.15,
    },
    {
      id: "fold-sc4",
      title: "No supply-chain movement through Q1 2027",
      detail:
        "A quiet quarter at this stage would put an announcement window at risk.",
      shift: -16,
      likelihood: 0.3,
    },
  ],
  uncertainties: [
    "Supply-chain reporting is directionally reliable but frequently wrong on timing by one to two quarters.",
    "An announcement could be split from availability, and the question only requires the former.",
    "A single supplier's yield problem could delay the programme without any public signal.",
  ],
  explanation:
    "Contrary has been above consensus since February and remains 7 points above it. Hard manufacturing commitments, tooling orders and patent grants tied to production tolerances, arrived long before the market repriced. The remaining gap reflects display yields that still sit below the usual production threshold.",
  agentSpec: {
    "base-rate": {
      p: 58,
      c: 0.74,
      w: 0.18,
      points: [
        "Tooling orders of this size preceded a launch within 14 months in 5 of 6 comparable cases",
        "New Apple categories slipped past their first supply-chain window in 4 of 5 cases",
        "Announcement-only questions resolve YES more often than shipping questions",
      ],
      summary:
        "Historical manufacturing signals are strong, but this company's record on new categories argues for restraint on timing.",
    },
    news: {
      p: 80,
      c: 0.78,
      w: 0.22,
      points: [
        "Dual-panel assembly line tooling order confirmed in July",
        "Panel supplier capacity booked in February",
        "Build forecasts revised up for the 2027 model year",
      ],
      summary:
        "Three independent supply-chain signals point the same direction, and the most recent is a hard financial commitment rather than a report.",
    },
    contrarian: {
      p: 76,
      c: 0.7,
      w: 0.24,
      points: [
        "The crowd anchored on years of failed foldable rumours and under-reacted to a real tooling order",
        "Patent grants shifted from concept designs to manufacturing tolerances, a stage change the market ignored",
        "The question needs an announcement, not a shipment, which consensus keeps conflating",
      ],
      summary:
        "The consensus is pattern-matching to a decade of empty foldable speculation and missing that the evidence changed category this year.",
    },
    market: {
      p: 66,
      c: 0.72,
      w: 0.18,
      points: [
        "64% YES, up 2 points over seven days",
        "Repriced 27 points since March, mostly in a single June move",
        "Liquidity is deep and two-sided, indicating a settled consensus",
      ],
      summary:
        "The market has largely caught up to the supply-chain evidence, and the current price is well-supported by volume.",
    },
    skeptic: {
      p: 72,
      c: 0.64,
      w: 0.18,
      points: [
        "One roundup article was excluded for aggregating existing reporting",
        "Analyst build forecasts and DigiTimes capacity reports partly share sourcing",
        "The yield report is the only genuinely independent bearish signal, and it is credible",
      ],
      summary:
        "The bullish case survives audit because two signals are primary documents rather than reporting. One duplicate was removed and the yield concern was kept at full weight.",
    },
  },
  timeline: [
    {
      date: "2026-01-12",
      marketProbability: 24,
      contraryProbability: 33,
      evidenceAvailable: [
        "A decade of unfulfilled foldable rumours",
        "No confirmed supply-chain activity",
      ],
      events: [],
      stance:
        "Both forecasts are low. Contrary is modestly higher on the strength of early component chatter.",
    },
    {
      date: "2026-03-14",
      marketProbability: 31,
      contraryProbability: 46,
      evidenceAvailable: [
        "Panel supplier production report",
        "Hinge and cover-glass patent activity",
        "Analyst manufacturing forecast",
      ],
      events: [
        {
          title: "Patent cluster granted",
          description:
            "Nine grants in eight weeks, focused on manufacturing tolerances rather than concepts.",
          impact: 8,
        },
      ],
      stance:
        "Contrary moves 15 points above consensus. Three independent manufacturing signals arrived while the market stayed anchored to old rumours.",
    },
    {
      date: "2026-04-27",
      marketProbability: 38,
      contraryProbability: 52,
      evidenceAvailable: [
        "Build forecast revised up for the 2027 model year",
        "Sustained supplier capacity bookings",
      ],
      events: [
        {
          title: "Forecast revision",
          description:
            "Independent build estimates move up, corroborating the February capacity report.",
          impact: 5,
        },
      ],
      stance:
        "Contrary crosses 50% while the market remains below 40%. The disagreement is at its widest.",
    },
    {
      date: "2026-06-21",
      marketProbability: 58,
      contraryProbability: 63,
      evidenceAvailable: [
        "Display yield concerns published",
        "Mainstream coverage of the supply chain begins",
      ],
      events: [
        {
          title: "The market repriced",
          description:
            "Consensus moved 20 points in three weeks, closing most of the gap with Contrary.",
          impact: 20,
        },
        {
          title: "Yield report published",
          description:
            "Crease-free panel yields reported below the production threshold.",
          impact: -6,
        },
      ],
      stance:
        "The market catches up. Contrary's early call is now largely priced in, and the gap narrows to 5 points.",
    },
    {
      date: "2026-07-20",
      marketProbability: 62,
      contraryProbability: 68,
      evidenceAvailable: [
        "Dual-panel assembly line tooling order",
        "Continued yield uncertainty",
      ],
      events: [
        {
          title: "Tooling order confirmed",
          description:
            "A hard financial commitment to a dual-panel line, the strongest signal in the series.",
          impact: 9,
        },
      ],
      stance:
        "A primary-source commitment lifts Contrary again, slightly ahead of the market's reaction.",
    },
    {
      date: DEMO_TODAY,
      marketProbability: 64,
      contraryProbability: 71,
      evidenceAvailable: [
        "Full supply-chain picture across six months",
        "One duplicate source removed by the Skeptic Agent",
      ],
      events: [],
      stance:
        "Contrary holds a 7-point lead. Having been early since March, the position is now supported by primary documents rather than reporting.",
    },
  ],
});

const bocMarket = buildMarket({
  id: "boc-cut-oct-2026",
  question: "Will the Bank of Canada cut its policy rate before October 2026?",
  shortTitle: "Bank of Canada cut before October",
  category: "Economy",
  description:
    "Resolves YES if the Bank of Canada announces a reduction to its target for the overnight rate at or before the September 2026 decision.",
  resolutionDate: "2026-10-01",
  marketProbability: 58,
  change7d: -4,
  volume: 3_310_000,
  forecasters: 9_120,
  seed: 4.4,
  updatedAt: `${DEMO_TODAY}T09:40:00.000Z`,
  keyframes: [
    ["2026-01-19", 46, 44],
    ["2026-03-23", 55, 48],
    ["2026-05-18", 67, 51],
    ["2026-07-06", 62, 44],
    [DEMO_TODAY, 58, 41],
  ],
  sources: [
    {
      id: "boc-s1",
      publication: "Statistics Canada",
      headline: "Core inflation ticks up for a second consecutive month",
      date: "2026-07-21",
      relevance: 0.86,
      supports: "NO",
      quality: "primary",
    },
    {
      id: "boc-s2",
      publication: "Bank of Canada",
      headline: "Governor's remarks emphasise patience on further easing",
      date: "2026-07-09",
      relevance: 0.82,
      supports: "NO",
      quality: "primary",
    },
    {
      id: "boc-s3",
      publication: "Statistics Canada",
      headline: "Labour force survey shows unexpected employment gains",
      date: "2026-08-01",
      relevance: 0.74,
      supports: "NO",
      quality: "primary",
    },
    {
      id: "boc-s4",
      publication: "Bloomberg",
      headline: "Housing starts fall to a three-year low",
      date: "2026-06-30",
      relevance: 0.58,
      supports: "YES",
      quality: "reliable-secondary",
    },
    {
      id: "boc-s5",
      publication: "Bank strategist note",
      headline: "Desk still expects a September cut",
      date: "2026-07-28",
      relevance: 0.4,
      supports: "YES",
      quality: "unverified",
      skepticFlag:
        "Published before the July inflation print; not updated since",
    },
  ],
  evidence: [
    {
      id: "boc-e1",
      title: "Inflation reaccelerating",
      explanation:
        "Core measures rose for a second consecutive month, moving away from the target band right before the decision window.",
      impact: -8,
      confidence: 0.86,
      sourceIds: ["boc-s1"],
      agent: "news",
    },
    {
      id: "boc-e2",
      title: "Labour market resilience",
      explanation:
        "Employment gains surprised to the upside, removing the labour-market weakness that would justify easing.",
      impact: -6,
      confidence: 0.79,
      sourceIds: ["boc-s3"],
      agent: "news",
    },
    {
      id: "boc-e3",
      title: "Explicitly patient guidance",
      explanation:
        "The Governor's language shifted toward patience. Comparable shifts have preceded a hold in most historical cases.",
      impact: -7,
      confidence: 0.8,
      sourceIds: ["boc-s2"],
      agent: "contrarian",
    },
    {
      id: "boc-e4",
      title: "Housing weakness building",
      explanation:
        "Housing starts at a three-year low is the strongest genuine argument for easing in the current data.",
      impact: 4,
      confidence: 0.6,
      sourceIds: ["boc-s4"],
      agent: "base-rate",
    },
    {
      id: "boc-e5",
      title: "History of off-consensus cuts",
      explanation:
        "The Bank has cut against prevailing guidance twice in the last decade, so patient language is not decisive on its own.",
      impact: 2,
      confidence: 0.52,
      sourceIds: [],
      agent: "base-rate",
    },
    {
      id: "boc-e6",
      title: "Bullish desk note is stale",
      explanation:
        "The most-cited argument for a cut was published before the July inflation print and has not been revised since.",
      impact: -2,
      confidence: 0.64,
      sourceIds: ["boc-s5"],
      agent: "skeptic",
      discounted: true,
      skepticNote: "Down-weighted: predates the data that contradicts it.",
    },
  ],
  scenarios: [
    {
      id: "boc-sc1",
      title: "August inflation print comes in soft",
      detail: "A downside surprise would reopen the door before September.",
      shift: 21,
      likelihood: 0.3,
    },
    {
      id: "boc-sc2",
      title: "Employment falls in the August survey",
      detail: "Labour-market deterioration is the most reliable cut trigger.",
      shift: 16,
      likelihood: 0.25,
    },
    {
      id: "boc-sc3",
      title: "Governor repeats patient language in September",
      detail: "A second explicit signal would effectively settle the question.",
      shift: -19,
      likelihood: 0.5,
    },
  ],
  uncertainties: [
    "A single soft inflation print before the September decision could reverse the entire picture.",
    "Guidance language is interpreted inconsistently and has been wrong-footed before.",
  ],
  explanation:
    "Contrary is 17 points below consensus. The market appears to be trading on a cutting-cycle narrative formed in May, while three primary data releases since July all point the other way. The most-cited bullish argument predates the inflation print that contradicts it.",
  agentSpec: {
    "base-rate": {
      p: 44,
      c: 0.7,
      w: 0.2,
      points: [
        "Cuts within two meetings of patient guidance occurred in 3 of 11 cases",
        "Reaccelerating core inflation preceded a hold in 8 of 9 comparable episodes",
        "Housing weakness alone triggered easing only when paired with job losses",
      ],
      summary:
        "Historical patterns place this well below even once reaccelerating inflation is conditioned on.",
    },
    news: {
      p: 38,
      c: 0.84,
      w: 0.2,
      points: [
        "Core inflation up for a second month, published July 21",
        "Employment surprised upward on August 1",
        "Patient guidance from the Governor on July 9",
      ],
      summary:
        "Every primary data release in the last month argues against a cut, and all three are official statistics rather than reporting.",
    },
    contrarian: {
      p: 30,
      c: 0.68,
      w: 0.24,
      points: [
        "The market is still pricing a cutting cycle established in May, before the data turned",
        "Consensus is treating housing weakness as sufficient when history requires job losses too",
        "Positioning looks anchored to a strategist call published before the July print",
      ],
      summary:
        "The crowd is holding a May thesis against July and August data. That lag is the entire disagreement.",
    },
    market: {
      p: 56,
      c: 0.75,
      w: 0.2,
      points: [
        "58% YES, down 4 points over seven days",
        "Peaked at 67% in May and has drifted lower since",
        "The decline is orderly, suggesting gradual repricing rather than capitulation",
      ],
      summary:
        "The market is already moving toward Contrary's position, but slowly relative to the pace of incoming data.",
    },
    skeptic: {
      p: 40,
      c: 0.66,
      w: 0.16,
      points: [
        "The widely-cited desk note predates the July inflation release",
        "Several bullish arguments restate the same May guidance",
        "Bearish evidence is unusually clean, three primary statistical releases",
      ],
      summary:
        "The bearish case rests on primary statistics while the bullish case rests on a stale note. One signal was down-weighted accordingly.",
    },
  },
});

const oswMarket = buildMarket({
  id: "open-source-benchmark-2026",
  question:
    "Will an open-weights model rank #1 on a major public benchmark before January 2027?",
  shortTitle: "Open-weights model reaches #1",
  category: "AI",
  description:
    "Resolves YES if a model with publicly downloadable weights holds the top position on a widely-recognised public leaderboard for at least seven consecutive days before January 1, 2027.",
  resolutionDate: "2027-01-01",
  marketProbability: 23,
  change7d: 3,
  volume: 1_460_000,
  forecasters: 6_240,
  seed: 9.2,
  updatedAt: `${DEMO_TODAY}T15:02:00.000Z`,
  keyframes: [
    ["2026-01-26", 12, 18],
    ["2026-03-30", 15, 26],
    ["2026-06-01", 19, 33],
    [DEMO_TODAY, 23, 38],
  ],
  sources: [
    {
      id: "osw-s1",
      publication: "Model release page",
      headline: "Open-weights release lands within 3 points of the leader",
      date: "2026-07-11",
      relevance: 0.84,
      supports: "YES",
      quality: "primary",
    },
    {
      id: "osw-s2",
      publication: "Leaderboard changelog",
      headline: "Gap between open and closed leaders narrowed for a fifth quarter",
      date: "2026-06-28",
      relevance: 0.78,
      supports: "YES",
      quality: "primary",
    },
    {
      id: "osw-s3",
      publication: "Compute provider announcement",
      headline: "New sponsored compute programme for open model training",
      date: "2026-05-19",
      relevance: 0.55,
      supports: "YES",
      quality: "reliable-secondary",
    },
    {
      id: "osw-s4",
      publication: "Research preprint",
      headline: "Closed labs hold reserve capacity for leaderboard responses",
      date: "2026-04-08",
      relevance: 0.6,
      supports: "NO",
      quality: "reliable-secondary",
    },
  ],
  evidence: [
    {
      id: "osw-e1",
      title: "Open-weights gap closing steadily",
      explanation:
        "The distance between the leading open and closed models has narrowed for five consecutive quarters, and the latest release is within three points.",
      impact: 7,
      confidence: 0.8,
      sourceIds: ["osw-s2", "osw-s1"],
      agent: "news",
    },
    {
      id: "osw-e2",
      title: "Compute access improving",
      explanation:
        "Sponsored training programmes remove the main historical constraint on open model scale.",
      impact: 5,
      confidence: 0.62,
      sourceIds: ["osw-s3"],
      agent: "base-rate",
    },
    {
      id: "osw-e3",
      title: "Consensus underrates a seven-day hold",
      explanation:
        "The question needs seven days at the top, not permanence. Brief leads have happened twice already and the crowd is pricing durable supremacy.",
      impact: 6,
      confidence: 0.71,
      sourceIds: [],
      agent: "contrarian",
    },
    {
      id: "osw-e4",
      title: "Closed labs hold reserve capacity",
      explanation:
        "Leading labs appear to keep unreleased checkpoints available to respond to leaderboard changes, which shortens any open lead.",
      impact: -3,
      confidence: 0.58,
      sourceIds: ["osw-s4"],
      agent: "skeptic",
    },
  ],
  scenarios: [
    {
      id: "osw-sc1",
      title: "An open-weights model takes the top spot at all",
      detail: "Even a brief lead makes the seven-day hold plausible.",
      shift: 34,
      likelihood: 0.3,
    },
    {
      id: "osw-sc2",
      title: "A major closed release lands in Q4",
      detail: "A frontier release would reset the gap for months.",
      shift: -14,
      likelihood: 0.55,
    },
    {
      id: "osw-sc3",
      title: "Benchmark operator changes methodology",
      detail: "Scoring changes have reshuffled the top three twice before.",
      shift: 9,
      likelihood: 0.2,
    },
  ],
  uncertainties: [
    "'Major public benchmark' is ambiguous and different leaderboards would resolve differently.",
    "A seven-day hold is fragile, closed labs can respond within days.",
  ],
  explanation:
    "Contrary is 15 points above consensus. The market is pricing durable open-weights supremacy, but the question only requires a seven-day hold, and the gap to the closed leader is now inside three points after five quarters of steady convergence.",
  agentSpec: {
    "base-rate": {
      p: 30,
      c: 0.66,
      w: 0.2,
      points: [
        "Open models have briefly reached the top two on three occasions",
        "Convergence rate implies parity within two to four quarters",
        "No open model has previously held #1 for a full week",
      ],
      summary:
        "The trend clearly supports eventual parity; the timing question is whether it lands inside five months.",
    },
    news: {
      p: 46,
      c: 0.68,
      w: 0.22,
      points: [
        "July release landed within 3 points of the leader",
        "Fifth consecutive quarter of narrowing",
        "Sponsored compute programme announced in May",
      ],
      summary:
        "Recent releases have compressed the gap faster than the multi-year trend would predict.",
    },
    contrarian: {
      p: 48,
      c: 0.64,
      w: 0.24,
      points: [
        "The crowd is pricing sustained dominance when the question needs seven days",
        "Benchmark methodology changes are treated as noise but have reshuffled the top three twice",
        "The 23% price looks anchored to 2024 conditions rather than current gaps",
      ],
      summary:
        "Consensus is answering a harder question than the one being asked, which is the entire source of the gap.",
    },
    market: {
      p: 26,
      c: 0.6,
      w: 0.18,
      points: [
        "23% YES, up 3 points over seven days",
        "Low volume relative to comparable AI markets",
        "Price has drifted up all year without a repricing event",
      ],
      summary:
        "A thin market that has drifted rather than repriced. Low participation reduces how much the price should be trusted.",
    },
    skeptic: {
      p: 36,
      c: 0.58,
      w: 0.16,
      points: [
        "Benchmark scores near the top are within measurement noise",
        "The reserve-capacity claim is a preprint and only weakly supported",
        "Self-reported release-page scores are not independently verified",
      ],
      summary:
        "Both sides rely partly on self-reported numbers. Evidence quality here is weaker than in most markets, so confidence is held down.",
    },
  },
});

const fusionMarket = buildMarket({
  id: "fusion-ppa-2027",
  question:
    "Will a fusion company sign a commercial power purchase agreement before July 2027?",
  shortTitle: "First commercial fusion power agreement",
  category: "Science",
  description:
    "Resolves YES if a fusion energy company publicly announces a binding power purchase agreement with a commercial or utility counterparty before July 1, 2027.",
  resolutionDate: "2027-07-01",
  marketProbability: 31,
  change7d: -2,
  volume: 640_000,
  forecasters: 2_310,
  seed: 5.5,
  updatedAt: `${DEMO_TODAY}T08:15:00.000Z`,
  keyframes: [
    ["2026-02-02", 22, 19],
    ["2026-04-13", 28, 21],
    ["2026-06-15", 34, 24],
    [DEMO_TODAY, 31, 22],
  ],
  sources: [
    {
      id: "fus-s1",
      publication: "Utility regulatory filing",
      headline: "Exploratory clean-firm procurement includes fusion category",
      date: "2026-05-04",
      relevance: 0.66,
      supports: "YES",
      quality: "primary",
    },
    {
      id: "fus-s2",
      publication: "Trade press",
      headline: "Demonstration timeline slips by two quarters",
      date: "2026-06-27",
      relevance: 0.71,
      supports: "NO",
      quality: "reliable-secondary",
    },
    {
      id: "fus-s3",
      publication: "Conference remarks",
      headline: "Executive says agreements are 'close'",
      date: "2026-07-15",
      relevance: 0.3,
      supports: "YES",
      quality: "unverified",
      skepticFlag: "Promotional context; similar claims made in 2024 and 2025",
    },
    {
      id: "fus-s4",
      publication: "Grid operator study",
      headline: "Interconnection queue timelines extend to 2029",
      date: "2026-03-19",
      relevance: 0.62,
      supports: "NO",
      quality: "primary",
    },
  ],
  evidence: [
    {
      id: "fus-e1",
      title: "Procurement categories opening",
      explanation:
        "A utility filing that names fusion as an eligible clean-firm category is a genuine structural prerequisite being met.",
      impact: 5,
      confidence: 0.63,
      sourceIds: ["fus-s1"],
      agent: "news",
    },
    {
      id: "fus-e2",
      title: "Demonstration timelines slipping",
      explanation:
        "A two-quarter slip in the underlying demonstration removes the technical milestone a counterparty would require.",
      impact: -6,
      confidence: 0.74,
      sourceIds: ["fus-s2"],
      agent: "news",
    },
    {
      id: "fus-e3",
      title: "Interconnection is the real constraint",
      explanation:
        "Queue timelines extending to 2029 make a binding agreement hard to justify commercially, regardless of technical progress.",
      impact: -4,
      confidence: 0.69,
      sourceIds: ["fus-s4"],
      agent: "contrarian",
    },
    {
      id: "fus-e4",
      title: "'Close to signing' claims are recurring",
      explanation:
        "Near-identical executive statements were made in 2024 and 2025 without a resulting agreement.",
      impact: -4,
      confidence: 0.72,
      sourceIds: ["fus-s3"],
      agent: "skeptic",
      discounted: true,
      skepticNote: "Down-weighted: promotional claim with a poor track record.",
    },
  ],
  scenarios: [
    {
      id: "fus-sc1",
      title: "Demonstration milestone achieved on schedule",
      detail: "A hit milestone would make a binding agreement credible.",
      shift: 23,
      likelihood: 0.25,
    },
    {
      id: "fus-sc2",
      title: "A utility issues a fusion-specific solicitation",
      detail: "A formal solicitation would be the clearest possible precursor.",
      shift: 18,
      likelihood: 0.2,
    },
    {
      id: "fus-sc3",
      title: "Another timeline slip announced",
      detail: "A second slip would effectively close the window.",
      shift: -12,
      likelihood: 0.4,
    },
  ],
  uncertainties: [
    "A non-binding letter of intent could be reported as an agreement and trigger a resolution dispute.",
    "Announcements in this sector are frequently made for fundraising reasons rather than commercial ones.",
  ],
  explanation:
    "Contrary is 9 points below consensus. Enthusiasm is tracking technical progress, but the binding constraint is commercial: interconnection timelines run to 2029 and the demonstration milestone a counterparty would need has already slipped two quarters.",
  agentSpec: {
    "base-rate": {
      p: 16,
      c: 0.72,
      w: 0.24,
      points: [
        "No binding fusion power agreement has ever been signed",
        "First-of-kind energy agreements typically follow a demonstrated milestone by 18+ months",
        "Announced 'close to signing' claims converted at roughly 1 in 8 historically",
      ],
      summary:
        "There is no precedent, and analogous first-of-kind agreements lag demonstrated performance by well over a year.",
    },
    news: {
      p: 30,
      c: 0.64,
      w: 0.2,
      points: [
        "Utility procurement filing names fusion as eligible",
        "Demonstration timeline slipped two quarters in June",
        "Executive comments in July claim agreements are near",
      ],
      summary:
        "Recent news cuts both ways, with a real structural opening offset by a concrete schedule slip.",
    },
    contrarian: {
      p: 18,
      c: 0.66,
      w: 0.22,
      points: [
        "The crowd is forecasting technology when the blocker is interconnection",
        "Queue timelines to 2029 make near-term commercial commitments hard to justify",
        "Sector announcements often serve fundraising rather than operations",
      ],
      summary:
        "The market is pricing scientific progress. The question depends on commercial and grid constraints that have barely moved.",
    },
    market: {
      p: 30,
      c: 0.55,
      w: 0.18,
      points: [
        "31% YES, down 2 points over seven days",
        "Thin market with only 2,310 forecasters",
        "Peaked at 34% in June before the slip was reported",
      ],
      summary:
        "One of the thinnest markets in the set, so the price carries correspondingly little information.",
    },
    skeptic: {
      p: 20,
      c: 0.68,
      w: 0.16,
      points: [
        "The bullish executive quote repeats claims from 2024 and 2025",
        "Conference remarks are promotional and were made without specifics",
        "The bearish evidence is a primary regulatory document",
      ],
      summary:
        "The single bullish news signal has a documented history of not converting, and was down-weighted accordingly.",
    },
  },
});

const boxOfficeMarket = buildMarket({
  id: "box-office-2b-2026",
  question: "Will any film released in 2026 gross more than $2B worldwide?",
  shortTitle: "A 2026 film crosses $2B worldwide",
  category: "Culture",
  description:
    "Resolves YES if a film with a 2026 theatrical release reaches $2 billion in cumulative worldwide box office, as reported by a major industry tracker, before June 30, 2027.",
  resolutionDate: "2027-06-30",
  marketProbability: 44,
  change7d: 5,
  volume: 890_000,
  forecasters: 4_070,
  seed: 6.3,
  updatedAt: `${DEMO_TODAY}T17:45:00.000Z`,
  keyframes: [
    ["2026-01-26", 38, 34],
    ["2026-04-06", 42, 36],
    ["2026-06-22", 39, 33],
    [DEMO_TODAY, 44, 37],
  ],
  sources: [
    {
      id: "box-s1",
      publication: "Box office tracker",
      headline: "Summer tentpole opens above pre-release projections",
      date: "2026-07-27",
      relevance: 0.8,
      supports: "YES",
      quality: "primary",
    },
    {
      id: "box-s2",
      publication: "Exhibitor association",
      headline: "International screen counts remain below pre-2020 levels",
      date: "2026-05-12",
      relevance: 0.68,
      supports: "NO",
      quality: "reliable-secondary",
    },
    {
      id: "box-s3",
      publication: "Trade publication",
      headline: "Q4 release calendar thins as two titles move to 2027",
      date: "2026-06-18",
      relevance: 0.72,
      supports: "NO",
      quality: "reliable-secondary",
    },
    {
      id: "box-s4",
      publication: "Studio press release",
      headline: "Second-weekend hold reported as strongest of the year",
      date: "2026-08-03",
      relevance: 0.52,
      supports: "YES",
      quality: "primary",
    },
  ],
  evidence: [
    {
      id: "box-e1",
      title: "One title outperforming projections",
      explanation:
        "A summer tentpole opened above projections and held well in its second weekend, the standard early shape of a $2B run.",
      impact: 4,
      confidence: 0.68,
      sourceIds: ["box-s1", "box-s4"],
      agent: "news",
    },
    {
      id: "box-e2",
      title: "Only five films have ever cleared $2B",
      explanation:
        "The threshold has been reached five times in history, and never without a major international market performing at full strength.",
      impact: -5,
      confidence: 0.82,
      sourceIds: [],
      agent: "base-rate",
    },
    {
      id: "box-e3",
      title: "Thinning Q4 calendar",
      explanation:
        "Two potential contenders moved to 2027, leaving a single realistic candidate for the year.",
      impact: -3,
      confidence: 0.7,
      sourceIds: ["box-s3"],
      agent: "contrarian",
    },
    {
      id: "box-e4",
      title: "Screen capacity still constrained",
      explanation:
        "International screen counts below prior levels cap the achievable ceiling regardless of demand.",
      impact: -3,
      confidence: 0.64,
      sourceIds: ["box-s2"],
      agent: "skeptic",
    },
  ],
  scenarios: [
    {
      id: "box-sc1",
      title: "Leading title clears $1B in 20 days",
      detail: "The pace threshold every $2B film has previously met.",
      shift: 26,
      likelihood: 0.3,
    },
    {
      id: "box-sc2",
      title: "Third-weekend drop exceeds 55%",
      detail: "A steep drop would rule out the required long tail.",
      shift: -18,
      likelihood: 0.45,
    },
    {
      id: "box-sc3",
      title: "A Q4 title is added back to the calendar",
      detail: "A second contender materially widens the paths to YES.",
      shift: 11,
      likelihood: 0.15,
    },
  ],
  uncertainties: [
    "Currency movements and re-release accounting have shifted final totals by over $80M before.",
    "A single market's performance can swing the outcome, and its data arrives late.",
  ],
  explanation:
    "Contrary is 7 points below consensus. One title is genuinely outperforming, but the calendar has thinned to a single realistic candidate and international screen capacity remains below the level every prior $2B film enjoyed.",
  agentSpec: {
    "base-rate": {
      p: 28,
      c: 0.8,
      w: 0.24,
      points: [
        "Five films in history have crossed $2B",
        "Every one required a fully-performing international market",
        "Years with one realistic contender converted roughly 1 in 4 times",
      ],
      summary:
        "The historical frequency is low and the structural preconditions are only partly present this year.",
    },
    news: {
      p: 44,
      c: 0.66,
      w: 0.2,
      points: [
        "Summer tentpole opened above projections in July",
        "Strongest second-weekend hold of the year reported in August",
        "Two Q4 contenders moved out of the year in June",
      ],
      summary:
        "The lead title is performing well, but the surrounding calendar got worse in the same period.",
    },
    contrarian: {
      p: 34,
      c: 0.6,
      w: 0.2,
      points: [
        "The market repriced on opening weekend, which historically explains little of the final total",
        "Consensus is extrapolating a domestic pattern to international markets that behave differently",
        "The thinner calendar means a single title's stumble resolves this NO",
      ],
      summary:
        "Consensus is over-weighting an opening weekend, which is among the weaker predictors of a $2B outcome.",
    },
    market: {
      p: 43,
      c: 0.62,
      w: 0.2,
      points: [
        "44% YES, up 5 points over seven days",
        "The move tracks opening-weekend coverage almost exactly",
        "Dipped to 39% in June on the calendar news",
      ],
      summary:
        "The price is reactive to weekly box office headlines, which makes it noisy rather than informative.",
    },
    skeptic: {
      p: 36,
      c: 0.6,
      w: 0.16,
      points: [
        "Studio-issued hold figures are selectively framed",
        "Several bullish takes derive from the same tracker release",
        "The capacity constraint is the most independent piece of evidence available",
      ],
      summary:
        "Bullish evidence is largely studio-sourced and partly duplicated, so it was down-weighted relative to the capacity data.",
    },
  },
});

const robotaxiMarket = buildMarket({
  id: "robotaxi-cities-2027",
  question:
    "Will a driverless ride-hailing service operate in more than 10 US cities before July 2027?",
  shortTitle: "Driverless ride-hailing in 10+ US cities",
  category: "Technology",
  description:
    "Resolves YES if a single operator provides public, fully driverless ride-hailing in more than ten distinct US metropolitan areas before July 1, 2027.",
  resolutionDate: "2027-07-01",
  marketProbability: 61,
  change7d: 1,
  volume: 1_780_000,
  forecasters: 5_640,
  seed: 8.8,
  updatedAt: `${DEMO_TODAY}T12:30:00.000Z`,
  keyframes: [
    ["2026-02-16", 44, 49],
    ["2026-04-20", 51, 58],
    ["2026-06-29", 58, 65],
    [DEMO_TODAY, 61, 68],
  ],
  sources: [
    {
      id: "rt-s1",
      publication: "Operator announcement",
      headline: "Service opens in three additional metros this quarter",
      date: "2026-07-08",
      relevance: 0.85,
      supports: "YES",
      quality: "primary",
    },
    {
      id: "rt-s2",
      publication: "State regulator docket",
      headline: "Two additional states grant driverless deployment permits",
      date: "2026-06-11",
      relevance: 0.79,
      supports: "YES",
      quality: "primary",
    },
    {
      id: "rt-s3",
      publication: "Local news",
      headline: "City council raises concerns over expansion pace",
      date: "2026-07-25",
      relevance: 0.45,
      supports: "NO",
      quality: "reliable-secondary",
    },
    {
      id: "rt-s4",
      publication: "Industry newsletter",
      headline: "Fleet build rate may constrain the expansion schedule",
      date: "2026-05-30",
      relevance: 0.6,
      supports: "NO",
      quality: "unverified",
      skepticFlag: "Estimates are modelled, not sourced from the operator",
    },
  ],
  evidence: [
    {
      id: "rt-e1",
      title: "Expansion pace is accelerating",
      explanation:
        "Three metros opened in a single quarter, up from one per quarter a year ago, and the operator has stated the cadence continues.",
      impact: 6,
      confidence: 0.83,
      sourceIds: ["rt-s1"],
      agent: "news",
    },
    {
      id: "rt-e2",
      title: "Regulatory path clearing",
      explanation:
        "Two more states granted deployment permits, which historically precedes launch by two to three quarters.",
      impact: 4,
      confidence: 0.76,
      sourceIds: ["rt-s2"],
      agent: "base-rate",
    },
    {
      id: "rt-e3",
      title: "Consensus over-weights local opposition",
      explanation:
        "Council-level objections have delayed launches by a median of six weeks and have never prevented one where a state permit existed.",
      impact: 3,
      confidence: 0.65,
      sourceIds: ["rt-s3"],
      agent: "contrarian",
    },
    {
      id: "rt-e4",
      title: "Fleet supply may bind",
      explanation:
        "Vehicle build rates could cap how many metros can be served simultaneously, though the estimates are modelled rather than disclosed.",
      impact: -3,
      confidence: 0.5,
      sourceIds: ["rt-s4"],
      agent: "skeptic",
      discounted: true,
      skepticNote: "Down-weighted: modelled estimate with no primary sourcing.",
    },
    {
      id: "rt-e5",
      title: "A single safety incident could pause everything",
      explanation:
        "Prior incidents produced multi-state suspensions lasting more than a quarter, which is the main tail risk here.",
      impact: -3,
      confidence: 0.6,
      sourceIds: [],
      agent: "base-rate",
    },
  ],
  scenarios: [
    {
      id: "rt-sc1",
      title: "Three more metros announced this quarter",
      detail: "Maintaining the current cadence effectively settles the question.",
      shift: 17,
      likelihood: 0.45,
    },
    {
      id: "rt-sc2",
      title: "A high-profile safety incident occurs",
      detail: "Historically produces multi-state suspensions of a quarter or more.",
      shift: -26,
      likelihood: 0.2,
    },
    {
      id: "rt-sc3",
      title: "A second operator reaches five metros",
      detail: "Would confirm the regulatory path is broadly open rather than firm-specific.",
      shift: 8,
      likelihood: 0.35,
    },
  ],
  uncertainties: [
    "'Distinct metropolitan area' is loosely defined and adjacent suburbs could be counted either way.",
    "One safety incident can reverse two years of expansion within weeks.",
  ],
  explanation:
    "Contrary is 7 points above consensus. Expansion cadence tripled this year and state permits are clearing two to three quarters ahead of launches. The market appears to be over-weighting city-council objections, which have delayed launches but never blocked one where a state permit existed.",
  agentSpec: {
    "base-rate": {
      p: 58,
      c: 0.7,
      w: 0.2,
      points: [
        "State permits preceded launch by 2–3 quarters in 9 of 10 cases",
        "Expansion cadence tripled year over year",
        "Safety incidents caused suspensions longer than a quarter twice",
      ],
      summary:
        "The permit-to-launch pipeline is the most reliable indicator available and it currently supports the required count.",
    },
    news: {
      p: 80,
      c: 0.8,
      w: 0.22,
      points: [
        "Three metros opened in a single quarter in July",
        "Two additional state permits granted in June",
        "Council-level objections raised in one metro in July",
      ],
      summary:
        "Recent developments are strongly positive, with two primary-source confirmations and only one minor local objection.",
    },
    contrarian: {
      p: 72,
      c: 0.68,
      w: 0.22,
      points: [
        "The crowd treats local opposition as blocking when it has only ever delayed",
        "Consensus is anchored to the slow 2024–2025 cadence rather than the current one",
        "Fleet-supply concerns come from modelled estimates the market treats as disclosed facts",
      ],
      summary:
        "Two of the market's main objections are weaker than they appear on inspection, which explains most of the gap.",
    },
    market: {
      p: 62,
      c: 0.74,
      w: 0.2,
      points: [
        "61% YES, up 1 point over seven days",
        "Risen steadily for six months without a sharp move",
        "Deep, two-sided liquidity",
      ],
      summary:
        "A well-traded market that has climbed gradually. The price is credible but appears to lag the acceleration in cadence.",
    },
    skeptic: {
      p: 68,
      c: 0.62,
      w: 0.16,
      points: [
        "The fleet-supply constraint is modelled, not disclosed, and was down-weighted",
        "Operator announcements are self-reported but verifiable against regulator dockets",
        "Local news coverage of council objections is duplicated across outlets",
      ],
      summary:
        "The bullish evidence is unusually verifiable because it can be cross-checked against public dockets. One bearish signal was down-weighted.",
    },
  },
});

const cpiMarket = buildMarket({
  id: "us-cpi-dec-2026",
  question:
    "Will US headline CPI come in below 2.5% year-over-year in the December 2026 print?",
  shortTitle: "US headline CPI below 2.5% in December",
  category: "Economy",
  description:
    "Resolves YES if the Bureau of Labor Statistics reports headline CPI inflation below 2.5% year-over-year for December 2026, as published in the initial release.",
  resolutionDate: "2027-01-15",
  marketProbability: 47,
  change7d: -3,
  volume: 2_960_000,
  forecasters: 8_450,
  seed: 2.7,
  updatedAt: `${DEMO_TODAY}T10:10:00.000Z`,
  keyframes: [
    ["2026-01-19", 39, 44],
    ["2026-03-30", 44, 49],
    ["2026-06-08", 52, 58],
    [DEMO_TODAY, 47, 55],
  ],
  sources: [
    {
      id: "cpi-s1",
      publication: "Bureau of Labor Statistics",
      headline: "Shelter component decelerates for a fourth month",
      date: "2026-07-14",
      relevance: 0.88,
      supports: "YES",
      quality: "primary",
    },
    {
      id: "cpi-s2",
      publication: "Energy Information Administration",
      headline: "Forward curve implies flat energy prices into Q4",
      date: "2026-07-30",
      relevance: 0.7,
      supports: "YES",
      quality: "primary",
    },
    {
      id: "cpi-s3",
      publication: "Bloomberg",
      headline: "Goods prices tick up on freight cost pass-through",
      date: "2026-08-02",
      relevance: 0.66,
      supports: "NO",
      quality: "reliable-secondary",
    },
    {
      id: "cpi-s4",
      publication: "Bank research note",
      headline: "Base effects turn unfavourable in Q4",
      date: "2026-06-20",
      relevance: 0.75,
      supports: "NO",
      quality: "reliable-secondary",
    },
  ],
  evidence: [
    {
      id: "cpi-e1",
      title: "Shelter disinflation is persistent",
      explanation:
        "Four consecutive months of deceleration in the largest CPI component, and shelter turns slowly enough that the trend is unlikely to reverse by December.",
      impact: 6,
      confidence: 0.85,
      sourceIds: ["cpi-s1"],
      agent: "news",
    },
    {
      id: "cpi-e2",
      title: "Market over-weights recent goods prints",
      explanation:
        "Goods are a small share of the index, but the market repriced 5 points on a single goods release, a textbook recency reaction.",
      impact: 5,
      confidence: 0.72,
      sourceIds: ["cpi-s3"],
      agent: "contrarian",
    },
    {
      id: "cpi-e3",
      title: "Energy curve is flat",
      explanation:
        "The forward curve implies no energy contribution either way, removing the most common source of upside surprises.",
      impact: 3,
      confidence: 0.68,
      sourceIds: ["cpi-s2"],
      agent: "base-rate",
    },
    {
      id: "cpi-e4",
      title: "Base effects turn unfavourable",
      explanation:
        "Q4 2025 comparisons were unusually soft, which mechanically lifts the year-over-year rate in the December print.",
      impact: -4,
      confidence: 0.8,
      sourceIds: ["cpi-s4"],
      agent: "base-rate",
    },
    {
      id: "cpi-e5",
      title: "Freight pass-through is real but small",
      explanation:
        "The mechanism is genuine, though its historical contribution to headline CPI has been under 0.1 points.",
      impact: -2,
      confidence: 0.6,
      sourceIds: ["cpi-s3"],
      agent: "skeptic",
    },
  ],
  scenarios: [
    {
      id: "cpi-sc1",
      title: "Shelter decelerates again in September",
      detail: "A fifth month would make the December threshold likely.",
      shift: 15,
      likelihood: 0.5,
    },
    {
      id: "cpi-sc2",
      title: "Energy rises more than 8% in Q4",
      detail: "The most common cause of upside surprises in headline CPI.",
      shift: -21,
      likelihood: 0.2,
    },
    {
      id: "cpi-sc3",
      title: "A hot October core print",
      detail: "Would signal breadth beyond goods and change the picture.",
      shift: -13,
      likelihood: 0.3,
    },
  ],
  uncertainties: [
    "The question resolves on the initial release, so subsequent revisions do not count.",
    "A rounding boundary at 2.45–2.5% makes near-threshold outcomes contentious.",
  ],
  explanation:
    "Contrary is 8 points above consensus. Shelter, the largest component, has decelerated for four straight months and turns slowly. The market repriced sharply on one goods release, which historically contributes under a tenth of a point to the headline rate.",
  agentSpec: {
    "base-rate": {
      p: 52,
      c: 0.74,
      w: 0.22,
      points: [
        "Four-month shelter trends persisted through the following quarter in 7 of 9 cases",
        "Flat energy curves preceded in-line headline prints most of the time",
        "Unfavourable base effects added a median of 0.2 points",
      ],
      summary:
        "Historical persistence in shelter outweighs the mechanical drag from base effects, but not by a wide margin.",
    },
    news: {
      p: 60,
      c: 0.78,
      w: 0.2,
      points: [
        "Fourth consecutive month of shelter deceleration in July",
        "Flat energy forward curve as of late July",
        "Goods prices ticked up in the August report",
      ],
      summary:
        "The disinflationary signals are in the larger and slower-moving components; the inflationary one is in the smallest.",
    },
    contrarian: {
      p: 62,
      c: 0.7,
      w: 0.22,
      points: [
        "A 5-point market move on a goods print that affects under a tenth of a point",
        "The crowd is treating base effects as new information when they were knowable in June",
        "Consensus keeps re-forecasting the last print rather than the December one",
      ],
      summary:
        "The market's recent decline reflects a recency reaction to a small component rather than any change in the December outlook.",
    },
    market: {
      p: 48,
      c: 0.72,
      w: 0.2,
      points: [
        "47% YES, down 3 points over seven days",
        "Peaked at 52% in June before the goods data",
        "Heavy volume and tight spreads",
      ],
      summary:
        "A deep, liquid market, but its recent move maps almost exactly onto one data release.",
    },
    skeptic: {
      p: 52,
      c: 0.68,
      w: 0.16,
      points: [
        "Both bullish signals are primary government releases",
        "The base-effects note and goods coverage share an underlying argument",
        "Freight pass-through is real but its magnitude is routinely overstated",
      ],
      summary:
        "Evidence quality is high on both sides here. One bearish signal was reduced for overstating a small effect.",
    },
  },
});

export const DEMO_MARKETS: Market[] = [
  gptMarket,
  foldMarket,
  bocMarket,
  oswMarket,
  cpiMarket,
  robotaxiMarket,
  boxOfficeMarket,
  fusionMarket,
];

export function getDemoMarket(id: string): Market | undefined {
  return DEMO_MARKETS.find((m) => m.id === id);
}
