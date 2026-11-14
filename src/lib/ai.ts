// AI helper with graceful mock fallbacks (zero-crash guarantee for live demos).
// Uses Groq (llama-3.1-70b-versatile) if GROQ_API_KEY is set, else OpenAI gpt-4o-mini.

export type LLMProvider = "groq" | "openai" | "mock";

export function availableProvider(): LLMProvider {
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "mock";
}

interface ChatOptions {
  system?: string;
  user: string;
  jsonMode?: boolean;
  maxTokens?: number;
}

/** Call LLM with structured JSON output; returns null so callers can use deterministic fallbacks. */
export async function llmChat(opts: ChatOptions): Promise<string | null> {
  const provider = availableProvider();
  if (provider === "mock") return null;

  const base = provider === "groq" ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1";
  const model = provider === "groq" ? "llama-3.1-70b-versatile" : "gpt-4o-mini";
  const key = provider === "groq" ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(opts.system ? [{ role: "system", content: opts.system }] : []),
          { role: "user", content: opts.user },
        ],
        temperature: 0.4,
        max_tokens: opts.maxTokens ?? 1200,
        ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    return m ? (JSON.parse(m[0]) as T) : null;
  } catch {
    return null;
  }
}
