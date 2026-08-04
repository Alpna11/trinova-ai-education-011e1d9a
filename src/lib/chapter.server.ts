// Server-only prompt builders for chapter material generation.
import type { MaterialKind } from "./chapter.schemas";

export function materialPrompt(opts: {
  kind: MaterialKind;
  mode: string;
  language: string;
  bilingual: boolean;
  context: string;
}) {
  const bilingualNote = opts.bilingual
    ? `Every piece of prose must appear in English first, then the same content in ${opts.language} after a newline prefixed with "${opts.language}: ".`
    : "Write everything in English.";

  const shapes: Record<MaterialKind, string> = {
    notes:
      '{"markdown": string, "keyTerms": [{"term": string, "meaning": string}]}. markdown must use "## " sections, short bullets, bold key terms, worked examples where useful, and end with a "## Quick recap" of 3 bullets.',
    practice:
      '{"questions": [{"question": string, "level": "easy"|"medium"|"hard", "hint": string, "solution": string, "topic": string}]}. Produce 8 questions across levels. solution shows numbered steps.',
    pyq: '{"questions": [{"year": string, "marks": string, "question": string, "solution": string, "topic": string}]}. Produce 6 exam-style questions typical of past board papers for this chapter. Mark year as a plausible recent exam year and note it is representative, never claim an exact paper.',
    resources:
      '{"videos": [{"title": string, "channel": string, "searchQuery": string, "why": string}], "readings": [{"title": string, "note": string}]}. Give 5 videos and 3 readings. searchQuery is a YouTube search phrase; never invent video URLs or IDs.',
  };

  return [
    "You create curriculum-accurate study material for Indian school boards (CBSE/ICSE).",
    `Depth level: ${opts.mode}.`,
    bilingualNote,
    "Never invent facts. Keep maths in plain notation (x^2, sqrt(9)).",
    `Reply with JSON only, exactly this shape: ${shapes[opts.kind]}`,
    `Chapter: ${opts.context}`,
  ].join("\n");
}
