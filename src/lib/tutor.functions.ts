import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AskTutorSchema, QuizSchema, SolveSchema } from "./tutor.schemas";

export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskTutorSchema.parse(input))
  .handler(async ({ data }) => {
    const { callGateway, tutorSystemPrompt } = await import("./tutor.server");
    const answer = await callGateway([
      {
        role: "system",
        content: tutorSystemPrompt({
          mode: data.mode,
          language: data.language,
          bilingual: data.bilingual,
          context: data.chapterContext,
        }),
      },
      { role: "user", content: data.question },
    ]);
    return { answer };
  });

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => QuizSchema.parse(input))
  .handler(async ({ data }) => {
    const { callGateway, parseJsonLoose } = await import("./tutor.server");
    const raw = await callGateway(
      [
        {
          role: "system",
          content: [
            "You write multiple-choice quizzes for school students.",
            `Difficulty: ${data.mode}.`,
            data.bilingual
              ? `Each question text must contain the English version, then a newline, then the same question in ${data.language}.`
              : "Write everything in English.",
            'Reply with JSON only: {"questions":[{"question":string,"options":[4 strings],"answerIndex":number,"explanation":string,"topic":string}]}.',
            "answerIndex is 0-based. Keep options short and mutually exclusive. topic is a 1-4 word sub-topic label.",
          ].join(" "),
        },
        {
          role: "user",
          content: `Create exactly ${data.count} questions on: ${data.chapterContext}`,
        },
      ],
      { json: true, maxTokens: 3000 },
    );

    const parsed = parseJsonLoose<{
      questions: {
        question: string;
        options: string[];
        answerIndex: number;
        explanation: string;
        topic?: string;
      }[];
    }>(raw);

    const questions = (parsed.questions ?? [])
      .filter((q) => q?.question && Array.isArray(q.options) && q.options.length >= 2)
      .slice(0, data.count)
      .map((q) => ({
        question: String(q.question),
        options: q.options.slice(0, 4).map((o) => String(o)),
        answerIndex: Math.min(Math.max(Number(q.answerIndex) || 0, 0), q.options.length - 1),
        explanation: String(q.explanation ?? ""),
        topic: q.topic ? String(q.topic) : undefined,
      }));

    if (!questions.length) throw new Error("Could not build a quiz for this chapter. Try again.");
    return { questions };
  });

export const solveQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SolveSchema.parse(input))
  .handler(async ({ data }) => {
    const { callGateway, tutorSystemPrompt, attachmentPart } = await import("./tutor.server");
    if (!data.text && !data.attachment) throw new Error("Add a question or a file first.");

    const parts: Parameters<typeof callGateway>[0][number]["content"] = [
      {
        type: "text" as const,
        text: [
          data.attachment
            ? "Read the attached question paper or image, transcribe each question you find, then solve it."
            : "Solve the question below.",
          data.text ? `Student's note: ${data.text}` : "",
          "Structure every solution as: '## Question', '## Given', '## Step-by-step solution' (numbered steps, one idea per step, show the reasoning), '## Final answer' (bold), '## Where students slip up'.",
        ]
          .filter(Boolean)
          .join("\n"),
      },
      ...(data.attachment ? [attachmentPart(data.attachment)] : []),
    ];

    const answer = await callGateway([
      {
        role: "system",
        content: tutorSystemPrompt({
          mode: data.mode,
          language: data.language,
          bilingual: data.bilingual,
        }),
      },
      { role: "user", content: parts },
    ]);

    return { answer };
  });
