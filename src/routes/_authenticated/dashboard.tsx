import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  Flame,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { ACHIEVEMENTS, levelFromXp, masteryLabel } from "@/lib/edunova";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — Edunova" },
      {
        name: "description",
        content:
          "Continue learning where you stopped, review weak topics, quiz scores, streaks and unlocked achievements.",
      },
      { property: "og:title", content: "Your dashboard — Edunova" },
      {
        property: "og:description",
        content: "Progress, weak topics and achievements for your Edunova learning journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: me } = useProfile();
  const userId = me?.user.id;

  const { data } = useQuery({
    queryKey: ["dashboard", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [progress, quizzes, records, badges, lastChapter] = await Promise.all([
        supabase
          .from("chapter_progress")
          .select("mastery, quizzes_taken, last_seen_at, chapters(id, name, subjects(name))")
          .eq("user_id", userId!)
          .order("last_seen_at", { ascending: false })
          .limit(20),
        supabase
          .from("quizzes")
          .select("id, title, score, total, completed_at")
          .eq("user_id", userId!)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(8),
        supabase
          .from("learning_records")
          .select("id, title, kind, created_at")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("achievements").select("code, label").eq("user_id", userId!),
        me?.profile?.last_chapter_id
          ? supabase
              .from("chapters")
              .select("id, name, subjects(name)")
              .eq("id", me.profile.last_chapter_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      return {
        progress: progress.data ?? [],
        quizzes: quizzes.data ?? [],
        records: records.data ?? [],
        badges: (badges.data ?? []).map((b) => b.code as string),
        lastChapter: lastChapter.data as { id: string; name: string } | null,
      };
    },
  });

  const xp = me?.profile?.xp ?? 0;
  const { level, into, pct } = levelFromXp(xp);
  const weak = [...(data?.progress ?? [])].sort((a, b) => a.mastery - b.mastery).slice(0, 4);
  const avgScore = data?.quizzes.length
    ? Math.round(
        (data.quizzes.reduce((s, q) => s + (q.score ?? 0) / Math.max(q.total, 1), 0) /
          data.quizzes.length) *
          100,
      )
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">
          Hi{me?.profile?.full_name ? `, ${me.profile.full_name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {me?.isStaff
            ? "You have teacher tools — manage the curriculum and notes from the Teacher tab."
            : "Pick up where you left off, or start a new chapter."}
        </p>
      </div>

      <div className="panel hero-bg flex flex-col gap-5 p-6 md:flex-row md:items-center">
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lime">
            Continue learning
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold">
            {data?.lastChapter?.name ?? "No session yet"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {me?.profile?.last_activity_label ??
              "Choose a board, class, subject and chapter to begin your first session."}
          </p>
        </div>
        {data?.lastChapter ? (
          <Link
            to="/tutor/$chapterId"
            params={{ chapterId: data.lastChapter.id }}
            className="glow inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <PlayCircle className="size-5" /> Continue learning
          </Link>
        ) : (
          <Link
            to="/learn"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            <BookOpen className="size-5" /> Start learning
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-lime" /> Level {level}
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{xp} XP</p>
          <Progress value={pct} className="mt-3 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">{into}/250 XP to next level</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="size-4 text-amber" /> Streak
          </div>
          <p className="mt-2 font-display text-3xl font-bold">
            {me?.profile?.streak_days ?? 0} days
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Study anything each day to keep it alive.
          </p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="size-4 text-violet" /> Quiz average
          </div>
          <p className="mt-2 font-display text-3xl font-bold">
            {avgScore === null ? "—" : `${avgScore}%`}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Across {data?.quizzes.length ?? 0} completed quizzes.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <AlertTriangle className="size-4 text-amber" /> Weak topics
          </h3>
          {weak.length ? (
            <ul className="mt-4 space-y-4">
              {weak.map((row, i) => {
                const chapter = row.chapters as unknown as { id: string; name: string } | null;
                return (
                  <li key={i}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{chapter?.name ?? "Chapter"}</span>
                      <span className="text-muted-foreground">
                        {masteryLabel(row.mastery)} · {row.mastery}%
                      </span>
                    </div>
                    <Progress value={row.mastery} className="mt-2 h-1.5" />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Take a quiz and your weakest chapters will show up here.
            </p>
          )}
        </section>

        <section className="panel p-5">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Trophy className="size-4 text-lime" /> Achievements
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = data?.badges.includes(a.code);
              return (
                <div
                  key={a.code}
                  className={`rounded-xl border p-3 ${
                    unlocked ? "border-primary bg-lime-soft" : "border-border bg-surface-2/50"
                  }`}
                >
                  <p className={`text-sm font-semibold ${unlocked ? "text-lime" : ""}`}>{a.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.hint}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Recent activity</h3>
          <Link to="/history" className="text-sm text-lime hover:underline">
            View all
          </Link>
        </div>
        {data?.records.length ? (
          <ul className="mt-4 divide-y divide-border">
            {data.records.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="rounded-md bg-surface-2 px-2 py-1 text-xs capitalize text-muted-foreground">
                  {r.kind}
                </span>
                <span className="truncate">{r.title}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {new Date(r.created_at as string).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"
            >
              <BookOpen className="size-4" /> Browse chapters
            </Link>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"
            >
              <Upload className="size-4" /> Upload a doubt
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
