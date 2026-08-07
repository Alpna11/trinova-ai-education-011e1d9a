/**
 * Offline sample content.
 *
 * The whole app runs on this module instead of live AI calls: every tab
 * (Notes, AI tutor, Practice, Quiz, Previous year, Videos) is served from
 * hardcoded, real-looking study material. No network, no quotas, instant load.
 */
import type {
  MaterialKind,
  MaterialPayload,
  NotesPayload,
  PracticePayload,
  PyqPayload,
  ResourcesPayload,
} from "./chapter.schemas";
import type { QuizQuestion } from "./edunova";

type Mode = "simple" | "standard" | "advanced";

export type MockOpts = {
  chapterName: string;
  mode: Mode | string;
  language: string;
  bilingual: boolean;
};

function bi(text: string, opts: MockOpts) {
  if (!opts.bilingual) return text;
  return `${text}\n\n_${opts.language}: ${text}_`;
}

const DEPTH: Record<string, string> = {
  simple: "Plain-language walkthrough with everyday examples.",
  standard: "Exam-ready depth matching your textbook chapter.",
  advanced: "Deeper theory, proofs and edge cases beyond the textbook.",
};

/* ------------------------------------------------------------------ */
/* Curated chapter: Relations and Functions                            */
/* ------------------------------------------------------------------ */

const RELATIONS_NOTES: NotesPayload = {
  markdown: `## What this chapter is about
A **relation** links elements of one set to another. A **function** is a special relation where every input has exactly one output.

- A relation R from A to B is any subset of the cartesian product A × B.
- A function f: A → B assigns to each a ∈ A one and only one f(a) ∈ B.
- The set A is the **domain**, B is the **codomain**, and { f(a) : a ∈ A } is the **range**.

## Types of relations
- **Reflexive:** (a, a) ∈ R for every a ∈ A.
- **Symmetric:** (a, b) ∈ R ⇒ (b, a) ∈ R.
- **Transitive:** (a, b) ∈ R and (b, c) ∈ R ⇒ (a, c) ∈ R.
- **Equivalence relation:** reflexive **and** symmetric **and** transitive. It splits the set into disjoint equivalence classes.

## Types of functions
- **One-one (injective):** f(x1) = f(x2) ⇒ x1 = x2.
- **Onto (surjective):** range = codomain.
- **Bijective:** one-one and onto, so f has an inverse f^-1.
- **Composition:** (g ∘ f)(x) = g(f(x)); it is associative but not commutative.

## Worked example
Let f: R → R, f(x) = 2x + 3. Show f is bijective and find f^-1.

1. **One-one:** if 2x1 + 3 = 2x2 + 3 then 2x1 = 2x2, so x1 = x2.
2. **Onto:** for any y ∈ R take x = (y - 3)/2; then f(x) = y.
3. So f is bijective and f^-1(y) = (y - 3)/2.

## Quick recap
- Every function is a relation, but not every relation is a function.
- Equivalence relations need all three properties — check each one separately.
- Only bijective functions have inverses, and f^-1(f(x)) = x.`,
  keyTerms: [
    { term: "Relation", meaning: "Any subset of A × B pairing elements of A with elements of B." },
    { term: "Function", meaning: "A relation where each input maps to exactly one output." },
    { term: "Domain", meaning: "The set of all allowed inputs of the function." },
    { term: "Range", meaning: "The set of outputs actually produced by the function." },
    { term: "Equivalence relation", meaning: "Reflexive, symmetric and transitive at the same time." },
    { term: "Bijection", meaning: "A function that is both one-one and onto, so it is invertible." },
  ],
};

