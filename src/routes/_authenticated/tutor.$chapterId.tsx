import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Languages, Loader2, ListChecks, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { askTutor, generateQuiz } from "@/lib/tutor.functions";
import { useChapterMeta, useProfile } from "@/hooks/use-profile";
import { TUTOR_MODES, type QuizQuestion, type TutorMode } from "@/lib/edunova";
import {
  bumpChapterProgress,
  countRecords,
  saveLearningRecord,
  touchContinueLearning,
  unlockAchievement,
} from "@/lib/learning";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor/$chapterId")({
  head: () => ({
    meta: [
      { title: "AI tutor session — Edunova" },
      {
        name: "description",
        content:
          "Learn any chapter with an AI tutor in simple, standard or advanced mode, with bilingual explanations and instant quizzes.",
      },
      { property: "og:title", content: "AI tutor session — Edunova" },
      {
        property: "og:description",
        content: "Explanations in three depths, bilingual support and chapter quizzes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TutorPage,
});

function TutorPage() {
  const { chapterId } = Route.useParams();
  const { data: me } = useProfile();
  const { data: chapter } = useChapterMeta(chapterId);
  const queryClient = useQueryClient();

  const ask = useServerFn(askTutor);
  const quizFn = useServerFn(generateQuiz);

  const [mode, setMode] = useState<TutorMode>("standard");
  const [bilingual, setBilingual] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);

  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [buildingQuiz, setBuildingQuiz] = useState(false);

  const language = me?.profile?.second_language ?? "Hindi";
  const userId = me?.user.id;

  useEffect(() => {
    if (!userId || !chapter) return;
    void touchContinueLearning({
      userId,
      chapterId: chapter.id,
      label: `${chapter.name} — ${chapter.path}`,
    }).then(() => queryClient.invalidateQueries({ queryKey: ["profile"] }));
  }, [userId, chapter, queryClient]);

  async function afterSave(kind: "explanation" | "quiz", title: string, body?: string) {
    if (!userId) return;
    await saveLearningRecord({
      userId,
      chapterId,
      kind,
      mode,
      language: bilingual ? language : "English",
      title,
      prompt: kind === "explanation" ? question : undefined,
      answer: body,
    });
    await unlockAchievement(userId, kind === "quiz" ? "first_quiz" : "first_lesson");
    if (bilingual) await unlockAchievement(userId, "bilingual");
    if ((await countRecords(userId)) >= 5) await unlockAchievement(userId, "five_records");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["history"] });
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || thinking) return;
    setThinking(true);
    setAnswer(null);
    try {
      const res = await ask({
        data: {
          mode,
          language,
          bilingual,
          chapterContext: chapter?.context?.slice(0, 600),
          question: question.trim(),
        },
      });
      setAnswer(res.answer);
      await afterSave("explanation", question.trim().slice(0, 120), res.answer);
      if (userId) {
        await bumpChapterProgress({ userId, chapterId, sessionDelta: 1 });
        await touchContinueLearning({
          userId,
          chapterId,
          label: `${chapter?.name ?? "Chapter"} — ${question.trim().slice(0, 60)}`,
          xp: 10,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The tutor could not answer.");
    } finally {
      setThinking(false);
    }
  }

  async function handleQuiz() {
    if (!chapter || buildingQuiz) return;
    setBuildingQuiz(true);
    setQuiz(null);
    setPicked({});
    setSubmitted(false);
    try {
      const res = await quizFn({
        data: { mode, language, bilingual, chapterContext: chapter.context.slice(0, 600), count: 5 },
      });
      setQuiz(res.questions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build a quiz.");
    } finally {
      setBuildingQuiz(false);
    }
  }

  async function submitQuiz() {
    if (!quiz || !userId) return;
    setSubmitted(true);
    const score = quiz.reduce((s, q, i) => s + (picked[i] === q.answerIndex ? 1 : 0), 0);
    const pct = Math.round((score / quiz.length) * 100);
    const weak = quiz
      .filter((q, i) => picked[i] !== q.answerIndex)
      .map((q) => q.topic ?? q.question.slice(0, 40));

    const { data: row } = await supabase
      .from("quizzes")
      .insert({
        user_id: userId,
        chapter_id: chapterId,
        title: `${chapter?.name ?? "Chapter"} quiz`,
        mode,
        language: bilingual ? language : "English",
        questions: quiz,
        answers: quiz.map((_, i) => picked[i] ?? null),
        score,
        total: quiz.length,
        weak_topics: weak,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    await afterSave("quiz", `${chapter?.name ?? "Chapter"} quiz — ${score}/${quiz.length}`);
    await bumpChapterProgress({ userId, chapterId, quizDelta: 1, masteryScore: pct });
    await touchContinueLearning({
      userId,
      chapterId,
      label: `${chapter?.name ?? "Chapter"} quiz — ${score}/${quiz.length}`,
      xp: 15 + score * 5,
    });
    if (pct === 100) await unlockAchievement(userId, "perfect_quiz");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    if (row) toast.success(`Saved — you scored ${score}/${quiz.length}`);
  }

  const score = quiz ? quiz.reduce((s, q, i) => s + (picked[i] === q.answerIndex ? 1 : 0), 0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-lime">
          {chapter?.path ?? "Loading chapter"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">{chapter?.name ?? "AI tutor"}</h1>
        {chapter?.summary ? (
          <p className="mt-1 max-w-2xl text-muted-foreground">{chapter.summary}</p>
        ) : null}
      </div>

      <div className="panel flex flex-wrap items-center gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {TUTOR_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "rounded-xl border border-border px-4 py-2 text-left transition-colors hover:bg-surface-2",
                mode === m.id && "border-primary bg-lime-soft",
              )}
            >
              <span className={cn("block text-sm font-semibold", mode === m.id && "text-lime")}>
                {m.label}
              </span>
              <span className="block text-xs text-muted-foreground">{m.blurb}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 rounded-xl border border-border px-4 py-2">
          <Languages className="size-4 text-violet" />
          <Label htmlFor="bilingual" className="text-sm">
            English + {language}
          </Label>
          <Switch id="bilingual" checked={bilingual} onCheckedChange={setBilingual} />
        </div>
      </div>

      <form onSubmit={handleAsk} className="panel space-y-3 p-5">
        <label htmlFor="q" className="font-display text-lg font-semibold">
          Ask your tutor
        </label>
        <Textarea
          id="q"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={4000}
          rows={3}
          placeholder={`e.g. Explain the main idea of ${chapter?.name ?? "this chapter"} with an example`}
        />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={thinking || !question.trim()} className="font-semibold">
            {thinking ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Explain in {mode} mode
          </Button>
          <Button type="button" variant="secondary" onClick={handleQuiz} disabled={buildingQuiz}>
            {buildingQuiz ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ListChecks className="size-4" />
            )}
            Generate 5-question quiz
          </Button>
        </div>
      </form>

      {thinking ? (
        <div className="panel flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-lime" /> Your tutor is thinking…
        </div>
      ) : null}

      {answer ? (
        <article className="panel p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lime">
            <Sparkles className="size-4" /> AI explanation · saved to your history
          </div>
          <Markdown content={answer} />
        </article>
      ) : null}

      {quiz ? (
        <section className="panel space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Chapter quiz</h2>
            {submitted ? (
              <span className="rounded-lg bg-lime-soft px-3 py-1 text-sm font-semibold text-lime">
                {score}/{quiz.length}
              </span>
            ) : null}
          </div>
          <ol className="space-y-5">
            {quiz.map((q, i) => (
              <li key={i} className="space-y-2">
                <p className="whitespace-pre-line font-medium">
                  {i + 1}. {q.question}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => {
                    const isPicked = picked[i] === oi;
                    const isRight = q.answerIndex === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={submitted}
                        onClick={() => setPicked((p) => ({ ...p, [i]: oi }))}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2",
                          isPicked && !submitted && "border-primary bg-lime-soft",
                          submitted && isRight && "border-primary bg-lime-soft text-lime",
                          submitted && isPicked && !isRight && "border-destructive text-destructive",
                        )}
                      >
                        {submitted && isRight ? <Check className="size-4 shrink-0" /> : null}
                        {submitted && isPicked && !isRight ? (
                          <X className="size-4 shrink-0" />
                        ) : null}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation ? (
                  <p className="rounded-lg bg-surface-2 p-3 text-sm text-muted-foreground">
                    {q.explanation}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
          {!submitted ? (
            <Button
              onClick={submitQuiz}
              className="font-semibold"
              disabled={Object.keys(picked).length < quiz.length}
            >
              Submit quiz
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleQuiz}>
              Try a new quiz
            </Button>
          )}
        </section>
      ) : null}
    </div>
  );
}
