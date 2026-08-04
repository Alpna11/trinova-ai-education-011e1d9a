import { z } from "zod";

export const MATERIAL_KINDS = ["notes", "practice", "pyq", "resources"] as const;
export type MaterialKind = (typeof MATERIAL_KINDS)[number];

export const ChapterMaterialSchema = z.object({
  chapterId: z.string().uuid(),
  kind: z.enum(MATERIAL_KINDS),
  mode: z.enum(["simple", "standard", "advanced"]),
  language: z.string().min(2).max(40),
  bilingual: z.boolean(),
  refresh: z.boolean().optional(),
});

export type ChapterMaterialInput = z.infer<typeof ChapterMaterialSchema>;

export type NotesPayload = {
  markdown: string;
  keyTerms: { term: string; meaning: string }[];
};

export type PracticePayload = {
  questions: { question: string; level: string; hint: string; solution: string; topic: string }[];
};

export type PyqPayload = {
  questions: { year: string; marks: string; question: string; solution: string; topic: string }[];
};

export type ResourcesPayload = {
  videos: { title: string; channel: string; searchQuery: string; why: string }[];
  readings: { title: string; note: string }[];
};

export type MaterialPayload = NotesPayload | PracticePayload | PyqPayload | ResourcesPayload;
