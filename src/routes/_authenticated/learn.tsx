import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({
    meta: [
      { title: "Choose your chapter — Edunova" },
      {
        name: "description",
        content:
          "Pick your board, class, subject and chapter to open a chapter hub with AI notes, tutor, quizzes and analytics.",
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

function Dropdown({
  label,
  value,
  rows,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: string | null;
  rows: Row[] | undefined;
  placeholder: string;
  disabled?: boolean;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {(rows ?? []).map((row) => (
            <SelectItem key={row.id} value={row.id}>
              {row.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Learn() {
  const { data: me } = useProfile();
  const navigate = useNavigate();
  const [boardId, setBoardId] = useState<string | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);

  useEffect(() => {
    if (me?.profile?.board_id && !boardId) setBoardId(me.profile.board_id);
    if (me?.profile?.grade_level_id && !gradeId) setGradeId(me.profile.grade_level_id);
  }, [me, boardId, gradeId]);

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
          Board → class → subject → chapter. Everything after that is generated from your syllabus.
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

      <div className="panel grid gap-4 p-5 md:grid-cols-3">
        <Dropdown
          label="Board"
          value={boardId}
          rows={boards.data}
          placeholder="Select board"
          onChange={(id) => {
            setBoardId(id);
            setGradeId(null);
            setSubjectId(null);
          }}
        />
        <Dropdown
          label="Class"
          value={gradeId}
          rows={grades.data}
          placeholder={boardId ? "Select class" : "Pick a board first"}
          disabled={!boardId}
          onChange={(id) => {
            setGradeId(id);
            setSubjectId(null);
          }}
        />
        <Dropdown
          label="Subject"
          value={subjectId}
          rows={subjects.data}
          placeholder={gradeId ? "Select subject" : "Pick a class first"}
          disabled={!gradeId}
          onChange={setSubjectId}
        />
      </div>

      <section className="panel p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <BookOpen className="size-4 text-lime" /> Chapters
        </h2>
        {chapters.data?.length ? (
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {chapters.data.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() =>
                    navigate({ to: "/chapter/$chapterId", params: { chapterId: c.id } })
                  }
                  className="w-full rounded-xl border border-border px-4 py-3 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="font-medium">{c.name}</span>
                  {c.summary ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">{c.summary}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {subjectId ? "No chapters in this subject yet." : "Pick a subject to see its chapters."}
          </p>
        )}
      </section>
    </div>
  );
}
