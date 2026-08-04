import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { askTutor } from "@/lib/tutor.functions";
import { useStudyPrefs } from "@/hooks/use-study-prefs";
import {
  bumpChapterProgress,
  countRecords,
  saveLearningRecord,
  touchContinueLearning,
  unlockAchievement,
} from "@/lib/learning";
import { Markdown } from "@/components/Markdown";
import { VoiceButton } from "@/components/VoiceButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TutorPanel({
  chapterId,
  chapterName,
  chapterContext,
  language,
  userId,
}: {
  chapterId: string;
  chapterName: string;
  chapterContext: string;
  language: string;
  userId: string | undefined;
}) {
  const { mode, bilingual } = useStudyPrefs();
  const ask = useServerFn(askTutor);
  const queryClient = useQueryClient();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || thinking) return;
    setThinking(true);
    setAnswer(null);
    try {
      const res = await ask({
        data: {
          mode,
          language,
          bilingual,
          chapterContext: chapterContext.slice(0, 600),
          question: question.trim(),
        },
      });
      setAnswer(res.answer);

      if (userId) {
        await saveLearningRecord({
          userId,
          chapterId,
          kind: "explanation",
          mode,
          language: bilingual ? language : "English",
          title: question.trim().slice(0, 120),
          prompt: question.trim(),
          answer: res.answer,
        });
        await unlockAchievement(userId, "first_lesson");
        if (bilingual) await unlockAchievement(userId, "bilingual");
        if ((await countRecords(userId)) >= 5) await unlockAchievement(userId, "five_records");
        await bumpChapterProgress({ userId, chapterId, sessionDelta: 1 });
        await touchContinueLearning({
          userId,
          chapterId,
          label: `${chapterName} — ${question.trim().slice(0, 60)}`,
          xp: 10,
        });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["history"] });
        queryClient.invalidateQueries({ queryKey: ["chapter-analytics", chapterId] });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The tutor could not answer.");
    } finally {
      setThinking(false);
    }
  }

  return (
    <section className="space-y-4">
      <form onSubmit={handleAsk} className="panel space-y-3 p-5">
        <label htmlFor="tutor-q" className="font-display text-lg font-semibold">
          Ask your tutor about {chapterName}
        </label>
        <Textarea
          id="tutor-q"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={4000}
          rows={3}
          placeholder={`e.g. Explain the main idea of ${chapterName} with an example`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={thinking || !question.trim()} className="font-semibold">
            {thinking ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Explain in {mode} mode
          </Button>
          <VoiceButton
            language={language}
            bilingual={bilingual}
            onTranscript={(text) => setQuestion((q) => (q ? `${q} ${text}` : text))}
          />
        </div>
      </form>

      {thinking ? (
        <div className="panel flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-lime" /> Your tutor is thinking…
        </div>
      ) : null}

      {answer ? (
        <article className="panel p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lime">
            <Sparkles className="size-4" /> AI explanation · saved to your history
          </div>
          <Markdown content={answer} />
        </article>
      ) : null}
    </section>
  );
}
