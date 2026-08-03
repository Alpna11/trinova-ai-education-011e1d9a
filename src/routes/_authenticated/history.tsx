import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { History as HistoryIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";

const KINDS = ["all", "explanation", "doubt", "quiz", "resource"] as const;

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Learning record — Edunova" },
      {
        name: "description",
        content:
          "Revisit every saved question, AI answer, quiz and resource from your Edunova learning history.",
      },
      { property: "og:title", content: "Learning record — Edunova" },
      {
        property: "og:description",
        content: "Your saved doubts, explanations and quizzes, all in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data: me } = useProfile();
  const userId = me?.user.id;
  const [kind, setKind] = useState<(typeof KINDS)[number]>("all");
  const [open, setOpen] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["history", userId, kind],
    enabled: !!userId,
    queryFn: async () => {
      let q = supabase
        .from("learning_records")
        .select("id, kind, title, prompt, answer, mode, language, created_at, chapters(name)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (kind !== "all") q = q.eq("kind", kind);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Learning record</h1>
        <p className="mt-1 text-muted-foreground">
          Everything you've asked, solved and practised — revisit it anytime.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cn(
              "rounded-xl border border-border px-4 py-2 text-sm capitalize transition-colors hover:bg-surface-2",
              kind === k && "border-primary bg-lime-soft font-semibold text-lime",
            )}
          >
            {k === "all" ? "Everything" : k}
          </button>
        ))}
      </div>

      {data?.length ? (
        <ul className="space-y-3">
          {data.map((r) => {
            const chapter = r.chapters as unknown as { name: string } | null;
            const isOpen = open === r.id;
            return (
              <li key={r.id} className="panel overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : (r.id as string))}
                  className="flex w-full flex-wrap items-center gap-3 p-4 text-left"
                >
                  <span className="rounded-md bg-surface-2 px-2 py-1 text-xs capitalize text-muted-foreground">
                    {r.kind}
                  </span>
                  <span className="font-medium">{r.title}</span>
                  {chapter ? (
                    <span className="text-xs text-muted-foreground">{chapter.name}</span>
                  ) : null}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(r.created_at as string).toLocaleString()}
                  </span>
                </button>
                {isOpen ? (
                  <div className="border-t border-border p-5">
                    {r.prompt ? (
                      <p className="mb-4 rounded-lg bg-surface-2 p-3 text-sm text-muted-foreground">
                        {r.prompt}
                      </p>
                    ) : null}
                    {r.answer ? (
                      <Markdown content={r.answer as string} />
                    ) : (
                      <p className="text-sm text-muted-foreground">No saved answer for this item.</p>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="panel flex items-center gap-3 p-8 text-sm text-muted-foreground">
          <HistoryIcon className="size-4 text-lime" /> Nothing saved yet — ask your tutor or upload a
          question and it will appear here.
        </div>
      )}
    </div>
  );
}
