import { useMemo, useState } from "react";
import { RefreshCw, Youtube } from "lucide-react";
import { getMockMaterial } from "@/lib/mock-content";
import type {
  MaterialKind,
  NotesPayload,
  PracticePayload,
  PyqPayload,
  ResourcesPayload,
} from "@/lib/chapter.schemas";
import { useStudyPrefs } from "@/hooks/use-study-prefs";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function MaterialPanel({
  chapterName,
  kind,
  language,
  title,
  blurb,
}: {
  chapterName: string;
  kind: MaterialKind;
  language: string;
  title: string;
  blurb: string;
}) {
  const { mode, bilingual } = useStudyPrefs();
  const [nonce, setNonce] = useState(0);

  // Fully offline: sample study material is built locally, so it renders instantly.
  const payload = useMemo(
    () => getMockMaterial(kind, { chapterName, mode, language, bilingual }),
    [kind, chapterName, mode, language, bilingual, nonce],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{blurb}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="ml-auto"
          onClick={() => setNonce((n) => n + 1)}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="panel p-6">
        {kind === "notes" ? <Notes payload={payload as NotesPayload} /> : null}
        {kind === "practice" ? <Practice payload={payload as PracticePayload} /> : null}
        {kind === "pyq" ? <Pyq payload={payload as PyqPayload} /> : null}
        {kind === "resources" ? <Resources payload={payload as ResourcesPayload} /> : null}
      </div>
    </section>
  );
}


function Notes({ payload }: { payload: NotesPayload }) {
  return (
    <div className="space-y-6">
      <Markdown content={payload.markdown ?? ""} />
      {payload.keyTerms?.length ? (
        <div>
          <h3 className="font-display text-lg font-semibold">Key terms</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {payload.keyTerms.map((t, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <dt className="text-sm font-semibold text-lime">{t.term}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

function Practice({ payload }: { payload: PracticePayload }) {
  return (
    <Accordion type="multiple" className="w-full">
      {(payload.questions ?? []).map((q, i) => (
        <AccordionItem key={i} value={`q-${i}`}>
          <AccordionTrigger className="text-left">
            <span>
              <span className="mr-2 rounded bg-surface-2 px-1.5 py-0.5 text-xs uppercase text-muted-foreground">
                {q.level}
              </span>
              {q.question}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            {q.hint ? <p className="text-sm text-amber">Hint: {q.hint}</p> : null}
            <Markdown content={q.solution ?? ""} />
            {q.topic ? <p className="text-xs text-muted-foreground">Topic: {q.topic}</p> : null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function Pyq({ payload }: { payload: PyqPayload }) {
  return (
    <Accordion type="multiple" className="w-full">
      {(payload.questions ?? []).map((q, i) => (
        <AccordionItem key={i} value={`pyq-${i}`}>
          <AccordionTrigger className="text-left">
            <span>
              <span className="mr-2 rounded bg-surface-2 px-1.5 py-0.5 text-xs text-muted-foreground">
                {q.year} · {q.marks}
              </span>
              {q.question}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            <Markdown content={q.solution ?? ""} />
            {q.topic ? <p className="text-xs text-muted-foreground">Topic: {q.topic}</p> : null}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function Resources({ payload }: { payload: ResourcesPayload }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {(payload.videos ?? []).map((v, i) => (
          <a
            key={i}
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.searchQuery ?? v.title)}`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl border border-border p-4 transition-colors hover:bg-surface-2"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Youtube className="size-4 text-destructive" />
              {v.title}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{v.channel}</p>
            <p className="mt-2 text-sm text-muted-foreground">{v.why}</p>
          </a>
        ))}
      </div>
      {payload.readings?.length ? (
        <div>
          <h3 className="font-display text-lg font-semibold">Reading suggestions</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {payload.readings.map((r, i) => (
              <li key={i}>
                <span className="font-medium text-foreground">{r.title}</span> — {r.note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
