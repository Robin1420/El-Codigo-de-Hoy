import { useEffect, useState, useMemo } from "react";

export function ThemeToggle({ className = "", style = {} }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const isDark = theme === "dark";

  const handleToggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const knobTransform = useMemo(() => (isDark ? "translateX(127px)" : "translateX(0)"), [isDark]);

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex items-center justify-center rounded-full transition-colors border border-[var(--border-color)] ${className}`}
      style={{
        backgroundColor: isDark ? "#1f2026" : "#e7e7e9",
        color: isDark ? "#f1f1f2" : "#1f1f1f",
        width: "170px",
        height: "40px",
        overflow: "hidden",
        ...style,
      }}
      aria-label="Cambiar tema"
    >
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tracking-wide pointer-events-none">
        {isDark ? "Oscuro" : "Claro"}
      </span>
      <span
        className="absolute inset-y-1 left-1 flex items-center justify-center w-[32px] rounded-full border shadow-sm transition-transform duration-300 ease-in-out"
        style={{
          transform: knobTransform,
          backgroundColor: isDark ? "#2C2C32" : "#ffffff",
          color: isDark ? "#f8fafc" : "#1f1f1f",
          borderColor: isDark ? "#3a3a42" : "var(--border-color)",
        }}
      >
        {isDark ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.656L6.05 7.05m9.9 9.9 1.414 1.414" />
          </svg>
        )}
      </span>
    </button>
  );
}
