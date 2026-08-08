import "server-only";

const BASE_URL = process.env.BACKBOARD_BASE_URL ?? "https://app.backboard.io/api";

export interface BackboardOptions {
  systemPrompt: string;
  content: string;
  /** Request a raw JSON object back rather than prose. */
  json?: boolean;
  timeoutMs?: number;
}

export interface BackboardResult {
  content: string;
  threadId?: string;
  model?: string;
}

export class BackboardError extends Error {}

export function backboardConfigured() {
  return Boolean(process.env.BACKBOARD_API_KEY);
}

/**
 * Backboard is not OpenAI-compatible: one `content` string per turn instead of a
 * messages array, and the reply sits at the top level of the response.
 */
export async function backboardMessage(
  opts: BackboardOptions
): Promise<BackboardResult> {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) throw new BackboardError("BACKBOARD_API_KEY is not set");

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 45_000
  );

  try {
    const res = await fetch(`${BASE_URL}/threads/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        content: opts.content,
        system_prompt: opts.systemPrompt,
        llm_provider: process.env.BACKBOARD_PROVIDER ?? "openai",
        model_name: process.env.BACKBOARD_MODEL ?? "gpt-4o",
        stream: false,
        json_output: opts.json ?? false,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new BackboardError(
        `Backboard responded ${res.status}: ${detail.slice(0, 300)}`
      );
    }

    const data = (await res.json()) as {
      content?: string;
      thread_id?: string;
      model_name?: string;
    };

    if (!data.content) throw new BackboardError("Empty response from Backboard");

    return {
      content: data.content,
      threadId: data.thread_id,
      model: data.model_name,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Models wrap JSON in prose or code fences often enough to be worth handling. */
export function parseJsonResponse<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new BackboardError("No JSON object found in response");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
