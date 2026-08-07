import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FileText, ImageIcon, Languages, Loader2, Paperclip, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMockSolution } from "@/lib/mock-content";
import { useProfile } from "@/hooks/use-profile";
import { TUTOR_MODES, type TutorMode } from "@/lib/edunova";
import {
  countRecords,
  saveLearningRecord,
  touchContinueLearning,
  unlockAchievement,
} from "@/lib/learning";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_BYTES = 6 * 1024 * 1024;

export const Route = createFileRoute("/_authenticated/ask")({
  head: () => ({
    meta: [
      { title: "Upload a question — Edunova" },
      {
        name: "description",
        content:
          "Type a doubt or upload an image or PDF of a question and get a clear step-by-step solution saved to your learning record.",
      },
      { property: "og:title", content: "Upload a question — Edunova" },
      {
        property: "og:description",
        content: "Text, image or PDF questions solved step by step by your AI tutor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AskPage,
});

function AskPage() {
  const { data: me } = useProfile();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<TutorMode>("standard");
  const [bilingual, setBilingual] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const language = me?.profile?.second_language ?? "Hindi";
  const userId = me?.user.id;

  function pickFile(f: File | null) {
    if (!f) return setFile(null);
    const ok = f.type.startsWith("image/") || f.type === "application/pdf";
    if (!ok) return toast.error("Upload an image or a PDF.");
    if (f.size > MAX_BYTES) return toast.error("File must be under 6 MB.");
    setFile(f);
  }

  function toDataUrl(f: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(f);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || (!text.trim() && !file)) return;
    setBusy(true);
    setAnswer(null);
    try {
      // Offline solver: the step-by-step walkthrough is generated locally.
      const res = {
        answer: getMockSolution({
          mode,
          language,
          bilingual,
          text: text.trim() || undefined,
          fileName: file?.name,
        }),
      };
      setAnswer(res.answer);

      let storedPath: string | null = null;
      if (file && userId) {
        const path = `${userId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
        const { error } = await supabase.storage.from("question-uploads").upload(path, file, {
          contentType: file.type,
        });
        if (!error) storedPath = path;
      }

      if (userId) {
        await saveLearningRecord({
          userId,
          kind: "doubt",
          mode,
          language: bilingual ? language : "English",
          title: text.trim().slice(0, 120) || file?.name || "Uploaded question",
          prompt: text.trim() || null ? text.trim() : undefined,
          answer: res.answer,
          attachmentUrl: storedPath,
          attachmentType: file?.type ?? null,
        });
        await unlockAchievement(userId, "doubt_solver");
        if (bilingual) await unlockAchievement(userId, "bilingual");
        if ((await countRecords(userId)) >= 5) await unlockAchievement(userId, "five_records");
        await touchContinueLearning({
          userId,
          label: `Doubt: ${text.trim().slice(0, 60) || file?.name || "uploaded question"}`,
          xp: 12,
        });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["history"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not solve that question.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Upload a question</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Type it, snap a photo of your textbook, or attach a PDF question paper. You get a
          step-by-step solution — and it's saved to your learning record.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="panel space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {TUTOR_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={cn(
                  "rounded-xl border border-border px-4 py-2 text-sm transition-colors hover:bg-surface-2",
                  mode === m.id && "border-primary bg-lime-soft font-semibold text-lime",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 rounded-xl border border-border px-4 py-2">
            <Languages className="size-4 text-violet" />
            <Label htmlFor="bi" className="text-sm">
              English + {language}
            </Label>
            <Switch id="bi" checked={bilingual} onCheckedChange={setBilingual} />
          </div>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="Paste or type the question here (optional if you attach a file)"
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
            {file.type === "application/pdf" ? (
              <FileText className="size-4 text-violet" />
            ) : (
              <ImageIcon className="size-4 text-lime" />
            )}
            <span className="truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="ml-auto text-muted-foreground hover:text-foreground"
              aria-label="Remove file"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
            <Paperclip className="size-4" /> Attach image or PDF
          </Button>
          <Button type="submit" className="font-semibold" disabled={busy || (!text.trim() && !file)}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Solve step by step
          </Button>
        </div>
      </form>

      {busy ? (
        <div className="panel flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-lime" /> Reading your question and working
          through it…
        </div>
      ) : null}

      {answer ? (
        <article className="panel p-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-lime">
            <Sparkles className="size-4" /> Step-by-step solution · saved to your history
          </div>
          <Markdown content={answer} />
        </article>
      ) : null}
    </div>
  );
}
