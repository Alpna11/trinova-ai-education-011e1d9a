// Server-only helpers for Edunova's AI tutor. Never imported by client code directly.
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

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

export async function callGateway(
  messages: ChatMessage[],
  options: { json?: boolean; maxTokens?: number } = {},
): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet. Missing LOVABLE_API_KEY.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: options.maxTokens ?? 2600,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[edunova-ai] gateway ${res.status}: ${body}`);
    if (res.status === 429) throw new Error("The AI tutor is busy right now. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted. Add credits to keep tutoring.");
    throw new Error(`AI request failed (${res.status}).`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The AI tutor returned an empty answer. Please try again.");
  return text;
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
