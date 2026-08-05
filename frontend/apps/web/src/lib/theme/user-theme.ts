"use client";

export type UserTheme = "dark" | "light";

export const userThemeStorageKey = "vy-user-theme";
const lightThemeClass = "vy-light";

const isUserTheme = (value: string | null): value is UserTheme =>
  value === "dark" || value === "light";

export function readUserTheme(): UserTheme {
  if (typeof window === "undefined") return "dark";

  try {
    const storedTheme = window.localStorage.getItem(userThemeStorageKey);
    if (isUserTheme(storedTheme)) return storedTheme;
  } catch {
    // Keep the dark default when storage is unavailable.
  }

  return document.documentElement.classList.contains(lightThemeClass) ? "light" : "dark";
}

export function applyUserTheme(theme: UserTheme) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle(lightThemeClass, theme === "light");
  document.documentElement.style.colorScheme = theme;
}

export function storeUserTheme(theme: UserTheme) {
  try {
    window.localStorage.setItem(userThemeStorageKey, theme);
  } catch {
    // Theme should still apply for the current page when storage is unavailable.
  }

  applyUserTheme(theme);
}

export function syncUserThemeFromStorage() {
  applyUserTheme(readUserTheme());
}
