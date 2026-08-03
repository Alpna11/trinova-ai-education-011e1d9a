import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, BookOpen, ChevronRight, GraduationCap, Layers, Library } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({
    meta: [
      { title: "Choose your chapter — Edunova" },
      {
        name: "description",
        content:
          "Pick your board, class, subject and chapter to start an AI tutoring session tailored to your syllabus.",
      },
      { property: "og:title", content: "Choose your chapter — Edunova" },
      {
        property: "og:description",
        content: "Board, class, subject, chapter — then learn with your AI tutor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Learn,
});

type Row = { id: string; name: string; summary?: string | null };

function Column({
  icon: Icon,
  title,
  rows,
  selected,
  onSelect,
  empty,
}: {
  icon: typeof BookOpen;
  title: string;
  rows: Row[] | undefined;
  selected: string | null;
  onSelect: (id: string) => void;
  empty: string;
}) {
  return (
    <div className="panel flex min-h-[18rem] flex-col p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4 text-lime" /> {title}
      </h2>
      <div className="scroll-slim mt-3 flex-1 space-y-1.5 overflow-y-auto">
        {rows?.length ? (
          rows.map((row) => (
            <button
              key={row.id}
              onClick={() => onSelect(row.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2",
                selected === row.id && "bg-primary text-primary-foreground hover:bg-primary",
              )}
            >
              <span className="truncate">{row.name}</span>
              <ChevronRight className="ml-auto size-4 shrink-0 opacity-60" />
            </button>
          ))
        ) : (
          <p className="px-1 py-4 text-sm text-muted-foreground">{empty}</p>
        )}
      </div>
    </div>
  );
}

function Learn() {
  const { data: me } = useProfile();
  const navigate = useNavigate();
  const [boardId, setBoardId] = useState<string | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);

  const boards = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("boards").select("id, name").order("name");
      if (error) throw error;
      return data as Row[];
    },
  });

  const grades = useQuery({
    queryKey: ["grades", boardId],
    enabled: !!boardId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grade_levels")
        .select("id, name")
        .eq("board_id", boardId!)
        .order("position");
      if (error) throw error;
      return data as Row[];
    },
  });

  const subjects = useQuery({
    queryKey: ["subjects", gradeId],
    enabled: !!gradeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("grade_level_id", gradeId!)
        .order("position");
      if (error) throw error;
      return data as Row[];
    },
  });

  const chapters = useQuery({
    queryKey: ["chapters", subjectId],
    enabled: !!subjectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("id, name, summary")
        .eq("subject_id", subjectId!)
        .order("position");
      if (error) throw error;
      return data as Row[];
    },
  });

  const noCurriculum = boards.isSuccess && !boards.data.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Choose your chapter</h1>
        <p className="mt-1 text-muted-foreground">
          Board → class → subject → chapter. Your tutor uses this to stay on syllabus.
        </p>
      </div>

      {noCurriculum ? (
        <div className="panel p-6">
          <h2 className="font-display text-lg font-semibold">No curriculum added yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {me?.isStaff
              ? "Add boards, classes, subjects and chapters from the Teacher tab, then they appear here for students."
              : "Your teacher hasn't published boards and chapters yet. You can still upload a doubt and get a step-by-step solution."}
          </p>
          <div className="mt-4 flex gap-3">
            {me?.isStaff ? (
              <Link
                to="/teacher"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Open teacher tools <ArrowRight className="size-4" />
              </Link>
            ) : null}
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"
            >
              Ask a question
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Column
          icon={Library}
          title="Board"
          rows={boards.data}
          selected={boardId}
          empty="No boards yet."
          onSelect={(id) => {
            setBoardId(id);
            setGradeId(null);
            setSubjectId(null);
          }}
        />
        <Column
          icon={GraduationCap}
          title="Class"
          rows={grades.data}
          selected={gradeId}
          empty={boardId ? "No classes in this board." : "Pick a board first."}
          onSelect={(id) => {
            setGradeId(id);
            setSubjectId(null);
          }}
        />
        <Column
          icon={Layers}
          title="Subject"
          rows={subjects.data}
          selected={subjectId}
          empty={gradeId ? "No subjects in this class." : "Pick a class first."}
          onSelect={setSubjectId}
        />
        <div className="panel flex min-h-[18rem] flex-col p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <BookOpen className="size-4 text-lime" /> Chapter
          </h2>
          <div className="scroll-slim mt-3 flex-1 space-y-1.5 overflow-y-auto">
            {chapters.data?.length ? (
              chapters.data.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate({ to: "/tutor/$chapterId", params: { chapterId: c.id } })}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2"
                >
                  <span className="font-medium">{c.name}</span>
                  {c.summary ? (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {c.summary}
                    </span>
                  ) : null}
                </button>
              ))
            ) : (
              <p className="px-1 py-4 text-sm text-muted-foreground">
                {subjectId ? "No chapters in this subject." : "Pick a subject first."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
