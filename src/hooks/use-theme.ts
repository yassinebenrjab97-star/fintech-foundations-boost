import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const initial = (): Theme => {
  const s = localStorage.getItem("theme");
  if (s === "light" || s === "dark") return s;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};
document.documentElement.classList.toggle("dark", initial() === "dark");

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    setTheme(next);
  };
  return { theme, toggle };
}
