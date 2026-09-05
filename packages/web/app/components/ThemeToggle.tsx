"use client";

import { useTheme } from "./ThemeContext";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-md border border-(--border-color) bg-(--card-bg) text-(--foreground) hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunIcon className="w-4 h-4 text-neutral-300" />
      ) : (
        <MoonIcon className="w-4 h-4 text-neutral-800" />
      )}
    </button>
  );
}
