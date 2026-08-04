import { Languages } from "lucide-react";
import { TUTOR_MODES } from "@/lib/edunova";
import { useStudyPrefs } from "@/hooks/use-study-prefs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Shared depth + bilingual controls used across every chapter tab. */
export function StudyControls({ language }: { language: string }) {
  const { mode, setMode, bilingual, setBilingual } = useStudyPrefs();

  return (
    <div className="panel flex flex-wrap items-center gap-3 p-4">
      <div className="flex flex-wrap gap-2">
        {TUTOR_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "rounded-xl border border-border px-4 py-2 text-left transition-colors hover:bg-surface-2",
              mode === m.id && "border-primary bg-lime-soft",
            )}
          >
            <span className={cn("block text-sm font-semibold", mode === m.id && "text-lime")}>
              {m.label}
            </span>
            <span className="block text-xs text-muted-foreground">{m.blurb}</span>
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3 rounded-xl border border-border px-4 py-2">
        <Languages className="size-4 text-violet" />
        <Label htmlFor="bilingual" className="text-sm">
          English + {language}
        </Label>
        <Switch id="bilingual" checked={bilingual} onCheckedChange={setBilingual} />
      </div>
    </div>
  );
}
