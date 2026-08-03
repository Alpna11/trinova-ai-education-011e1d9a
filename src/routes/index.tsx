import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  FileUp,
  Languages,
  LineChart,
  PlayCircle,
  Sparkles,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Edunova — Your AI tutor, chapter by chapter" },
      {
        name: "description",
        content:
          "Pick your board, class, subject and chapter. Learn with an AI tutor in simple, standard or advanced mode, upload doubts as text, image or PDF, and pick up exactly where you left off.",
      },
      { property: "og:title", content: "Edunova — Your AI tutor, chapter by chapter" },
      {
        property: "og:description",
        content:
          "Bilingual AI tutoring, step-by-step doubt solving, quizzes, progress dashboards and a Continue learning button that remembers you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Three explanation modes",
    body: "Simple for the first pass, Standard for exams, Advanced when you want the deeper why.",
  },
  {
    icon: Languages,
    title: "Bilingual on demand",
    body: "Flip any explanation into your regional language — same depth, natural phrasing.",
  },
  {
    icon: FileUp,
    title: "Upload any doubt",
    body: "Type it, snap a photo, or drop a PDF. You get a transcribed, step-by-step solution.",
  },
  {
    icon: LineChart,
    title: "Weak topics, surfaced",
    body: "Quiz results feed a mastery score per chapter so revision starts where it hurts.",
  },
  {
    icon: Trophy,
    title: "Streaks and badges",
    body: "XP, levels and achievements that reward showing up, not just finishing.",
  },
  {
    icon: PlayCircle,
    title: "Continue learning",
    body: "One button on your dashboard drops you back into the exact chapter you left.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-20 max-w-6xl items-center px-5">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="font-display text-xl font-bold">Edunova</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/auth"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="hero-bg">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-lime">
            <Sparkles className="size-3.5" /> Built for learners, not demos
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] md:text-6xl">
            An AI tutor that knows <span className="text-gradient-lime">your chapter</span>, your
            language, and where you stopped.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Choose your board, class, subject and chapter. Ask anything — typed, photographed or as a
            PDF. Get explanations at your level, quizzes that expose weak topics, and a learning
            record you can revisit any time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="glow inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Start learning free <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 font-semibold text-foreground transition-colors hover:bg-surface-2"
            >
              I already have an account
            </Link>
          </div>

          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-4">
            {[
              ["3", "explanation modes"],
              ["2", "languages per answer"],
              ["1", "tap to continue"],
            ].map(([value, label]) => (
              <div key={label} className="panel px-4 py-4">
                <dt className="font-display text-3xl font-bold text-lime">{value}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-3xl font-bold">Everything a study session needs</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          One place for explanations, doubts, quizzes and progress — with teachers able to publish
          notes and watch analytics.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="panel p-6 transition-transform hover:-translate-y-1">
              <span className="grid size-10 place-items-center rounded-xl bg-lime-soft text-lime">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="panel hero-bg flex flex-col items-start gap-6 p-10 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold">Ready when you are</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Create an account as a student, teacher or parent. Your progress, doubts and quizzes
              stay saved to your account.
            </p>
          </div>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            Create your account <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Edunova — AI-powered learning for boards, classes and chapters.
      </footer>
    </div>
  );
}