const RELATIONS_PRACTICE: PracticePayload = {
  questions: [
    {
      question: "If A = {1, 2, 3}, how many relations can be defined from A to A?",
      level: "easy",
      hint: "A relation is any subset of A × A.",
      solution: "1. A × A has 3 × 3 = 9 ordered pairs.\n2. Number of subsets = 2^9.\n3. So 512 relations exist.",
      topic: "Counting relations",
    },
    {
      question: "Check whether R = {(a, b) : a - b is divisible by 3} on Z is an equivalence relation.",
      level: "medium",
      hint: "Test reflexive, symmetric and transitive separately.",
      solution:
        "1. a - a = 0 is divisible by 3, so reflexive.\n2. If 3 | (a - b) then 3 | (b - a), so symmetric.\n3. If 3 | (a - b) and 3 | (b - c) then 3 | (a - c), so transitive.\n4. Hence R is an equivalence relation.",
      topic: "Equivalence relations",
    },
    {
      question: "Show that f: R → R, f(x) = x^2 is neither one-one nor onto.",
      level: "medium",
      hint: "Try x = 2 and x = -2, then look for a negative output.",
      solution:
        "1. f(2) = f(-2) = 4 with 2 ≠ -2, so not one-one.\n2. f(x) ≥ 0 always, so -1 has no pre-image.\n3. Therefore f is neither injective nor surjective.",
      topic: "One-one and onto",
    },
    {
      question: "If f(x) = 3x + 1 and g(x) = x^2, find (f ∘ g)(2) and (g ∘ f)(2).",
      level: "easy",
      hint: "Work from the inside out.",
      solution:
        "1. (f ∘ g)(2) = f(4) = 13.\n2. (g ∘ f)(2) = g(7) = 49.\n3. The two differ, showing composition is not commutative.",
      topic: "Composition",
    },
    {
      question: "Find the inverse of f: R → R given by f(x) = (4x + 5)/3.",
      level: "medium",
      hint: "Set y = f(x) and solve for x.",
      solution:
        "1. y = (4x + 5)/3 ⇒ 3y = 4x + 5.\n2. x = (3y - 5)/4.\n3. So f^-1(x) = (3x - 5)/4.",
      topic: "Inverse functions",
    },
    {
      question:
        "Let A = {1, 2, 3, 4}. How many one-one functions from A to A are also onto, and why?",
      level: "hard",
      hint: "On a finite set of equal size, one-one and onto coincide.",
      solution:
        "1. A one-one map on a finite set of size 4 uses all 4 outputs, so it is automatically onto.\n2. Such maps are permutations of A.\n3. Their number is 4! = 24.",
      topic: "Bijections on finite sets",
    },
  ],
};

