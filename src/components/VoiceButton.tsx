import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { cn } from "@/lib/utils";

const LANG_CODES: Record<string, string> = {
  Hindi: "hi-IN",
  Marathi: "mr-IN",
  Bengali: "bn-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Kannada: "kn-IN",
  Malayalam: "ml-IN",
  Gujarati: "gu-IN",
  Punjabi: "pa-IN",
  Odia: "or-IN",
  Urdu: "ur-IN",
  Assamese: "as-IN",
};

export function VoiceButton({
  onTranscript,
  language,
  bilingual,
}: {
  onTranscript: (text: string) => void;
  language?: string | undefined;
  bilingual?: boolean | undefined;
}) {
  const code = bilingual && language ? (LANG_CODES[language] ?? "en-IN") : "en-IN";
  const { supported, listening, toggle } = useVoiceInput(onTranscript, code);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-2",
        listening && "border-primary bg-lime-soft text-lime",
      )}
    >
      {listening ? <MicOff className="size-4 animate-pulse" /> : <Mic className="size-4" />}
      {listening ? "Listening…" : "Speak"}
    </button>
  );
}
