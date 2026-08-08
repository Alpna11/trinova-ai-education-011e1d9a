import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Row = { id: string; name: string };

export function useCurriculumSelect() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);

  const boards = useQuery({
    queryKey: ["boards"],
    queryFn: async () =>
      ((await supabase.from("boards").select("id, name").order("name")).data ?? []) as Row[],
    staleTime: 300_000,
  });

  const grades = useQuery({
    queryKey: ["grades", boardId],
    enabled: !!boardId,
    queryFn: async () =>
      ((
        await supabase
          .from("grade_levels")
          .select("id, name")
          .eq("board_id", boardId!)
          .order("position")
      ).data ?? []) as Row[],
    staleTime: 300_000,
  });

  const subjects = useQuery({
    queryKey: ["subjects", gradeId],
    enabled: !!gradeId,
    queryFn: async () =>
      ((
        await supabase
          .from("subjects")
          .select("id, name")
          .eq("grade_level_id", gradeId!)
          .order("position")
      ).data ?? []) as Row[],
    staleTime: 300_000,
  });

  const chapters = useQuery({
    queryKey: ["chapters", subjectId],
    enabled: !!subjectId,
    queryFn: async () =>
      ((
        await supabase
          .from("chapters")
          .select("id, name")
          .eq("subject_id", subjectId!)
          .order("position")
      ).data ?? []) as Row[],
    staleTime: 300_000,
  });

  useEffect(() => {
    setGradeId(null);
    setSubjectId(null);
    setChapterId(null);
  }, [boardId]);
  useEffect(() => {
    setSubjectId(null);
    setChapterId(null);
  }, [gradeId]);
  useEffect(() => {
    setChapterId(null);
  }, [subjectId]);

  return {
    boardId,
    gradeId,
    subjectId,
    chapterId,
    setBoardId,
    setGradeId,
    setSubjectId,
    setChapterId,
    boards: boards.data,
    grades: grades.data,
    subjects: subjects.data,
    chapters: chapters.data,
  };
}

export type CurriculumSelect = ReturnType<typeof useCurriculumSelect>;

function Field({
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
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Select {...(value ? { value } : {})} onValueChange={onChange} disabled={!!disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {(rows ?? []).map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CurriculumFields({
  c,
  withChapter = true,
}: {
  c: CurriculumSelect;
  withChapter?: boolean;
}) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${withChapter ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      <Field
        label="Board"
        value={c.boardId}
        rows={c.boards}
        placeholder="Select board"
        onChange={c.setBoardId}
      />
      <Field
        label="Class"
        value={c.gradeId}
        rows={c.grades}
        placeholder="Select class"
        disabled={!c.boardId}
        onChange={c.setGradeId}
      />
      <Field
        label="Subject"
        value={c.subjectId}
        rows={c.subjects}
        placeholder="Select subject"
        disabled={!c.gradeId}
        onChange={c.setSubjectId}
      />
      {withChapter ? (
        <Field
          label="Chapter"
          value={c.chapterId}
          rows={c.chapters}
          placeholder="Select chapter"
          disabled={!c.subjectId}
          onChange={c.setChapterId}
        />
      ) : null}
    </div>
  );
}
