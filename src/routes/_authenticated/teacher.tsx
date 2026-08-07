import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, StickyNote, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/teacher")({
  beforeLoad: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw redirect({ to: "/auth", search: { mode: "signin" } });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", auth.user.id);
    const roles = (data ?? []).map((r) => r.role as string);
    if (!roles.includes("teacher") && !roles.includes("admin")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Teacher tools — Edunova" },
      {
        name: "description",
        content:
          "Class analytics, weak-topic insights and shared chapter notes for teachers on Edunova.",
      },
      { property: "og:title", content: "Teacher tools — Edunova" },
      {
        property: "og:description",
        content: "See how your class is progressing and publish chapter notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeacherPage,
});

function TeacherPage() {
  const { data } = useQuery({
    queryKey: ["teacher-analytics"],
    queryFn: async () => {
      const [students, quizzes, notes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("quizzes").select("*").not("completed_at", "is", null),
        supabase.from("teacher_notes").select("id, title, created_at").order("created_at", {
          ascending: false,
        }),
      ]);

      const quizRows = (quizzes.data ?? []) as unknown as {
        score: number | null;
        total: number;
        weak_topics?: string[] | null;
      }[];
      const rows = quizRows;
      const avg = rows.length
        ? Math.round(
            (rows.reduce((s, q) => s + (q.score ?? 0) / Math.max(q.total, 1), 0) / rows.length) *
              100,
          )
        : null;

      const topicCount = new Map<string, number>();
      for (const q of quizRows) {
        for (const t of q.weak_topics ?? []) {
          topicCount.set(t, (topicCount.get(t) ?? 0) + 1);
        }
      }

      return {
        learners: students.count ?? 0,
        quizCount: rows.length,
        avg,
        weakTopics: [...topicCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
        notes: notes.data ?? [],
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Teacher tools</h1>
        <p className="mt-1 text-muted-foreground">
          Class-level analytics from quiz activity, plus your shared chapter notes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4 text-lime" /> Learners
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{data?.learners ?? "—"}</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="size-4 text-violet" /> Quizzes completed
          </div>
          <p className="mt-2 font-display text-3xl font-bold">{data?.quizCount ?? 0}</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="size-4 text-amber" /> Class average
          </div>
          <p className="mt-2 font-display text-3xl font-bold">
            {data?.avg === null || data?.avg === undefined ? "—" : `${data.avg}%`}
          </p>
        </div>
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-lg font-semibold">Most missed topics</h2>
        {data?.weakTopics.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {data.weakTopics.map(([topic, count]) => (
              <li
                key={topic}
                className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm"
              >
                {topic} <span className="text-muted-foreground">×{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Once students take quizzes, their weakest topics show up here.
          </p>
        )}
      </section>

      <section className="panel p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <StickyNote className="size-4 text-lime" /> Your notes
        </h2>
        {data?.notes.length ? (
          <ul className="mt-4 divide-y divide-border">
            {data.notes.map((n) => (
              <li key={n.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="truncate">{n.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(n.created_at as string).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No notes published yet. Note authoring lands in the next iteration.
          </p>
        )}
      </section>
    </div>
  );
}
