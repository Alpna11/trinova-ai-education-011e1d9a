import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/edunova";

export type Profile = {
  id: string;
  full_name: string | null;
  second_language: string;
  board_id: string | null;
  grade_level_id: string | null;
  last_chapter_id: string | null;
  last_activity_label: string | null;
  last_active_at: string | null;
  xp: number;
  streak_days: number;
};

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return null;

      const [profileRes, rolesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, full_name, second_language, board_id, grade_level_id, last_chapter_id, last_activity_label, last_active_at, xp, streak_days",
          )
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);

      if (profileRes.error) throw profileRes.error;

      const roles = (rolesRes.data ?? []).map((r) => r.role as AppRole);
      return {
        user: { id: user.id, email: user.email ?? "" },
        profile: (profileRes.data as Profile | null) ?? null,
        roles,
        isStaff: roles.includes("teacher") || roles.includes("admin"),
      };
    },
    staleTime: 30_000,
  });
}

export function useChapterMeta(chapterId: string | null | undefined) {
  return useQuery({
    queryKey: ["chapter-meta", chapterId],
    enabled: !!chapterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select(
          "id, name, summary, subjects(id, name, grade_levels(id, name, boards(id, name)))",
        )
        .eq("id", chapterId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const subject = data.subjects as unknown as {
        name: string;
        grade_levels: { name: string; boards: { name: string } | null } | null;
      } | null;
      const path = [
        subject?.grade_levels?.boards?.name,
        subject?.grade_levels?.name,
        subject?.name,
      ]
        .filter(Boolean)
        .join(" • ");
      return {
        id: data.id as string,
        name: data.name as string,
        summary: (data.summary as string | null) ?? null,
        path,
        context: `${path} — chapter "${data.name}"${data.summary ? `. ${data.summary}` : ""}`,
      };
    },
  });
}
