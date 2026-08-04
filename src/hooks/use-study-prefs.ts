import { createLocalStore } from "@/lib/local-store";
import type { TutorMode } from "@/lib/edunova";

const modeStore = createLocalStore<TutorMode>("edunova.mode", "standard");
const bilingualStore = createLocalStore<boolean>("edunova.bilingual", false);

/** Tutor depth + bilingual toggle, shared across every chapter panel. */
export function useStudyPrefs() {
  const [mode, setMode] = modeStore.useStore();
  const [bilingual, setBilingual] = bilingualStore.useStore();
  return { mode, setMode, bilingual, setBilingual };
}
