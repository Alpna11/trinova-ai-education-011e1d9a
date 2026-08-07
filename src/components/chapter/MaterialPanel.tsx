import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, Youtube } from "lucide-react";
import { getChapterMaterial } from "@/lib/chapter.functions";
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
  chapterId,
  kind,
  language,
  title,
  blurb,
}: {
  chapterId: string;
  kind: MaterialKind;
  language: string;
  title: string;
  blurb: string;
}) {
  const { mode, bilingual } = useStudyPrefs();
  const load = useServerFn(getChapterMaterial);

  const query = useQuery({
    queryKey: ["chapter-material", chapterId, kind, mode, bilingual, language],
    queryFn: () =>
      load({ data: { chapterId, kind, mode, language, bilingual } }).then((r) => r.payload),
    staleTime: 5 * 60_000,
  });

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
          disabled={query.isFetching}
          onClick={() => query.refetch()}
        >
          {query.isFetching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Regenerate
        </Button>
      </div>

      {query.isPending ? (
        <div className="panel flex items-center gap-3 p-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-lime" /> Building your {title.toLowerCase()}…
        </div>
      ) : query.error ? (
        <div className="panel p-6 text-sm text-destructive">
          {query.error instanceof Error ? query.error.message : "Could not load this material."}
        </div>
      ) : query.data ? (
        <div className="panel p-6">
          {kind === "notes" ? <Notes payload={query.data as NotesPayload} /> : null}
          {kind === "practice" ? <Practice payload={query.data as PracticePayload} /> : null}
          {kind === "pyq" ? <Pyq payload={query.data as PyqPayload} /> : null}
          {kind === "resources" ? <Resources payload={query.data as ResourcesPayload} /> : null}
        </div>
      ) : null}
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
