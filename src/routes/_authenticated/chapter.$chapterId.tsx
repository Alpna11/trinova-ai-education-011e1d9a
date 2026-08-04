import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { touchContinueLearning } from "@/lib/learning";
import { StudyControls } from "@/components/StudyControls";
import { MaterialPanel } from "@/components/chapter/MaterialPanel";
import { TutorPanel } from "@/components/chapter/TutorPanel";
import { QuizPanel } from "@/components/chapter/QuizPanel";
import { AnalyticsPanel } from "@/components/chapter/AnalyticsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/chapter/$chapterId")({
  head: () => ({
    meta: [
      { title: "Chapter hub — notes, tutor, quizzes | Edunova" },
      {
        name: "description",
        content:
          "Everything for one chapter in a single place: AI notes, tutor chat, practice questions, topic quizzes, previous-year questions, video resources and progress analytics.",
      },
      { property: "og:title", content: "Chapter hub — notes, tutor, quizzes | Edunova" },
      {
        property: "og:description",
        content:
          "AI notes, tutor, practice, quizzes, previous-year questions and analytics for every chapter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChapterHub,
});

function ChapterHub() {
  const { chapterId } = Route.useParams();
  const { data: me } = useProfile();
  const queryClient = useQueryClient();
  const userId = me?.user.id;
  const language = me?.profile?.second_language ?? "Hindi";

  const { data: chapter } = useQuery({
    queryKey: ["chapter-hub", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select(
          "id, name, summary, position, subject_id, subjects(id, name, grade_levels(name, boards(name)))",
        )
        .eq("id", chapterId)
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
        position: (data.position as number | null) ?? null,
        subjectId: (data.subject_id as string | null) ?? null,
        path,
        context: `${path} — chapter "${data.name}"${data.summary ? `. ${data.summary}` : ""}`,
      };
    },
  });

  useEffect(() => {
    if (!userId || !chapter) return;
    void touchContinueLearning({
      userId,
      chapterId: chapter.id,
      label: `${chapter.name} — ${chapter.path}`,
    }).then(() => queryClient.invalidateQueries({ queryKey: ["profile"] }));
  }, [userId, chapter, queryClient]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Change chapter
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-lime">
          {chapter?.path ?? "Loading chapter"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">{chapter?.name ?? "Chapter"}</h1>
        {chapter?.summary ? (
          <p className="mt-1 max-w-2xl text-muted-foreground">{chapter.summary}</p>
        ) : null}
      </div>

      <StudyControls language={language} />

      <Tabs defaultValue="notes" className="space-y-5">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="tutor">AI tutor</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="pyq">Previous year</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <MaterialPanel
            chapterId={chapterId}
            kind="notes"
            language={language}
            title="Chapter notes"
            blurb="AI-written notes at your chosen depth, cached so they load instantly next time."
          />
        </TabsContent>

        <TabsContent value="tutor">
          {chapter ? (
            <TutorPanel
              chapterId={chapterId}
              chapterName={chapter.name}
              chapterContext={chapter.context}
              language={language}
              userId={userId}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="practice">
          <MaterialPanel
            chapterId={chapterId}
            kind="practice"
            language={language}
            title="Practice questions"
            blurb="Eight graded questions with hints and full step-by-step solutions."
          />
        </TabsContent>

        <TabsContent value="quiz">
          {chapter ? (
            <QuizPanel
              chapterId={chapterId}
              chapterName={chapter.name}
              chapterContext={chapter.context}
              subjectId={chapter.subjectId}
              position={chapter.position}
              language={language}
              userId={userId}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="pyq">
          <MaterialPanel
            chapterId={chapterId}
            kind="pyq"
            language={language}
            title="Previous-year questions"
            blurb="Exam-style questions typical of past board papers, with model answers."
          />
        </TabsContent>

        <TabsContent value="videos">
          <MaterialPanel
            chapterId={chapterId}
            kind="resources"
            language={language}
            title="Video & reading resources"
            blurb="Curated YouTube searches and reading pointers for this chapter."
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsPanel chapterId={chapterId} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
