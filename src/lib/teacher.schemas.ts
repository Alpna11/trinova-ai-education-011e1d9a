import { z } from "zod";

export const QUESTION_KINDS = ["mcq", "truefalse", "short"] as const;
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type QuestionKind = (typeof QUESTION_KINDS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export const KIND_LABELS: Record<QuestionKind, string> = {
  mcq: "MCQ",
  truefalse: "True / False",
  short: "Short answer",
};

export const GenerateQuestionsSchema = z.object({
  chapterId: z.string().uuid(),
  topic: z.string().trim().max(120).optional(),
  difficulty: z.enum(DIFFICULTIES),
  kind: z.enum(QUESTION_KINDS),
  count: z.number().int().min(1).max(12),
  language: z.string().min(2).max(40).default("English"),
  bilingual: z.boolean().default(false),
});

export const StudentQuizSchema = z.object({ quizId: z.string().uuid() });

export const SubmitQuizSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(z.string().max(2000)).max(60),
});

export type GeneratedQuestion = {
  prompt: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  marks: number;
};
