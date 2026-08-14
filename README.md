# Contrary

**Prediction markets tell you what the crowd believes. Contrary tells you where the crowd might be wrong.**

Contrary is a forecasting and decision-intelligence platform. It takes real-world
questions, produces its own independent probability using five specialist AI
agents, and then shows exactly which evidence pushes that forecast away from
market consensus, and how much of that evidence survives scrutiny.

It is not a chatbot. There is no text input anywhere in the product. The AI runs
behind prediction cards, charts, timelines, scenario toggles, and evidence panels.

---

## What's in it

| Page | What it does |
| --- | --- |
| **Discover** (`/`) | Prediction cards with market probability, Contrary's forecast, movement, volume, a dual sparkline, and a disagreement score. Filter by category. Sort by For you / trending / largest disagreement / most certain / recently changed. |
| **Forecast detail** (`/forecast/[id]`) | Market vs. Contrary probability, the difference, probability over time, the multi-agent panel, the Disagreement Engine, the scenario simulator, the Time Machine, and every source. |
| **Your lens** (`/lens`) | Name, categories you follow, and how to weight the agents (General, or extra weight on one specialist). Saved on this device. If Backboard is configured, also stored as assistant memory. |
| **Watchlist** (`/watchlist`) | Tracked questions, sorted by disagreement. Persisted in `localStorage`. |
| **Track Record** (`/track-record`) | Accuracy, Brier score vs. market, calibration chart, the AI Forecaster Leaderboard, and recently resolved questions. |
| **How It Works** (`/how-it-works`) | The pipeline and the five agents. |

### The Disagreement Engine

Each forecast decomposes into weighted signals. A horizontal contribution
waterfall runs from the market price to Contrary's forecast, with every segment
sized by its contribution and coloured by direction. Signals expand to show the
explanation, confidence, sources, and any Skeptic Agent note.

The dataset enforces this invariant: **the signal contributions always sum
exactly to the gap versus consensus.** `npx tsx scripts/verify-data.ts` checks it.

### Time Machine

A timeline slider rewinds any deeply researched question. At each point it shows
the market probability, Contrary's probability, the evidence available *at that
date*, and the events that moved the forecast. Sources published after the
selected date are filtered out and the chart truncates. No hindsight.

`foldable-2027` is the showcase: Contrary was 15 points above consensus in March
and the market took until June to catch up.

### Scenario simulator

Toggle scenarios on and off and the probability animates to its revised value,
with the market price marked on the bar for reference.

### Your lens

Personalization without a login. Discover **For you** ranks questions by
disagreement, watched items, and the categories you follow. On a forecast page,
**Your reading** is a second probability: same five agents, extra weight on the
specialist you chose. Pick **General** if you want the official combined
forecast with no extra lean. **Clear lens** wipes it from this device.

If Backboard is configured, saving a lens creates (or reuses) an assistant,
writes a memory, and sends a message with `memory: "Auto"`. Live agent runs pass
that `assistant_id` with `memory: "Readonly"`.

---

## The forecasting system

Five specialists forecast **independently**, then a deterministic aggregator
combines them.

| Agent | Mandate |
| --- | --- |
| **Base Rate** | How often do events like this actually occur? |
| **News** | What changed recently that genuinely moves the forecast? |
| **Contrarian** | What is the crowd assuming that may not hold? |
| **Market Analyst** | What does the price imply, and how is it moving? |
| **Skeptic** | Which of this evidence does not survive scrutiny? |

Two design decisions matter here:

**The market price is withheld from four of the five agents.** Only the Market
Analyst sees it. In testing, showing every agent the consensus price collapsed
their estimates toward it and the system produced a 3-point disagreement on a
question where the evidence supported 18. Independence has to be enforced, not
requested.

**The combined probability is computed, not generated.** Each agent is weighted
by its role weight multiplied by its own stated confidence. Asking a model for
the final number let it drift back toward the price it could see, and it made
the headline figure unverifiable. Now the number is a function of the five
probabilities on screen, and stated confidence drops as the agents spread apart.
The aggregator model only writes the explanation and the uncertainties.

Chain-of-thought is never displayed. Only concise evidence and reasoning
summaries.

### Source quality

Every source is tagged **Primary**, **Reliable secondary**, **Unverified**, or
**Duplicate**, with a relevance score and a YES/NO stance. The Skeptic Agent
flags circular reporting and unverifiable claims, and those signals are visibly
down-weighted rather than silently averaged in.

---

## Running it

```bash
npm install
cp .env.example .env.local   # optional. See below
npm run dev
```

Open http://localhost:3000.

The app is fully functional with **no configuration at all**. Every page runs on
a seeded dataset of 8 markets, two with rich historical timelines.

### Connecting Backboard

Add a key to `.env.local` to enable live multi-agent runs and lens memory:

```
BACKBOARD_API_KEY=your_key
BACKBOARD_PROVIDER=openai
BACKBOARD_MODEL=gpt-4o
```

Then set **Your lens** (avatar in the nav) and use **Re-run live agents** on any
forecast page. The five agents run in parallel against Backboard (typically
8 to 20 seconds), the pipeline stages animate, and the panel marks the result as a
live run.

Live runs are deliberately opt-in. Pages load instantly from the seeded dataset,
so a walkthrough never waits on, or breaks because of, a network call. Any
failure at any stage falls back to seeded data for that piece and keeps
rendering.

---

## Architecture

```
src/
  app/
    page.tsx                    Discover
    forecast/[id]/page.tsx      Forecast detail
    lens/                       Your lens
    watchlist/, track-record/, how-it-works/
    api/forecast/[id]/route.ts  Runs the agent pipeline
    api/memory/route.ts         Creates a Backboard assistant and stores the lens
  components/
    PredictionCard  ProbabilityChart  AgentForecasts  EvidencePanel
    ScenarioSimulator  TimeMachine  SourceCard  CalibrationChart
    ForecastPipeline  AnimatedNumber  Sparkline  Navbar
    LensForm  LensAvatar  ForYouNote
    ui/             Button, Badge, Switch, Slider
  lib/
    types.ts          Market, Forecast, AgentForecast, Evidence,
                      Scenario, HistoricalSnapshot, Source, TrackRecord
    api.ts            The only boundary the UI talks to
    agents.ts         Agent metadata and pipeline stages
    backboard.ts      Backboard REST client (server-only)
    forecast-engine.ts  Agent prompts, parallel execution, aggregation
    lens.ts           Lens model, For you ranking, Your reading
    storage.ts        Shared localStorage helper
    demo/             Seeded markets, series generator, track record
scripts/
  verify-data.ts      Dataset invariant checks
```

`src/lib/api.ts` is the seam. No component imports demo data directly, so
swapping in a live prediction-market feed means editing `listMarkets`,
`getMarket`, and `getTrackRecord`. Nothing in the UI changes.

Backboard is not OpenAI-compatible. It uses `X-API-Key` against
`https://app.backboard.io/api/threads/messages`, takes a single `content` string
per turn rather than a `messages` array, and returns the reply at the top level
of the response. `src/lib/backboard.ts` wraps that.

Lens sync posts to `/api/memory`, not `/api/lens`, so it does not collide with
the `/lens` page.

---

## Stack

Next.js 16 (App Router) · TypeScript · React 19 · Tailwind CSS v4 · Radix
primitives · Recharts · lucide-react · Backboard

No database. Nothing to provision. `npm install && npm run dev` is the whole
setup.

---

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build (type-checks everything)
npm run lint       # eslint
npx tsx scripts/verify-data.ts   # dataset invariant checks
```

---

Contrary is a forecasting research tool. Probabilities are estimates, not advice.
