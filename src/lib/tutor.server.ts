// Server-only helpers for Edunova's AI tutor. Never imported by client code directly.
// All AI calls run here: the API key stays in server env vars and is never sent to the browser.
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
// Direct Google Gemini endpoint, used only when a GEMINI_API_KEY is configured.
const GEMINI_DIRECT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const MODEL = "google/gemini-3.6-flash";
const DIRECT_MODEL = "gemini-flash-latest";
const TIMEOUT_MS = 60_000;

type Part =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | Part[];
};

function modeInstruction(mode: string) {
  switch (mode) {
    case "simple":
      return "Explain like the learner is new to the topic: short sentences, everyday analogies, no jargon unless you define it immediately.";
    case "advanced":
      return "Go deep: precise terminology, underlying reasoning, common misconceptions, edge cases, and one challenging extension question.";
    default:
      return "Explain at standard school-textbook depth, exam-oriented, with clear structure and worked examples.";
  }
}

export function tutorSystemPrompt(opts: {
  mode: string;
  language: string;
  bilingual: boolean;
  context?: string | undefined;
}) {
  const lines = [
    "You are Edunova's AI tutor for school students. You are warm, encouraging and never condescending.",
    modeInstruction(opts.mode),
    "Format your answer in markdown: a one-line summary, then '## ' sections, short bullet points, bold key terms, and a final '## Quick recap' with 3 bullets.",
    "Use LaTeX-free plain notation for maths (e.g. x^2, sqrt(9)). Never invent facts; if unsure, say so.",
  ];
  if (opts.bilingual) {
    lines.push(
      `Write every section twice: first in English, then the same content in ${opts.language} under a nested heading '### ${opts.language}'. Keep the ${opts.language} version natural, not word-for-word.`,
    );
  } else {
    lines.push("Answer in English.");
  }
  if (opts.context) lines.push(`Curriculum context: ${opts.context}`);
  return lines.join("\n");
}

type Provider = {
  label: string;
  url: string;
  model: string;
  extras: Record<string, unknown>;
  headers: Record<string, string>;
};

// Ordered list of providers. We try each in turn so a quota/credit wall on one
// does not take the tutor down.
function resolveProviders(): Provider[] {
  const providers: Provider[] = [];
  const geminiKey = process.env["GEMINI_API_KEY"];
  if (geminiKey) {
    providers.push({
      label: "gemini-direct",
      url: GEMINI_DIRECT,
      model: DIRECT_MODEL,
      // Minimal thinking: Flash otherwise spends seconds on hidden reasoning.
      extras: { reasoning_effort: "low" },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${geminiKey}`,
      },
    });
  }
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    providers.push({
      label: "lovable-gateway",
      url: GATEWAY,
      model: MODEL,
      extras: {},
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": lovableKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
    });
  }
  // Helpful for production debugging: log how many AI providers are configured
  // without exposing any key material.
  console.log(`[edunova-ai] providers configured: ${providers.length} (gemini=${geminiKey ? "yes" : "no"}, lovable=${lovableKey ? "yes" : "no"})`);
  return providers;
}

class RetryableError extends Error {}

async function callProvider(
  provider: Provider,
  messages: ChatMessage[],
  options: { json?: boolean; maxTokens?: number },
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(provider.url, {
      method: "POST",
      headers: provider.headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: options.maxTokens ?? 2600,
        ...provider.extras,
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch (error) {
    console.error(`[edunova-ai] ${provider.label} network failure`, error);
    throw new RetryableError("Couldn't reach the AI service. Check your connection and try again.");
  }

  if (!res.ok) {
    const body = await res.text();
    console.error(`[edunova-ai] ${provider.label} ${res.status}: ${body.slice(0, 400)}`);
    if (res.status === 401 || res.status === 403) {
      throw new RetryableError("The AI key is invalid or lacks access. Please update it and retry.");
    }
    if (res.status === 429) {
      throw new RetryableError(
        "This AI key has hit its usage limit for now. Try again later or add credits/quota.",
      );
    }
    if (res.status === 402) {
      throw new RetryableError("AI credits are exhausted. Add credits to keep tutoring.");
    }
    if (res.status === 404) {
      throw new RetryableError("The AI model is unavailable right now. Please try again shortly.");
    }
    if (res.status >= 500) {
      throw new RetryableError("The AI service is temporarily unavailable. Please try again.");
    }
    throw new RetryableError(`AI request failed (${res.status}).`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new RetryableError("The AI tutor returned an empty answer. Please try again.");
  }
  return text;
}

export async function callGateway(
  messages: ChatMessage[],
  options: { json?: boolean; maxTokens?: number; retries?: number } = {},
): Promise<string> {
  const providers = resolveProviders();
  if (providers.length === 0) {
    throw new Error("AI is not configured yet. Add a GEMINI_API_KEY to enable the tutor.");
  }
  const attempts = Math.max(1, (options.retries ?? 1) + 1);
  let lastError: Error | null = null;
  let sawCreditError = false;

  for (let attempt = 0; attempt < attempts; attempt++) {
    for (const provider of providers) {
      try {
        return await callProvider(provider, messages, options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("AI request failed.");
        if (lastError.message.includes("credits") || lastError.message.includes("usage limit")) {
          sawCreditError = true;
        }
      }
    }
    if (attempt < attempts - 1) await new Promise((r) => setTimeout(r, 1000));
  }

  const baseMessage = lastError?.message ?? "The AI tutor is unavailable right now.";
  if (sawCreditError && !process.env["GEMINI_API_KEY"]) {
    throw new Error(
      `${baseMessage} To keep Edunova free to run, add a GEMINI_API_KEY in project settings.`,
    );
  }
  throw new Error(baseMessage);
}


export function parseJsonLoose<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    throw new Error("The AI returned an unreadable response. Please try again.");
  }
}

export function attachmentPart(input: {
  dataUrl: string;
  fileName: string;
  mimeType: string;
}): Part {
  if (input.mimeType.startsWith("image/")) {
    return { type: "image_url", image_url: { url: input.dataUrl } };
  }
  return { type: "file", file: { filename: input.fileName, file_data: input.dataUrl } };
}
