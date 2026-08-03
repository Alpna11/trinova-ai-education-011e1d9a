export type TutorMode = "simple" | "standard" | "advanced";

export const TUTOR_MODES: { id: TutorMode; label: string; blurb: string }[] = [
  { id: "simple", label: "Simple", blurb: "Plain words, everyday examples" },
  { id: "standard", label: "Standard", blurb: "Exam-ready, textbook depth" },
  { id: "advanced", label: "Advanced", blurb: "Deeper theory and edge cases" },
];

export const SECOND_LANGUAGES = [
  "Hindi",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Gujarati",
  "Punjabi",
  "Odia",
  "Urdu",
  "Assamese",
] as const;

export type AppRole = "student" | "teacher" | "parent" | "admin";

export const ROLE_LABELS: Record<AppRole, string> = {
  student: "Student",
  teacher: "Teacher",
  parent: "Parent",
  admin: "Admin",
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  topic?: string | undefined;
};

export const ACHIEVEMENTS: { code: string; label: string; hint: string; xp: number }[] = [
  { code: "first_lesson", label: "First Spark", hint: "Finish your first AI explanation", xp: 20 },
  { code: "first_quiz", label: "Quiz Rookie", hint: "Complete your first quiz", xp: 30 },
  { code: "perfect_quiz", label: "Flawless", hint: "Score 100% on a quiz", xp: 60 },
  { code: "doubt_solver", label: "Doubt Slayer", hint: "Get a question solved step by step", xp: 25 },
  { code: "five_records", label: "Consistent", hint: "Save 5 items to your learning record", xp: 40 },
  { code: "bilingual", label: "Bilingual Brain", hint: "Learn something in your second language", xp: 35 },
];

export const XP_PER_LEVEL = 250;

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

export function masteryLabel(mastery: number) {
  if (mastery >= 80) return "Strong";
  if (mastery >= 55) return "Getting there";
  if (mastery >= 30) return "Shaky";
  return "Needs work";
}
