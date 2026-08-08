import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  GenerateQuestionsSchema,
  StudentQuizSchema,
  SubmitQuizSchema,
  type GeneratedQuestion,
} from "./teacher.schemas";

async function chapterContext(
  supabase: { from: (t: string) => any },
  chapterId: string,
): Promise<string> {
  const { data } = await supabase
    .from("chapters")
    .select("name, summary, subjects(name, grade_levels(name, boards(name)))")
    .eq("id", chapterId)
    .maybeSingle();
  if (!data) throw new Error("Chapter not found.");
  const subject = data.subjects as {
    name: string;
    grade_levels: { name: string; boards: { name: string } | null } | null;
  } | null;
  return [
    subject?.grade_levels?.boards?.name,
    subject?.grade_levels?.name,
    subject?.name,
    data.name,
  ]
    .filter(Boolean)
    .join(" • ");
}

async function assertTeacher(supabase: { from: (t: string) => any }, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("teacher") && !roles.includes("admin")) {
    throw new Error("Teacher access required.");
  }
}

/** AI question generation — runs exclusively on the Gemini backend. */
export const generateTeacherQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateQuestionsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertTeacher(context.supabase, context.userId);
    const { callGateway, parseJsonLoose } = await import("./tutor.server");
    const ctx = await chapterContext(context.supabase, data.chapterId);

    const shape =
      data.kind === "mcq"
        ? '{"questions":[{"prompt":string,"options":[4 strings],"correct_answer":string (must exactly match one option),"explanation":string,"marks":number}]}'
        : data.kind === "truefalse"
          ? '{"questions":[{"prompt":string,"options":["True","False"],"correct_answer":"True"|"False","explanation":string,"marks":number}]}'
          : '{"questions":[{"prompt":string,"options":[],"correct_answer":string (model answer, 1-3 sentences),"explanation":string,"marks":number}]}';

    const raw = await callGateway(
      [
        {
          role: "system",
          content: [
            "You are an exam-paper setter for Indian school boards.",
            `Question type: ${data.kind}. Difficulty: ${data.difficulty}.`,
            data.bilingual
              ? `Each prompt must show the English version, a newline, then the same prompt in ${data.language}.`
              : "Write everything in English.",
            `Reply with JSON only: ${shape}`,
            "No preamble. Keep explanations to 1-3 short sentences. marks: 1 for mcq/truefalse, 2-5 for short answer.",
          ].join(" "),
        },
        {
          role: "user",
          content: `Create exactly ${data.count} questions for: ${ctx}${
            data.topic ? ` — topic: ${data.topic}` : ""
          }`,
        },
      ],
      { json: true, maxTokens: 2600 },
    );

    const parsed = parseJsonLoose<{ questions: GeneratedQuestion[] }>(raw);
    const questions = (parsed.questions ?? [])
      .filter((q) => q?.prompt)
      .slice(0, data.count)
      .map((q) => ({
        prompt: String(q.prompt),
        options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [],
        correct_answer: String(q.correct_answer ?? ""),
        explanation: String(q.explanation ?? ""),
        marks: Math.min(Math.max(Number(q.marks) || 1, 1), 10),
      }));

    if (!questions.length) throw new Error("Gemini returned no usable questions. Try again.");
    return { questions, context: ctx };
  });

/** Student-facing quiz fetch: answers are stripped server-side. */
export const getStudentQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => StudentQuizSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // RLS on teacher_quizzes already restricts this read to published quizzes
    // for classes the student belongs to (or the owning teacher).
    const { data: quiz, error } = await context.supabase
      .from("teacher_quizzes")
      .select("id, title, instructions, time_limit_minutes, total_marks, class_id, chapter_id")
      .eq("id", data.quizId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!quiz) throw new Error("This quiz is not available to you.");

    const { data: rows } = await supabaseAdmin
      .from("teacher_quiz_questions")
      .select("id, kind, prompt, options, marks, position")
      .eq("quiz_id", data.quizId)
      .order("position", { ascending: true });

    const { data: existing } = await context.supabase
      .from("quiz_submissions")
      .select("score, total, submitted_at")
      .eq("quiz_id", data.quizId)
      .eq("student_id", context.userId)
      .maybeSingle();

    return {
      quiz,
      questions: (rows ?? []) as {
        id: string;
        kind: string;
        prompt: string;
        options: string[];
        marks: number;
        position: number;
      }[],
      submission: existing ?? null,
    };
  });

/** Grades a student submission on the server so answers never reach the browser early. */
export const submitStudentQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SubmitQuizSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: quiz } = await context.supabase
      .from("teacher_quizzes")
      .select("id, chapter_id, title")
      .eq("id", data.quizId)
      .maybeSingle();
    if (!quiz) throw new Error("This quiz is not available to you.");

    const { data: rows } = await supabaseAdmin
      .from("teacher_quiz_questions")
      .select("id, kind, prompt, options, correct_answer, explanation, marks, position")
      .eq("quiz_id", data.quizId)
      .order("position", { ascending: true });

    const questions = (rows ?? []) as {
      id: string;
      kind: string;
      prompt: string;
      correct_answer: string | null;
      explanation: string | null;
      marks: number;
    }[];

    let score = 0;
    let total = 0;
    const weak: string[] = [];
    const results = questions.map((q, i) => {
      const given = (data.answers[i] ?? "").trim();
      const expected = (q.correct_answer ?? "").trim();
      total += q.marks;
      let correct = false;
      if (q.kind === "short") {
        // Lenient keyword overlap for free-text answers; teachers can re-grade.
        const words = expected.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
        const got = given.toLowerCase();
        const hits = words.filter((w) => got.includes(w)).length;
        correct = words.length > 0 && hits / words.length >= 0.5;
      } else {
        correct = given.length > 0 && given.toLowerCase() === expected.toLowerCase();
      }
      if (correct) score += q.marks;
      else weak.push(q.prompt.split("\n")[0]!.slice(0, 60));
      return {
        prompt: q.prompt,
        given,
        expected,
        explanation: q.explanation ?? "",
        marks: q.marks,
        correct,
      };
    });

    const { error } = await supabaseAdmin.from("quiz_submissions").upsert(
      {
        quiz_id: data.quizId,
        student_id: context.userId,
        answers: data.answers as never,
        score,
        total,
        weak_topics: weak.slice(0, 8),
      } as never,
      { onConflict: "quiz_id,student_id" },
    );
    if (error) throw new Error(error.message);

    return { score, total, results };
  });
