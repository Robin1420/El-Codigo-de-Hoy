import { useEffect, useState } from "react";
import { ThemeToggle } from "../ui/ThemeToggle";
import logowhite from "../../assets/Bytezon_whit.png";
import logoblack from "../../assets/Bytezon_black.png";

export default function PublicHeader() {
  const [theme, setTheme] = useState("light");
  const [today] = useState(() => new Date());

  useEffect(() => {
    const docEl = document.documentElement;
    const current = docEl.classList.contains("dark") ? "dark" : "light";
    setTheme(current);

    const observer = new MutationObserver(() => {
      const next = docEl.classList.contains("dark") ? "dark" : "light";
      setTheme(next);
    });

    observer.observe(docEl, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const logoSrc = theme === "dark" ? logowhite : logoblack;
  const weekday = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(today);
  const fullDate = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  return (
    <header className="w-full grid grid-cols-1 items-center gap-4 sm:grid-cols-[auto_1fr_auto] sm:gap-6">
      <div className="flex flex-col items-center sm:items-start justify-center">
        <img
          src={logoSrc}
          alt="El Código de Hoy"
          className="w-[20%] sm:w-[120px] min-w-[64px] max-w-[140px] h-auto object-contain"
        />
        <div className="mt-2 text-left">
          <p className="text-lg font-semibold text-[var(--text-color)] capitalize">{weekday}</p>
          <p className="text-sm text-[var(--subtle-text)] capitalize">{fullDate}</p>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--subtle-text)]">
          El Código de Hoy
        </p>
        <h1 className="text-4xl font-bold">Bienvenido a El Código de Hoy</h1>
        <p className="text-[var(--subtle-text)] max-w-3xl mx-auto">
          Noticias y análisis diarios de tecnología y TI, curados para la comunidad.
        </p>
      </div>
      <div className="flex justify-center sm:justify-end">
        <ThemeToggle />
      </div>
    </header>
  );
}
