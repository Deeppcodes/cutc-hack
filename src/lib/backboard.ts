import "server-only";

const BASE_URL = process.env.BACKBOARD_BASE_URL ?? "https://app.backboard.io/api";

export interface BackboardOptions {
  systemPrompt: string;
  content: string;
  json?: boolean;
  timeoutMs?: number;
  assistantId?: string;
  memory?: "Auto" | "Readonly" | "off";
}

export interface BackboardResult {
  content: string;
  threadId?: string;
  assistantId?: string;
  model?: string;
}

export class BackboardError extends Error {}

export function backboardConfigured() {
  return Boolean(process.env.BACKBOARD_API_KEY);
}

function headers() {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) throw new BackboardError("BACKBOARD_API_KEY is not set");
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
  };
}

async function request<T>(
  path: string,
  init: RequestInit,
  timeoutMs = 45_000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { ...headers(), ...(init.headers ?? {}) },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new BackboardError(
        `Backboard ${path} ${res.status}: ${detail.slice(0, 300)}`
      );
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function createAssistant(name: string, systemPrompt: string) {
  const data = await request<{ assistant_id: string }>("/assistants", {
    method: "POST",
    body: JSON.stringify({ name, system_prompt: systemPrompt }),
  });
  if (!data.assistant_id) throw new BackboardError("No assistant_id returned");
  return data.assistant_id;
}

export async function addMemory(
  assistantId: string,
  content: string,
  metadata?: Record<string, string>
) {
  await request(`/assistants/${assistantId}/memories`, {
    method: "POST",
    body: JSON.stringify({ content, metadata: metadata ?? null }),
  });
}

export async function backboardMessage(
  opts: BackboardOptions
): Promise<BackboardResult> {
  const body: Record<string, unknown> = {
    content: opts.content,
    system_prompt: opts.systemPrompt,
    llm_provider: process.env.BACKBOARD_PROVIDER ?? "openai",
    model_name: process.env.BACKBOARD_MODEL ?? "gpt-4o",
    stream: false,
    json_output: opts.json ?? false,
    memory: opts.memory ?? "off",
  };
  if (opts.assistantId) body.assistant_id = opts.assistantId;

  const data = await request<{
    content?: string;
    thread_id?: string;
    assistant_id?: string;
    model_name?: string;
  }>("/threads/messages", {
    method: "POST",
    body: JSON.stringify(body),
  }, opts.timeoutMs ?? 45_000);

  if (!data.content) throw new BackboardError("Empty response from Backboard");

  return {
    content: data.content,
    threadId: data.thread_id,
    assistantId: data.assistant_id,
    model: data.model_name,
  };
}

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
