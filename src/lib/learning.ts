import { supabase } from "@/integrations/supabase/client";
import { ACHIEVEMENTS } from "@/lib/edunova";

export type RecordKind = "explanation" | "doubt" | "quiz" | "resource";

export async function saveLearningRecord(input: {
  userId: string;
  chapterId?: string | null | undefined;
  kind: RecordKind;
  mode?: string | undefined;
  language?: string | undefined;
  title: string;
  prompt?: string | undefined;
  answer?: string | undefined;
  attachmentUrl?: string | null | undefined;
  attachmentType?: string | null | undefined;
}) {
  const { data, error } = await supabase
    .from("learning_records")
    .insert({
      user_id: input.userId,
      chapter_id: input.chapterId ?? null,
      kind: input.kind,
      mode: input.mode ?? null,
      language: input.language ?? null,
      title: input.title.slice(0, 180),
      prompt: input.prompt ?? null,
      answer: input.answer ?? null,
      attachment_url: input.attachmentUrl ?? null,
      attachment_type: input.attachmentType ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function touchContinueLearning(input: {
  userId: string;
  chapterId?: string | null | undefined;
  label: string;
  xp?: number | undefined;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: current } = await supabase
    .from("profiles")
    .select("xp, streak_days, last_streak_date")
    .eq("id", input.userId)
    .maybeSingle();

  let streak = current?.streak_days ?? 0;
  const last = current?.last_streak_date ?? null;
  if (last !== today) {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    streak = last === yesterday ? streak + 1 : 1;
  }

  await supabase
    .from("profiles")
    .update({
      last_chapter_id: input.chapterId ?? null,
      last_activity_label: input.label.slice(0, 180),
      last_active_at: new Date().toISOString(),
      xp: (current?.xp ?? 0) + (input.xp ?? 0),
      streak_days: streak,
      last_streak_date: today,
    })
    .eq("id", input.userId);
}

export async function bumpChapterProgress(input: {
  userId: string;
  chapterId: string;
  sessionDelta?: number | undefined;
  quizDelta?: number | undefined;
  masteryScore?: number | undefined;
}) {
  const { data: existing } = await supabase
    .from("chapter_progress")
    .select("id, mastery, sessions, quizzes_taken")
    .eq("user_id", input.userId)
    .eq("chapter_id", input.chapterId)
    .maybeSingle();

  const prevMastery = existing?.mastery ?? 0;
  const mastery =
    input.masteryScore === undefined
      ? Math.min(100, prevMastery + 5)
      : existing
        ? Math.round(prevMastery * 0.5 + input.masteryScore * 0.5)
        : input.masteryScore;

  const payload = {
    user_id: input.userId,
    chapter_id: input.chapterId,
    mastery,
    sessions: (existing?.sessions ?? 0) + (input.sessionDelta ?? 0),
    quizzes_taken: (existing?.quizzes_taken ?? 0) + (input.quizDelta ?? 0),
    last_seen_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("chapter_progress").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("chapter_progress").insert(payload);
  }
}

export async function unlockAchievement(userId: string, code: string) {
  const meta = ACHIEVEMENTS.find((a) => a.code === code);
  if (!meta) return false;
  const { error } = await supabase
    .from("achievements")
    .insert({ user_id: userId, code, label: meta.label });
  if (error) return false;
  const { data } = await supabase.from("profiles").select("xp").eq("id", userId).maybeSingle();
  await supabase
    .from("profiles")
    .update({ xp: (data?.xp ?? 0) + meta.xp })
    .eq("id", userId);
  return true;
}

export async function countRecords(userId: string) {
  const { count } = await supabase
    .from("learning_records")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}
