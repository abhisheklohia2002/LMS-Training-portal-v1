import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("lms_theme");

    if (saved === "dark" || saved === "light") {
      return saved;
    }

    return "light";
  });

  const isDarkMode = mode === "dark";

  useEffect(() => {
    localStorage.setItem("lms_theme", mode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [mode, isDarkMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDarkMode,
      toggleTheme: () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
      },
      setThemeMode: setMode,
    }),
    [mode, isDarkMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeProvider");
  }

  return context;
}