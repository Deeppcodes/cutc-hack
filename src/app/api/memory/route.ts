import { NextResponse } from "next/server";

import {
  addMemory,
  backboardConfigured,
  backboardMessage,
  createAssistant,
} from "@/lib/backboard";
import { lensToMemory, type Lens } from "@/lib/lens";

export const dynamic = "force-dynamic";

const ASSISTANT_PROMPT =
  "You are Contrary memory for one reader. Store their name, categories they follow, which forecasting agent they trust, and any note they gave. When asked later, recall those facts. Do not invent extra biography.";

export async function POST(request: Request) {
  let lens: Lens | undefined;
  try {
    const body = (await request.json()) as { lens?: Lens };
    lens = body.lens;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!lens) {
    return NextResponse.json({ error: "Missing lens" }, { status: 400 });
  }

  if (!backboardConfigured()) {
    return NextResponse.json({
      assistantId: lens.assistantId ?? null,
      synced: false,
    });
  }

  try {
    const assistantId =
      lens.assistantId ||
      (await createAssistant(
        `Contrary ${lens.name.trim() || "reader"}`,
        ASSISTANT_PROMPT
      ));

    const memory = lensToMemory({ ...lens, assistantId });
    await addMemory(assistantId, memory, { kind: "lens" });
    await backboardMessage({
      systemPrompt: ASSISTANT_PROMPT,
      content: `Save this reader's lens for later forecasts.\n${memory}`,
      assistantId,
      memory: "Auto",
      timeoutMs: 30_000,
    });

    return NextResponse.json({ assistantId, synced: true });
  } catch (error) {
    return NextResponse.json({
      assistantId: lens.assistantId ?? null,
      synced: false,
      reason: error instanceof Error ? error.message : "Sync failed",
    });
  }
}