const RELATIONS_PYQ: PyqPayload = {
  questions: [
    {
      year: "2024 (representative)",
      marks: "3 marks",
      question: "Show that the relation R on Z defined by R = {(a, b) : 2 divides (a - b)} is an equivalence relation.",
      solution:
        "a - a = 0 is even (reflexive); if a - b is even so is b - a (symmetric); the sum of two even numbers is even, giving transitivity. Hence R is an equivalence relation with two classes: even and odd integers.",
      topic: "Equivalence relations",
    },
    {
      year: "2023 (representative)",
      marks: "4 marks",
      question: "Let f: R → R be f(x) = 4x + 3. Show that f is invertible and find f^-1.",
      solution:
        "f is one-one since 4x1 + 3 = 4x2 + 3 gives x1 = x2, and onto since x = (y - 3)/4 works for every y. So f is bijective and f^-1(y) = (y - 3)/4.",
      topic: "Inverse functions",
    },
    {
      year: "2023 (representative)",
      marks: "2 marks",
      question: "If f(x) = x + 7 and g(x) = x - 7, find (f ∘ g)(7).",
      solution: "g(7) = 0 and f(0) = 7, so (f ∘ g)(7) = 7. The two functions are inverses of each other.",
      topic: "Composition",
    },
    {
      year: "2022 (representative)",
      marks: "3 marks",
      question: "State with reason whether f: N → N, f(x) = 2x is onto.",
      solution:
        "It is one-one but not onto: odd natural numbers such as 3 have no pre-image because 2x is always even. Hence f is injective only.",
      topic: "Onto functions",
    },
    {
      year: "2022 (representative)",
      marks: "5 marks",
      question:
        "Let A = R - {3} and B = R - {1}. Show that f: A → B, f(x) = (x - 2)/(x - 3) is bijective.",
      solution:
        "Cross-multiplying f(x1) = f(x2) gives x1 = x2, so f is one-one. Solving y = (x - 2)/(x - 3) gives x = (3y - 2)/(y - 1), defined for all y ≠ 1, so f is onto B. Hence f is bijective.",
      topic: "Bijective functions",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Generic templates for every other chapter                           */
/* ------------------------------------------------------------------ */

function genericNotes(o: MockOpts): NotesPayload {
  const c = o.chapterName;
  return {
    markdown: `## Big idea
**${c}** is built on a small set of core definitions that every exam question reuses. ${DEPTH[String(o.mode)] ?? DEPTH["standard"]}

- Start from the definitions and the standard notation used in your textbook.
- Learn the two or three formulas/statements that most questions depend on.
- Practise translating a word problem into those symbols before solving.

## Core points to remember
- Write down what is **given** and what is **asked** before you begin.
- Every result in ${c} has a condition attached — state it when you use it.
- Units, signs and special cases are where most marks are lost.

## Worked example
A typical ${c} question gives you the known quantities and asks for one unknown.

1. List the given data and the required quantity.
2. Pick the standard result of ${c} that connects them.
3. Substitute carefully and simplify step by step.
4. Check the answer against a rough estimate or a special case.

## Quick recap
- Definitions first, formulas second, arithmetic last.
- Show every step — method marks are given for the reasoning.
- Revise the worked example above before attempting the quiz tab.`,
    keyTerms: [
      { term: `${c} — definition`, meaning: `The precise textbook statement that opens the chapter.` },
      { term: "Given data", meaning: "The quantities or facts supplied by the question." },
      { term: "Standard result", meaning: `The main formula or theorem of ${c} used in most problems.` },
      { term: "Condition of validity", meaning: "The assumption under which the standard result holds." },
      { term: "Special case", meaning: "A boundary value where the general result behaves differently." },
      { term: "Verification", meaning: "A quick sanity check of the final answer." },
    ],
  };
}

function genericPractice(o: MockOpts): PracticePayload {
  const c = o.chapterName;
  const levels = ["easy", "easy", "medium", "medium", "hard", "hard"];
  return {
    questions: levels.map((level, i) => ({
      question: `${i + 1}. State the key definition of ${c} and apply it to a short ${level} case from your textbook exercise.`,
      level,
      hint: `Write the definition of ${c} first, then substitute the given values.`,
      solution: `1. Write the definition/standard result of ${c}.\n2. List the given quantities from the question.\n3. Substitute and simplify carefully.\n4. State the answer with units and check a special case.`,
      topic: `${c} basics`,
    })),
  };
}

function genericPyq(o: MockOpts): PyqPayload {
  const c = o.chapterName;
  const years = ["2024", "2023", "2023", "2022", "2021"];
  const marks = ["2 marks", "3 marks", "3 marks", "4 marks", "5 marks"];
  return {
    questions: years.map((year, i) => ({
      year: `${year} (representative)`,
      marks: marks[i] ?? "3 marks",
      question: `Board-style question ${i + 1} on ${c}: state the relevant result and use it to solve a standard exercise from this chapter.`,
      solution: `Quote the standard result of ${c}, substitute the given data, and simplify. Mention the condition under which the result applies to secure the reasoning mark.`,
      topic: `${c} — exam pattern`,
    })),
  };
}

function genericResources(o: MockOpts): ResourcesPayload {
  const c = o.chapterName;
  return {
    videos: [
      {
        title: `${c} — full chapter in one shot`,
        channel: "Physics Wallah",
        searchQuery: `${c} one shot class lecture`,
        why: "Covers the whole chapter end to end before revision.",
      },
      {
        title: `${c} explained from basics`,
        channel: "Khan Academy India",
        searchQuery: `${c} basics explained`,
        why: "Slow, concept-first build-up if the topic feels new.",
      },
      {
        title: `${c} — solved exercise questions`,
        channel: "Magnet Brains",
        searchQuery: `${c} ncert exercise solutions`,
        why: "Walks through textbook exercises step by step.",
      },
      {
        title: `${c} — most expected board questions`,
        channel: "Vedantu",
        searchQuery: `${c} important board exam questions`,
        why: "Focused revision of frequently repeated questions.",
      },
    ],
    readings: [
      { title: `Textbook chapter: ${c}`, note: "Read the definitions and every solved example once." },
      { title: `Exemplar problems — ${c}`, note: "Attempt the higher-order questions after the basics." },
      { title: `Formula sheet — ${c}`, note: "Write the key results on one page for last-minute revision." },
    ],
  };
}

const CURATED: Record<string, Partial<Record<MaterialKind, MaterialPayload>>> = {
  "relations and functions": {
    notes: RELATIONS_NOTES,
    practice: RELATIONS_PRACTICE,
    pyq: RELATIONS_PYQ,
  },
};

function withBilingual(payload: MaterialPayload, opts: MockOpts): MaterialPayload {
  if (!opts.bilingual) return payload;
  if ("markdown" in payload) {
    return { ...payload, markdown: `${payload.markdown}\n\n---\n\n_${opts.language} note: the same explanation is available in ${opts.language} in your offline sample pack._` };
  }
  return payload;
}

/** Returns hardcoded material for a chapter tab. Always instant, never fails. */
export function getMockMaterial(kind: MaterialKind, opts: MockOpts): MaterialPayload {
  const curated = CURATED[opts.chapterName.trim().toLowerCase()]?.[kind];
  if (curated) return withBilingual(curated, opts);
  const fallback: Record<MaterialKind, MaterialPayload> = {
    notes: genericNotes(opts),
    practice: genericPractice(opts),
    pyq: genericPyq(opts),
    resources: genericResources(opts),
  };
  return withBilingual(fallback[kind], opts);
}

/* ------------------------------------------------------------------ */
/* Quiz                                                                */
/* ------------------------------------------------------------------ */

const RELATIONS_QUIZ: QuizQuestion[] = [
  {
    question: "A relation from A to B is best described as:",
    options: ["Any subset of A × B", "Any element of A", "A rule with one output per input", "The union A ∪ B"],
    answerIndex: 0,
    explanation: "By definition a relation is simply a subset of the cartesian product A × B.",
    topic: "Definition of relation",
  },
  {
    question: "Which property must an equivalence relation NOT necessarily have?",
    options: ["Reflexive", "Symmetric", "Transitive", "Antisymmetric"],
    answerIndex: 3,
    explanation: "Equivalence relations are reflexive, symmetric and transitive; antisymmetry belongs to partial orders.",
    topic: "Equivalence relations",
  },
  {
    question: "f: R → R, f(x) = x^3 is:",
    options: ["One-one but not onto", "Onto but not one-one", "Bijective", "Neither one-one nor onto"],
    answerIndex: 2,
    explanation: "x^3 is strictly increasing (one-one) and takes every real value (onto), so it is bijective.",
    topic: "One-one and onto",
  },
  {
    question: "If f(x) = 2x and g(x) = x + 3, then (g ∘ f)(1) equals:",
    options: ["5", "8", "6", "2"],
    answerIndex: 0,
    explanation: "f(1) = 2, then g(2) = 5.",
    topic: "Composition",
  },
  {
    question: "A function f: A → B has an inverse only if f is:",
    options: ["Reflexive", "Bijective", "Onto only", "One-one only"],
    answerIndex: 1,
    explanation: "An inverse exists exactly when f is both one-one and onto, i.e. bijective.",
    topic: "Inverse functions",
  },
];

function genericQuiz(chapterName: string, count: number): QuizQuestion[] {
  const base: QuizQuestion[] = [
    {
      question: `Which step should come first when solving a ${chapterName} question?`,
      options: [
        "List the given data and what is asked",
        "Guess the answer",
        "Substitute random values",
        "Write the final answer",
      ],
      answerIndex: 0,
      explanation: "Identifying the given data and the required quantity keeps the method marks safe.",
      topic: `${chapterName} method`,
    },
    {
      question: `In ${chapterName}, a standard result can be used only when:`,
      options: [
        "Its stated condition is satisfied",
        "The numbers are small",
        "The question says so",
        "Never — results are optional",
      ],
      answerIndex: 0,
      explanation: "Every result carries a validity condition; quoting it earns the reasoning mark.",
      topic: `${chapterName} conditions`,
    },
    {
      question: `Most marks in ${chapterName} questions are lost because of:`,
      options: ["Sign, unit and special-case slips", "Neat handwriting", "Using a formula", "Showing steps"],
      answerIndex: 0,
      explanation: "Careless signs, missing units and ignored special cases are the usual culprits.",
      topic: `${chapterName} common errors`,
    },
    {
      question: `The best final check for a ${chapterName} answer is to:`,
      options: [
        "Verify with an estimate or special case",
        "Rewrite the question",
        "Erase the working",
        "Change the formula",
      ],
      answerIndex: 0,
      explanation: "A quick estimate or boundary case catches arithmetic mistakes fast.",
      topic: `${chapterName} verification`,
    },
    {
      question: `Before attempting hard ${chapterName} problems you should master:`,
      options: ["The definitions and worked examples", "Only the answers", "The chapter title", "Nothing"],
      answerIndex: 0,
      explanation: "Hard problems are combinations of the basic definitions and worked examples.",
      topic: `${chapterName} basics`,
    },
  ];
  const out: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) out.push(base[i % base.length]!);
  return out;
}

/** Returns a hardcoded quiz for the chapter. */
export function getMockQuiz(opts: MockOpts & { count: number }): QuizQuestion[] {
  const curated =
    opts.chapterName.trim().toLowerCase().includes("relations and functions") ? RELATIONS_QUIZ : null;
  const list = curated ?? genericQuiz(opts.chapterName, opts.count);
  return list.slice(0, opts.count).map((q) => ({
    ...q,
    question: opts.bilingual ? `${q.question}\n(${opts.language}) ${q.question}` : q.question,
  }));
}

/* ------------------------------------------------------------------ */
/* Tutor + doubt solver                                                */
/* ------------------------------------------------------------------ */

export function getMockTutorAnswer(opts: MockOpts & { question: string }): string {
  const c = opts.chapterName;
  return bi(
    `## Your question
${opts.question}

## Short answer
${DEPTH[String(opts.mode)] ?? DEPTH["standard"]} In **${c}**, start from the definition and apply the standard result of the chapter to the data you are given.

## Step-by-step
1. Write down what the question gives you and what it asks for.
2. Recall the definition/standard result of ${c} that links them.
3. Substitute the given values and simplify one line at a time.
4. State the final answer clearly, with units or the required form.

## Example
If the question asks you to test a property (one-one, onto, reflexive, symmetric…), check it on the definition directly: assume the hypothesis, and either derive the conclusion or produce one counterexample.

## Where students slip up
- Skipping the condition under which the result is valid.
- Mixing up "for all" and "there exists" while writing the proof.
- Not verifying the answer with a simple special case.`,
    opts,
  );
}

export function getMockSolution(opts: {
  mode: Mode | string;
  language: string;
  bilingual: boolean;
  text?: string;
  fileName?: string;
}): string {
  const subject = opts.text?.trim() || opts.fileName || "your uploaded question";
  const body = `## Question
${subject}

## Given
- The quantities and conditions stated in the question above.
- The standard results of the relevant chapter.

## Step-by-step solution
1. Restate the question in symbols and note what has to be found.
2. Choose the standard result that connects the given data to the unknown.
3. Substitute the values and simplify, one operation per line.
4. Solve for the unknown and simplify to the required form.
5. Verify by putting the answer back into the original condition.

## Final answer
**Follow steps 1-5 above with your numbers — the method shown gives the complete marks scheme for this question type.**

## Where students slip up
- Dropping a negative sign while transposing terms.
- Forgetting units or leaving the answer unsimplified.
- Not checking whether the special/boundary case applies.`;
  return opts.bilingual ? `${body}\n\n---\n\n_${opts.language}: the same solution steps apply; translate each step as you write._` : body;
}
