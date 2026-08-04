import { useEffect } from "react";
import { createLocalStore } from "@/lib/local-store";

export type Theme = "dark" | "light";

const themeStore = createLocalStore<Theme>("edunova.theme", "dark");

/** Dark/light theme, persisted and applied to <html>. */
export function useTheme() {
  const [theme, setTheme] = themeStore.useStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  return {
    theme,
    setTheme,
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
