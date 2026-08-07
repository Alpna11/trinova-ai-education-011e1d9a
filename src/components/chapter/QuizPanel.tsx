import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2, ListChecks, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMockQuiz } from "@/lib/mock-content";
import { useStudyPrefs } from "@/hooks/use-study-prefs";
import type { QuizQuestion } from "@/lib/edunova";
import {
  bumpChapterProgress,
  saveLearningRecord,
  touchContinueLearning,
  unlockAchievement,
} from "@/lib/learning";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuizPanel({
  chapterId,
  chapterName,
  chapterContext,
  subjectId,
  position,
  language,
  userId,
}: {
  chapterId: string;
  chapterName: string;
  chapterContext: string;
  subjectId: string | null;
  position: number | null;
  language: string;
  userId: string | undefined;
}) {
  const { mode, bilingual } = useStudyPrefs();
  const queryClient = useQueryClient();

  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [building, setBuilding] = useState(false);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);

  const nextChapter = useQuery({
    queryKey: ["next-chapter", subjectId, position],
    enabled: !!subjectId && position !== null && submitted,
    queryFn: async () => {
      const { data } = await supabase
        .from("chapters")
        .select("id, name")
        .eq("subject_id", subjectId!)
        .gt("position", position!)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();
      return (data as { id: string; name: string } | null) ?? null;
    },
  });

  async function build() {
    if (building) return;
    setBuilding(true);
    setQuiz(null);
    setPicked({});
    setSubmitted(false);
    setWeakTopics([]);
    try {
      // Offline quiz: questions come from the local sample pack, no AI call.
      setQuiz(getMockQuiz({ chapterName, mode, language, bilingual, count: 5 }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build a quiz.");
    } finally {
      setBuilding(false);
    }
  }

  async function submit() {
    if (!quiz || !userId) return;
    setSubmitted(true);
    const score = quiz.reduce((s, q, i) => s + (picked[i] === q.answerIndex ? 1 : 0), 0);
    const pct = Math.round((score / quiz.length) * 100);
    const weak = quiz
      .filter((q, i) => picked[i] !== q.answerIndex)
      .map((q) => q.topic ?? q.question.slice(0, 40));
    setWeakTopics(weak);

    await supabase.from("quizzes").insert({
      user_id: userId,
      chapter_id: chapterId,
      title: `${chapterName} quiz`,
      mode,
      language: bilingual ? language : "English",
      questions: quiz,
      answers: quiz.map((_, i) => picked[i] ?? null),
      score,
      total: quiz.length,
      weak_topics: weak,
      completed_at: new Date().toISOString(),
    } as never);

    await saveLearningRecord({
      userId,
      chapterId,
      kind: "quiz",
      mode,
      language: bilingual ? language : "English",
      title: `${chapterName} quiz — ${score}/${quiz.length}`,
    });
    await unlockAchievement(userId, "first_quiz");
    if (pct === 100) await unlockAchievement(userId, "perfect_quiz");
    await bumpChapterProgress({ userId, chapterId, quizDelta: 1, masteryScore: pct });
    await touchContinueLearning({
      userId,
      chapterId,
      label: `${chapterName} quiz — ${score}/${quiz.length}`,
      xp: 15 + score * 5,
    });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["history"] });
    queryClient.invalidateQueries({ queryKey: ["chapter-analytics", chapterId] });
    toast.success(`Saved — you scored ${score}/${quiz.length}`);
  }

  const score = quiz ? quiz.reduce((s, q, i) => s + (picked[i] === q.answerIndex ? 1 : 0), 0) : 0;
  const pct = quiz ? Math.round((score / quiz.length) * 100) : 0;

  return (
    <section className="space-y-4">
      <div className="panel flex flex-wrap items-center gap-3 p-5">
        <div>
          <h2 className="font-display text-xl font-semibold">Topic-wise quiz</h2>
          <p className="text-sm text-muted-foreground">
            Five sample questions for this chapter at your chosen depth, with an explanation for
            every answer.
          </p>
        </div>
        <Button className="ml-auto font-semibold" onClick={build} disabled={building}>
          {building ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ListChecks className="size-4" />
          )}
          {quiz ? "New quiz" : "Start 5-question quiz"}
        </Button>
      </div>

      {quiz ? (
        <div className="panel space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">{chapterName}</h3>
            {submitted ? (
              <span className="rounded-lg bg-lime-soft px-3 py-1 text-sm font-semibold text-lime">
                {score}/{quiz.length} · {pct}%
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
                        {submitted && isPicked && !isRight ? <X className="size-4 shrink-0" /> : null}
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
              onClick={submit}
              className="font-semibold"
              disabled={Object.keys(picked).length < quiz.length}
            >
              Submit quiz
            </Button>
          ) : null}
        </div>
      ) : null}

      {submitted ? (
        <div className="panel space-y-3 p-6">
          <h3 className="font-display text-lg font-semibold">What to do next</h3>
          {weakTopics.length ? (
            <p className="text-sm text-muted-foreground">
              Revise these first:{" "}
              <span className="font-medium text-amber">{weakTopics.join(", ")}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Clean sweep — this chapter looks solid. Time to move on.
            </p>
          )}
          {pct < 60 ? (
            <p className="text-sm text-muted-foreground">
              Recommended: re-read the Notes tab for {chapterName}, then retry the quiz.
            </p>
          ) : nextChapter.data ? (
            <Link
              to="/chapter/$chapterId"
              params={{ chapterId: nextChapter.data.id }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Next chapter: {nextChapter.data.name} <ArrowRight className="size-4" />
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              That was the last chapter in this subject — pick a new subject from Learn.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
