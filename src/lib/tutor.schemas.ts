import { z } from "zod";

export const AttachmentSchema = z.object({
  dataUrl: z.string().min(16).max(9_000_000),
  fileName: z.string().min(1).max(200),
  mimeType: z.string().min(3).max(120),
});

export const AskTutorSchema = z.object({
  mode: z.enum(["simple", "standard", "advanced"]),
  language: z.string().min(2).max(40),
  bilingual: z.boolean(),
  chapterContext: z.string().max(600).optional(),
  question: z.string().trim().min(3).max(4000),
});

export const QuizSchema = z.object({
  mode: z.enum(["simple", "standard", "advanced"]),
  language: z.string().min(2).max(40),
  bilingual: z.boolean(),
  chapterContext: z.string().max(600),
  count: z.number().int().min(3).max(10),
});

export const SolveSchema = z.object({
  mode: z.enum(["simple", "standard", "advanced"]),
  language: z.string().min(2).max(40),
  bilingual: z.boolean(),
  text: z.string().trim().max(4000).optional(),
  attachment: AttachmentSchema.optional(),
});

export type AskTutorInput = z.infer<typeof AskTutorSchema>;
export type QuizInput = z.infer<typeof QuizSchema>;
export type SolveInput = z.infer<typeof SolveSchema>;
