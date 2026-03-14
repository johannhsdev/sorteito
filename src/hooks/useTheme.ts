import { useState, useEffect, useCallback } from "react";

type Theme = "dark" | "light";

interface UseTheme {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const STORAGE_KEY = "evalia-theme";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "dark";
}

export function useTheme(): UseTheme {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return {
    theme,
    toggleTheme,
    isDark: theme === "dark",
  };
}
