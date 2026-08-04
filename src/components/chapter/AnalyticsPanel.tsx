import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Target, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { masteryLabel } from "@/lib/edunova";
import { Progress } from "@/components/ui/progress";

export function AnalyticsPanel({
  chapterId,
  userId,
}: {
  chapterId: string;
  userId: string | undefined;
}) {
  const { data } = useQuery({
    queryKey: ["chapter-analytics", chapterId, userId],
    enabled: !!userId,
    queryFn: async () => {
      const [progress, quizzes] = await Promise.all([
        supabase
          .from("chapter_progress")
          .select("mastery, sessions, quizzes_taken, last_seen_at")
          .eq("user_id", userId!)
          .eq("chapter_id", chapterId)
          .maybeSingle(),
        supabase
          .from("quizzes")
          .select("id, title, score, total, weak_topics, completed_at")
          .eq("user_id", userId!)
          .eq("chapter_id", chapterId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      return {
        progress: progress.data,
        quizzes: quizzes.data ?? [],
      };
    },
  });

  const mastery = data?.progress?.mastery ?? 0;
  const weak = Array.from(
    new Set(
      (data?.quizzes ?? []).flatMap((q) =>
        Array.isArray(q.weak_topics) ? (q.weak_topics as string[]) : [],
      ),
    ),
  ).slice(0, 8);

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="size-4 text-lime" /> Mastery
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{mastery}%</p>
          <Progress value={mastery} className="mt-3 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">{masteryLabel(mastery)}</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="size-4 text-violet" /> Study sessions
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{data?.progress?.sessions ?? 0}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {data?.progress?.quizzes_taken ?? 0} quizzes taken on this chapter.
          </p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="size-4 text-amber" /> Weak topics
          </div>
          {weak.length ? (
            <ul className="mt-3 space-y-1 text-sm">
              {weak.map((t) => (
                <li key={t} className="text-muted-foreground">
                  • {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Take a quiz to reveal your weak topics.
            </p>
          )}
        </div>
      </div>

      <div className="panel p-6">
        <h3 className="font-display text-lg font-semibold">Quiz history for this chapter</h3>
        {data?.quizzes.length ? (
          <ul className="mt-4 space-y-3">
            {data.quizzes.map((q) => (
              <li
                key={q.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"
              >
                <span className="font-medium">{q.title}</span>
                <span className="text-muted-foreground">
                  {q.score}/{q.total} ·{" "}
                  {q.completed_at ? new Date(q.completed_at).toLocaleDateString() : "in progress"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No attempts yet.</p>
        )}
      </div>
    </section>
  );
}
